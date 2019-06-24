/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {APIClient} from '@wireapp/api-client';
import {LoginData} from '@wireapp/api-client/dist/commonjs/auth/';
import {ClientClassification, ClientType, RegisteredClient} from '@wireapp/api-client/dist/commonjs/client/';
import {CONVERSATION_TYPING} from '@wireapp/api-client/dist/commonjs/event/';
import {BackendErrorLabel, StatusCode} from '@wireapp/api-client/dist/commonjs/http/';
import {Account} from '@wireapp/core';
import {AvailabilityType} from '@wireapp/core/dist/broadcast/';
import {ClientInfo} from '@wireapp/core/dist/client/';
import {PayloadBundle, PayloadBundleType, ReactionType} from '@wireapp/core/dist/conversation/';
import {
  ClearedContent,
  ConfirmationContent,
  DeletedContent,
  EditedTextContent,
  FileContent,
  FileMetaDataContent,
  HiddenContent,
  ImageContent,
  LegalHoldStatus,
  LinkPreviewContent,
  LocationContent,
  MentionContent,
  QuoteContent,
  TextContent,
} from '@wireapp/core/dist/conversation/content/';
import {LRUCache, NodeMap} from '@wireapp/lru-cache';
import {MemoryEngine} from '@wireapp/store-engine';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine/';
import * as logdown from 'logdown';
import UUID from 'pure-uuid';

import {BackendData} from '@wireapp/api-client/dist/commonjs/env/';
import {Confirmation} from '@wireapp/protocol-messaging';
import {formatDate, isAssetContent, stripAsset, stripLinkPreview} from './utils';

const {version}: {version: string} = require('../package.json');

const logger = logdown('@wireapp/wire-web-ets/InstanceService', {
  logger: console,
  markdown: false,
});

type ConfirmationWithSender = ConfirmationContent & {from: string};

type MessagePayload = PayloadBundle & {
  confirmations?: ConfirmationWithSender[];
};

export interface Instance {
  account: Account;
  backendType: BackendData;
  client: APIClient;
  engine: CRUDEngine;
  id: string;
  messages: LRUCache<MessagePayload>;
  name: string;
}

export interface InstanceCreationOptions {
  backend?: string;
  customBackend?: BackendData;
  deviceClass?: string;
  deviceLabel?: string;
  deviceName?: string;
  instanceName?: string;
  loginData: LoginData;
}

export class InstanceService {
  private readonly cachedInstances: LRUCache<Instance>;

  constructor(private readonly maximumInstances = 100) {
    this.cachedInstances = new LRUCache(this.maximumInstances);
  }

  private attachListeners(account: Account, instance: Instance): void {
    account.on('error', error => logger.error(`[${formatDate()}]`, error));

    account.on(PayloadBundleType.TEXT, (payload: PayloadBundle) => {
      const linkPreviewContent = payload.content as TextContent;
      if (linkPreviewContent.linkPreviews) {
        linkPreviewContent.linkPreviews.forEach(preview => {
          stripLinkPreview(preview);
        });
      }
      instance.messages.set(payload.id, payload);
    });

    account.on(PayloadBundleType.ASSET, (payload: PayloadBundle) => {
      const metaPayload = instance.messages.get(payload.id);
      if (metaPayload && isAssetContent(payload.content) && isAssetContent(metaPayload.content)) {
        payload.content.original = metaPayload.content.original;
      }
      stripAsset(payload.content);
      instance.messages.set(payload.id, payload);
    });

    account.on(PayloadBundleType.ASSET_META, (payload: PayloadBundle) => {
      instance.messages.set(payload.id, payload);
    });

    account.on(PayloadBundleType.ASSET_IMAGE, (payload: PayloadBundle) => {
      instance.messages.set(payload.id, payload);
    });

    account.on(PayloadBundleType.MESSAGE_EDIT, (payload: PayloadBundle) => {
      const editedContent = payload.content as EditedTextContent;
      instance.messages.set(payload.id, payload);
      instance.messages.delete(editedContent.originalMessageId);
    });

    account.on(PayloadBundleType.CLEARED, (payload: PayloadBundle) => {
      const clearedContent = payload.content as ClearedContent;

      for (const message of instance.messages) {
        if (message.conversation === clearedContent.conversationId) {
          instance.messages.delete(message.id);
        }
      }
    });

    account.on(PayloadBundleType.LOCATION, (payload: PayloadBundle) => {
      instance.messages.set(payload.id, payload);
    });

    account.on(PayloadBundleType.MESSAGE_DELETE, (payload: PayloadBundle) => {
      const deleteContent = payload.content as DeletedContent;
      instance.messages.delete(deleteContent.messageId);
    });

    account.on(PayloadBundleType.MESSAGE_HIDE, (payload: PayloadBundle) => {
      const hideContent = payload.content as HiddenContent;
      instance.messages.delete(hideContent.messageId);
    });

    account.on(PayloadBundleType.PING, (payload: PayloadBundle) => {
      instance.messages.set(payload.id, payload);
    });

    account.on(PayloadBundleType.CONFIRMATION, (payload: PayloadBundle) => {
      const confirmationContent = payload.content as ConfirmationContent;
      const confirmationWithSender = {...confirmationContent, from: payload.from};

      const messageToConfirm = instance.messages.get(confirmationContent.firstMessageId);

      if (messageToConfirm) {
        if (!messageToConfirm.confirmations) {
          messageToConfirm.confirmations = [];
        }
        messageToConfirm.confirmations.push(confirmationWithSender);
        instance.messages.set(messageToConfirm.id, messageToConfirm);
      }

      if (confirmationContent.moreMessageIds) {
        for (const furtherMessageId in confirmationContent.moreMessageIds) {
          const furtherMessageToConfirm = instance.messages.get(furtherMessageId);

          if (furtherMessageToConfirm) {
            if (!furtherMessageToConfirm.confirmations) {
              furtherMessageToConfirm.confirmations = [];
            }
            furtherMessageToConfirm.confirmations.push(confirmationWithSender);
            instance.messages.set(furtherMessageToConfirm.id, furtherMessageToConfirm);
          }
        }
      }
    });
  }

  private parseBackend(backend?: string | BackendData): BackendData {
    if (typeof backend === 'string') {
      switch (backend) {
        case 'production':
        case 'prod': {
          return APIClient.BACKEND.PRODUCTION;
        }
        default: {
          return APIClient.BACKEND.STAGING;
        }
      }
    } else if (typeof backend === 'undefined') {
      return APIClient.BACKEND.STAGING;
    } else {
      return backend;
    }
  }

  async toggleArchiveConversation(instanceId: string, conversationId: string, archived: boolean): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.toggleArchiveConversation(conversationId, archived);
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async toggleMuteConversation(instanceId: string, conversationId: string, muted: boolean): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.setConversationMutedStatus(conversationId, muted ? 3 : 0, new Date());
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async clearConversation(instanceId: string, conversationId: string): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.clearConversation(conversationId);
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async createInstance(options: InstanceCreationOptions): Promise<string> {
    const instanceId = new UUID(4).format();
    const backendType = this.parseBackend(options.backend || options.customBackend);

    const engine = new MemoryEngine();

    logger.log(`[${formatDate()}] Initializing MemoryEngine...`);

    await engine.init('wire-web-ets');

    logger.log(`[${formatDate()}] Creating APIClient with "${backendType.name}" backend ...`);

    const client = new APIClient({store: engine, urls: backendType});
    const account = new Account(client);

    const ClientInfo: ClientInfo = {
      classification: (options.deviceClass as any) || ClientClassification.DESKTOP,
      cookieLabel: 'default',
      label: options.deviceLabel,
      model: options.deviceName || `E2E Test Server v${version}`,
    };

    logger.log(`[${formatDate()}] Logging in ...`);

    try {
      await account.login(options.loginData, true, ClientInfo);
      await account.listen();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(`Backend error: ${error.response.data.message}`);
      }

      logger.error(`[${formatDate()}]`, error);
      throw error;
    }

    const instance: Instance = {
      account,
      backendType,
      client,
      engine,
      id: instanceId,
      messages: new LRUCache(),
      name: options.instanceName || '',
    };

    this.cachedInstances.set(instanceId, instance);

    this.attachListeners(account, instance);

    logger.log(`[${formatDate()}] Created instance with id "${instanceId}".`);

    return instanceId;
  }

  async deleteInstance(instanceId: string): Promise<void> {
    const instance = this.getInstance(instanceId);

    await instance.account.logout();

    this.cachedInstances.delete(instanceId);
    logger.log(`[${formatDate()}] Deleted instance with id "${instanceId}".`);
  }

  async deleteMessageLocal(instanceId: string, conversationId: string, messageId: string): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.deleteMessageLocal(conversationId, messageId);
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async deleteMessageEveryone(instanceId: string, conversationId: string, messageId: string): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.deleteMessageEveryone(conversationId, messageId);
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  instanceExists(instanceId: string): boolean {
    return !!this.cachedInstances.get(instanceId);
  }

  getFingerprint(instanceId: string): string {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const cryptoboxIdentity = instance.account.service.cryptography.cryptobox.identity;
      if (cryptoboxIdentity) {
        return cryptoboxIdentity.public_key.fingerprint();
      } else {
        throw new Error(`Identity of instance "${instance.id}" broken.`);
      }
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  getInstance(instanceId: string): Instance {
    const instance = this.cachedInstances.get(instanceId);

    if (!instance) {
      throw new Error(`Instance "${instanceId}" not found.`);
    }

    return instance;
  }

  getInstances(): NodeMap<Instance> {
    return this.cachedInstances.getAll();
  }

  getMessages(instanceId: string, conversationId: string): MessagePayload[] {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const allMessages = instance.messages.getAll();

      return Object.keys(allMessages)
        .map(messageId => allMessages[messageId])
        .filter(message => message.conversation === conversationId);
    } else {
      throw new Error('Account service not set.');
    }
  }

  getAllClients(instanceId: string): Promise<RegisteredClient[]> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      return instance.account.service.client.getClients();
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async removeAllClients(email: string, password: string, backend?: string | BackendData): Promise<void> {
    const backendType = this.parseBackend(backend);

    const engine = new MemoryEngine();
    await engine.init('temporary');
    const apiClient = new APIClient({store: engine, urls: backendType});
    const account = new Account(apiClient);

    const ClientInfo: ClientInfo = {
      classification: ClientClassification.DESKTOP,
      cookieLabel: 'default',
      model: `E2E Test Server v${version}`,
    };

    const loginData = {
      clientType: ClientType.PERMANENT,
      email,
      password,
    };

    try {
      await account.login(loginData, true, ClientInfo);
    } catch (error) {
      logger.error(`[${formatDate()}]`, error);

      if (error.code !== StatusCode.FORBIDDEN || error.label !== BackendErrorLabel.TOO_MANY_CLIENTS) {
        throw error;
      }
    }

    const clients = await apiClient.client.api.getClients();
    const instances = this.cachedInstances.getAll();

    for (const client of clients) {
      for (const [instanceId, instance] of Object.entries(instances)) {
        if (instance.client.context && instance.client.context.clientId === client.id) {
          await this.deleteInstance(instanceId);
        }
      }
      if (client.class === ClientClassification.LEGAL_HOLD) {
        logger.info(`Can't delete client with ID "${client.id} since it's a Legal Hold client`);
      } else {
        await apiClient.client.api.deleteClient(client.id, password);
      }
    }

    await account.logout();
  }

  async resetSession(instanceId: string, conversationId: string): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const sessionResetPayload = service.conversation.messageBuilder.createSessionReset(conversationId);
      const {id: messageId} = await service.conversation.send(sessionResetPayload);
      return messageId;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendText(
    instanceId: string,
    conversationId: string,
    message: string,
    linkPreview?: LinkPreviewContent,
    mentions?: MentionContent[],
    quote?: QuoteContent,
    expectsReadConfirmation?: boolean,
    legalHoldStatus?: LegalHoldStatus,
    expireAfterMillis = 0,
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = await service.conversation.messageBuilder
        .createText(conversationId, message)
        .withMentions(mentions)
        .withQuote(quote)
        .withReadConfirmation(expectsReadConfirmation)
        .withLegalHoldStatus(legalHoldStatus)
        .build();

      let sentMessage = await service.conversation.send(payload);

      if (linkPreview) {
        const linkPreviewPayload = await service.conversation.messageBuilder.createLinkPreview(linkPreview);
        const editedWithPreviewPayload = service.conversation.messageBuilder
          .createText(conversationId, message, sentMessage.id)
          .withLinkPreviews([linkPreviewPayload])
          .withMentions(mentions)
          .withQuote(quote)
          .withReadConfirmation(expectsReadConfirmation)
          .withLegalHoldStatus(legalHoldStatus)
          .build();

        sentMessage = await service.conversation.send(editedWithPreviewPayload);

        const messageContent = sentMessage.content as TextContent;

        if (messageContent.linkPreviews) {
          messageContent.linkPreviews.forEach(preview => {
            stripLinkPreview(preview);
          });
        }
      }

      instance.messages.set(sentMessage.id, sentMessage);
      return sentMessage.id;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendConfirmationDelivered(
    instanceId: string,
    conversationId: string,
    firstMessageId: string,
    moreMessageIds?: string[],
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const payload = service.conversation.messageBuilder.createConfirmation(
        conversationId,
        firstMessageId,
        Confirmation.Type.DELIVERED,
        undefined,
        moreMessageIds,
      );
      await service.conversation.send(payload);
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendConfirmationRead(
    instanceId: string,
    conversationId: string,
    firstMessageId: string,
    moreMessageIds?: string[],
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const payload = service.conversation.messageBuilder.createConfirmation(
        conversationId,
        firstMessageId,
        Confirmation.Type.READ,
        undefined,
        moreMessageIds,
      );
      await service.conversation.send(payload);
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendEphemeralConfirmationDelivered(
    instanceId: string,
    conversationId: string,
    firstMessageId: string,
    moreMessageIds?: string[],
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const message = instance.messages.get(firstMessageId);
    const service = instance.account.service;

    if (!message) {
      throw new Error(`Message with ID "${firstMessageId}" not found.`);
    }

    if (service) {
      const confirmationPayload = service.conversation.messageBuilder.createConfirmation(
        conversationId,
        firstMessageId,
        Confirmation.Type.DELIVERED,
        undefined,
        moreMessageIds,
      );
      await service.conversation.send(confirmationPayload);
      await service.conversation.deleteMessageEveryone(conversationId, firstMessageId, [message.from]);

      if (moreMessageIds && moreMessageIds.length) {
        for (const messageId of moreMessageIds) {
          const furtherMessage = instance.messages.get(messageId);

          if (!furtherMessage) {
            throw new Error(`Message with ID "${firstMessageId}" not found.`);
          }

          await service.conversation.deleteMessageEveryone(conversationId, messageId, [furtherMessage.from]);
        }
      }
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendEphemeralConfirmationRead(
    instanceId: string,
    conversationId: string,
    firstMessageId: string,
    moreMessageIds?: string[],
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const message = instance.messages.get(firstMessageId);
    const service = instance.account.service;

    if (!message) {
      throw new Error(`Message with ID "${firstMessageId}" not found.`);
    }

    if (service) {
      const confirmationPayload = service.conversation.messageBuilder.createConfirmation(
        conversationId,
        firstMessageId,
        Confirmation.Type.READ,
        undefined,
        moreMessageIds,
      );
      await service.conversation.send(confirmationPayload);
      await service.conversation.deleteMessageEveryone(conversationId, firstMessageId, [message.from]);
      if (moreMessageIds && moreMessageIds.length) {
        for (const messageId of moreMessageIds) {
          const furtherMessage = instance.messages.get(messageId);

          if (!furtherMessage) {
            throw new Error(`Message with ID "${firstMessageId}" not found.`);
          }

          await service.conversation.deleteMessageEveryone(conversationId, messageId, [furtherMessage.from]);
        }
      }
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendImage(
    instanceId: string,
    conversationId: string,
    image: ImageContent,
    expectsReadConfirmation?: boolean,
    legalHoldStatus?: LegalHoldStatus,
    expireAfterMillis = 0,
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = await service.conversation.messageBuilder.createImage(
        conversationId,
        image,
        undefined,
        expectsReadConfirmation,
        legalHoldStatus,
      );
      const sentImage = await service.conversation.send(payload);

      stripAsset(sentImage.content);

      instance.messages.set(sentImage.id, sentImage);
      return sentImage.id;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendFile(
    instanceId: string,
    conversationId: string,
    file: FileContent,
    metadata: FileMetaDataContent,
    expectsReadConfirmation?: boolean,
    legalHoldStatus?: LegalHoldStatus,
    expireAfterMillis = 0,
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);

      const metadataPayload = await service.conversation.messageBuilder.createFileMetadata(
        conversationId,
        metadata,
        undefined,
        expectsReadConfirmation,
        legalHoldStatus,
      );
      await service.conversation.send(metadataPayload);

      const filePayload = await service.conversation.messageBuilder.createFileData(
        conversationId,
        file,
        metadataPayload.id,
        expectsReadConfirmation,
        legalHoldStatus,
      );
      const sentFile = await service.conversation.send(filePayload);

      stripAsset(sentFile.content);

      instance.messages.set(sentFile.id, sentFile);
      return sentFile.id;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendLocation(
    instanceId: string,
    conversationId: string,
    location: LocationContent,
    expireAfterMillis = 0,
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = await service.conversation.messageBuilder.createLocation(conversationId, location);
      const sentLocation = await service.conversation.send(payload);

      instance.messages.set(sentLocation.id, sentLocation);
      return sentLocation.id;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendPing(
    instanceId: string,
    conversationId: string,
    expectsReadConfirmation?: boolean,
    legalHoldStatus?: LegalHoldStatus,
    expireAfterMillis = 0,
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = service.conversation.messageBuilder.createPing(conversationId, {
        expectsReadConfirmation,
        legalHoldStatus,
      });
      const sentPing = await service.conversation.send(payload);

      instance.messages.set(sentPing.id, sentPing);
      return sentPing.id;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendTyping(instanceId: string, conversationId: string, status: CONVERSATION_TYPING): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      if (status === CONVERSATION_TYPING.STARTED) {
        await service.conversation.sendTypingStart(conversationId);
      } else {
        await service.conversation.sendTypingStop(conversationId);
      }
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendReaction(
    instanceId: string,
    conversationId: string,
    originalMessageId: string,
    type: ReactionType,
    legalHoldStatus?: LegalHoldStatus,
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const payload = service.conversation.messageBuilder.createReaction(conversationId, {
        legalHoldStatus,
        originalMessageId,
        type,
      });
      const {id: messageId} = await service.conversation.send(payload);
      return messageId;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendEditedText(
    instanceId: string,
    conversationId: string,
    originalMessageId: string,
    newMessageText: string,
    newLinkPreview?: LinkPreviewContent,
    newMentions?: MentionContent[],
    newQuote?: QuoteContent,
    expectsReadConfirmation?: boolean,
    legalHoldStatus?: LegalHoldStatus,
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const editedPayload = service.conversation.messageBuilder
        .createEditedText(conversationId, newMessageText, originalMessageId)
        .withMentions(newMentions)
        .withQuote(newQuote)
        .withReadConfirmation(expectsReadConfirmation)
        .withLegalHoldStatus(legalHoldStatus)
        .build();

      let editedMessage = await service.conversation.send(editedPayload);

      if (newLinkPreview) {
        const linkPreviewPayload = await service.conversation.messageBuilder.createLinkPreview(newLinkPreview);
        const editedWithPreviewPayload = service.conversation.messageBuilder
          .createEditedText(conversationId, newMessageText, originalMessageId, editedMessage.id)
          .withLinkPreviews([linkPreviewPayload])
          .withMentions(newMentions)
          .withQuote(newQuote)
          .withReadConfirmation(expectsReadConfirmation)
          .withLegalHoldStatus(legalHoldStatus)
          .build();

        editedMessage = await service.conversation.send(editedWithPreviewPayload);

        const editedMessageContent = editedMessage.content as EditedTextContent;

        if (editedMessageContent.linkPreviews) {
          editedMessageContent.linkPreviews.forEach(preview => stripLinkPreview(preview));
        }
      }

      instance.messages.set(originalMessageId, editedMessage);
      return editedMessage.id;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async setAvailability(instanceId: string, teamId: string, type: AvailabilityType): Promise<void> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.user.setAvailability(teamId, type);
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }
}
