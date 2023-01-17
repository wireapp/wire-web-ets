/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
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

import {Injectable} from '@nestjs/common';
import {APIClient} from '@wireapp/api-client';
import {ClientClassification, ClientType, RegisteredClient} from '@wireapp/api-client/src/client/';
import {CONVERSATION_TYPING} from '@wireapp/api-client/src/conversation/data/';
import {BackendError, BackendErrorLabel} from '@wireapp/api-client/src/http/';
import {Account} from '@wireapp/core';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import {ClientInfo} from '@wireapp/core/src/main/client/';
import {MessageBuilder} from '@wireapp/core/src/main/conversation/message/MessageBuilder';
import {PayloadBundle, PayloadBundleType, ReactionType} from '@wireapp/core/src/main/conversation';
import {
  ClearedContent,
  ConfirmationContent,
  ConversationContent,
  DeletedContent,
  EditedTextContent,
  FileContent,
  FileMetaDataContent,
  HiddenContent,
  ImageContent,
  LinkPreviewContent,
  LocationContent,
  MentionContent,
  QuoteContent,
  ReactionContent,
  TextContent,
} from '@wireapp/core/src/main/conversation/content';
import {MessageToProtoMapper} from '@wireapp/core/src/main/conversation/message/MessageToProtoMapper';
import {OtrMessage} from '@wireapp/core/src/main/conversation/message/OtrMessage';
import {LRUCache, NodeMap} from '@wireapp/lru-cache';
import {Confirmation, LegalHoldStatus} from '@wireapp/protocol-messaging';
import {MemoryEngine} from '@wireapp/store-engine';
import {CRUDEngine} from '@wireapp/store-engine/src/main/engine/';
import logdown from 'logdown';
import UUID from 'uuidjs';
import {formatDate, isAssetContent, stripAsset, stripLinkPreview} from '../utils';
import {ClientsOptions} from './ClientsOptions';
import {InstanceArchiveOptions} from './InstanceArchiveOptions';
import {InstanceAvailabilityOptions} from './InstanceAvailabilityOptions';
import {InstanceBreakSessionOptions} from './InstanceBreakSessionOptions';
import {InstanceButtonOptions} from './InstanceButtonOptions';
import {InstanceConversationOptions} from './InstanceConversationOptions';
import {BackendMeta, InstanceCreationOptions} from './InstanceCreationOptions';
import {InstanceDeleteOptions} from './InstanceDeleteOptions';
import {InstanceDeliveryOptions} from './InstanceDeliveryOptions';
import {InstanceMuteOptions} from './InstanceMuteOptions';
import {InstanceReactionOptions} from './InstanceReactionOptions';
import {InstanceTypingOptions} from './InstanceTypingOptions';
import {sendFile} from '../send/sendFile';
import {AxiosError} from 'axios';

const {version}: {version: string} = require('../../package.json');

const logger = logdown('@wireapp/wire-web-ets/InstanceService', {
  logger: console,
  markdown: false,
});

type ConfirmationWithSender = ConfirmationContent & {from: string};
type ReactionWithSender = ReactionContent & {
  from: string;
};

type MessagePayload = PayloadBundle & {
  confirmations?: ConfirmationWithSender[];
  reactions?: ReactionWithSender[];
};

interface Instance {
  account: Account;
  backendType: BackendMeta;
  client: APIClient;
  engine: CRUDEngine;
  id: string;
  messages: LRUCache<MessagePayload>;
  name: string;
}

interface BaseOptions {
  conversationDomain?: string;
  conversationId: string;
  expectsReadConfirmation?: boolean;
  instanceId: string;
  legalHoldStatus?: LegalHoldStatus;
}

interface SendOptions extends BaseOptions {
  expireAfterMillis?: number;
}

interface SendFileOptions extends SendOptions {
  customAlgorithm?: string;
  customHash?: Buffer;
  file: FileContent;
  metadata: FileMetaDataContent;
}

interface SendImageOptions extends SendOptions {
  customAlgorithm?: string;
  customHash?: Buffer;
  image: ImageContent;
}

interface SendLocationOptions extends BaseOptions {
  expireAfterMillis?: number;
  location: LocationContent;
}

type SendPingOptions = SendOptions;

interface SendCallOptions extends BaseOptions {
  content: string;
}

interface SendTextOptions extends SendOptions {
  buttons?: string[];
  linkPreview?: LinkPreviewContent;
  mentions?: MentionContent[];
  message: string;
  quote?: QuoteContent;
}

interface UpdateTextOptions extends BaseOptions {
  newLinkPreview?: LinkPreviewContent;
  newMentions?: MentionContent[];
  newMessageText: string;
  newQuote?: QuoteContent;
  originalMessageId: string;
}

@Injectable()
export class InstanceService {
  private readonly cachedInstances: LRUCache<Instance> = new LRUCache(100);

  private parseBackend(backend?: string | BackendMeta): BackendMeta {
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

  private attachListeners(account: Account, instance: Instance): void {
    account.on(Account.TOPIC.ERROR, error => logger.error(`[${formatDate()}]`, error));

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
      stripAsset(payload.content as ConversationContent);
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

    account.on(PayloadBundleType.CONVERSATION_CLEAR, (payload: PayloadBundle) => {
      const clearedContent = payload.content as ClearedContent;

      for (const message of instance.messages) {
        if (message.conversation === clearedContent.conversationId) {
          instance.messages.delete(message.id);
        }
      }
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

    account.on(PayloadBundleType.REACTION, (payload: PayloadBundle) => {
      const reactionContent = payload.content as ReactionContent;
      const reactionWithSender = {...reactionContent, from: payload.from};

      const messageToReact = instance.messages.get(reactionContent.originalMessageId);

      if (messageToReact) {
        if (!messageToReact.reactions) {
          messageToReact.reactions = [];
        }

        if (reactionContent.type === ReactionType.LIKE) {
          messageToReact.reactions.push(reactionWithSender);
        } else {
          messageToReact.reactions = messageToReact.reactions.filter(reaction => {
            return reaction.from !== payload.from;
          });
        }

        if (!messageToReact.reactions.length) {
          delete messageToReact.reactions;
        }

        instance.messages.set(messageToReact.id, messageToReact);
      }
    });
  }

  async createInstance(options: InstanceCreationOptions): Promise<string> {
    const instanceId = UUID.genV4().toString();
    const backendMeta = this.parseBackend(options.backend || options.customBackend);

    const engine = new MemoryEngine();

    logger.info(`[${formatDate()}] Initializing MemoryEngine...`);

    await engine.init('wire-web-ets');

    logger.info(`[${formatDate()}] Creating APIClient with "${backendMeta.name}" backend ...`);

    const client = new APIClient({urls: backendMeta});
    const account = new Account(client, undefined, {federationDomain: options.federationDomain});

    const ClientInfo: ClientInfo = {
      classification: options.deviceClass || ClientClassification.DESKTOP,
      cookieLabel: 'default',
      label: options.deviceLabel || 'ETS Device Label',
      model: options.deviceName || 'ETS Device Model',
    };

    logger.info(`[${formatDate()}] Logging in ...`);

    try {
      await account.login(
        {
          clientType: options.isTemporary === true ? ClientType.TEMPORARY : ClientType.PERMANENT,
          email: options.email,
          password: options.password,
        },
        true,
        ClientInfo,
      );
      await account.listen();
    } catch (error) {
      if ((error as AxiosError<any>).response?.data?.message) {
        throw new Error(`Backend error: ${(error as AxiosError<any>).response!.data.message}`);
      }

      logger.error(`[${formatDate()}]`, error);
      throw error;
    }

    const instance: Instance = {
      account,
      backendType: backendMeta,
      client,
      engine,
      id: instanceId,
      messages: new LRUCache(100),
      name: options.name || '',
    };

    this.cachedInstances.set(instanceId, instance);

    this.attachListeners(account, instance);

    logger.info(`[${formatDate()}] Created instance with id "${instanceId}".`);

    return instanceId;
  }

  getInstance(instanceId: string): Instance {
    const instance = this.cachedInstances.get(instanceId);

    if (!instance) {
      throw new Error(`Instance "${instanceId}" not found.`);
    }

    return instance;
  }

  instanceExists(instanceId: string): boolean {
    return !!this.cachedInstances.get(instanceId);
  }

  async deleteInstance(instanceId: string): Promise<void> {
    const instance = this.getInstance(instanceId);

    await instance.account.logout();

    this.cachedInstances.delete(instanceId);
    logger.info(`[${formatDate()}] Deleted instance with id "${instanceId}".`);
  }

  async toggleArchiveConversation(instanceId: string, options: InstanceArchiveOptions): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.toggleArchiveConversation(options.conversationId, options.archived);
      return instance.name;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async setAvailability(instanceId: string, options: InstanceAvailabilityOptions): Promise<void> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.user.setAvailability(options.teamId, options.type);
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async clearConversation(instanceId: string, options: InstanceConversationOptions): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.clearConversation(options.conversationId);
      return instance.name;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  getAllClients(instanceId: string): Promise<RegisteredClient[]> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      return instance.account.service.client.getClients();
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async deleteMessageLocal(instanceId: string, options: InstanceDeleteOptions): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.deleteMessageLocal(options.conversationId, options.messageId);
      return instance.name;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async deleteMessageEveryone(instanceId: string, options: InstanceDeleteOptions): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.deleteMessageEveryone(
        options.conversationId,
        options.messageId,
        undefined,
        false,
        options.conversationDomain,
      );
      return instance.name;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  getFingerprint(instanceId: string): string {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const cryptoboxIdentity = instance.account.service.cryptography.cryptobox.getIdentity();
      if (cryptoboxIdentity) {
        return cryptoboxIdentity.public_key.fingerprint();
      }
      throw new Error(`Identity of instance "${instance.id}" broken.`);
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  getMessages(instanceId: string, options: InstanceConversationOptions): MessagePayload[] {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const allMessages = instance.messages.getAll();

      return Object.keys(allMessages)
        .map(messageId => allMessages[messageId])
        .filter(message => message.conversation === options.conversationId);
    }
    throw new Error('Account service not set.');
  }

  async toggleMuteConversation(instanceId: string, options: InstanceMuteOptions): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.setConversationMutedStatus(
        options.conversationId,
        options.mute ? 3 : 0,
        new Date(),
      );
      return instance.name;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  private async sendConfirmation(instanceId: string, options: InstanceDeliveryOptions, type: Confirmation.Type) {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;
    const message = instance.messages.get(options.firstMessageId);

    if (!message) {
      throw new Error(`Message with ID "${options.firstMessageId}" not found.`);
    }

    if (service) {
      const payload = MessageBuilder.createConfirmation({
        conversationId: options.conversationId,
        firstMessageId: options.firstMessageId,
        from: instance.client.userId as string,
        moreMessageIds: options.moreMessageIds,
        type,
      });
      await service.conversation.send({conversationDomain: options.conversationDomain, payloadBundle: payload});
      return instance.name;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async sendConfirmationDelivered(instanceId: string, options: InstanceDeliveryOptions): Promise<string> {
    return this.sendConfirmation(instanceId, options, Confirmation.Type.DELIVERED);
  }

  async sendConfirmationRead(instanceId: string, options: InstanceDeliveryOptions): Promise<string> {
    return this.sendConfirmation(instanceId, options, Confirmation.Type.READ);
  }

  private async sendEphemeralConfirmation(
    instanceId: string,
    options: InstanceDeliveryOptions,
    type: Confirmation.Type,
  ): Promise<string> {
    await this.sendConfirmation(instanceId, options, type);

    const instance = this.getInstance(instanceId);
    const service = instance.account.service!;
    const message = instance.messages.get(options.firstMessageId);

    if (!message) {
      throw new Error(`Message with ID "${options.firstMessageId}" not found.`);
    }

    await service.conversation.deleteMessageEveryone(
      options.conversationId,
      options.firstMessageId,
      options.conversationDomain && message.qualifiedFrom ? [message.qualifiedFrom] : [message.from],
      false,
      options.conversationDomain,
    );

    if (options.moreMessageIds?.length) {
      for (const messageId of options.moreMessageIds) {
        const furtherMessage = instance.messages.get(messageId);

        if (!furtherMessage) {
          throw new Error(`Message with ID "${messageId}" not found.`);
        }

        await service.conversation.deleteMessageEveryone(
          options.conversationId,
          messageId,
          options.conversationDomain && message.qualifiedFrom ? [message.qualifiedFrom] : [message.from],
          false,
          options.conversationDomain,
        );
      }
    }
    return instance.name;
  }

  async sendEphemeralConfirmationDelivered(instanceId: string, options: InstanceDeliveryOptions): Promise<string> {
    return this.sendEphemeralConfirmation(instanceId, options, Confirmation.Type.DELIVERED);
  }

  async sendEphemeralConfirmationRead(instanceId: string, options: InstanceDeliveryOptions): Promise<string> {
    return this.sendEphemeralConfirmation(instanceId, options, Confirmation.Type.READ);
  }

  async sendFile({
    conversationId,
    conversationDomain,
    customAlgorithm,
    customHash,
    expectsReadConfirmation,
    expireAfterMillis = 0,
    file,
    instanceId,
    legalHoldStatus,
    metadata,
  }: SendFileOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const sentFile = await sendFile({
        assetService: service.asset,
        conversationDomain,
        conversationId,
        conversationService: service.conversation,
        customAlgorithm,
        customHash,
        expectsReadConfirmation,
        expireAfterMillis,
        file,
        from: instance.client.userId as string,
        legalHoldStatus,
        metadata,
      });

      stripAsset(sentFile.content);

      instance.messages.set(sentFile.id, sentFile);
      return sentFile.id;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async sendImage({
    conversationDomain,
    conversationId,
    customAlgorithm,
    customHash,
    expectsReadConfirmation,
    expireAfterMillis = 0,
    image,
    instanceId,
    legalHoldStatus,
  }: SendImageOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const asset = await service.asset.uploadAsset(image.data);
      const payload = MessageBuilder.createImage({
        asset: await asset.response,
        conversationId,
        expectsReadConfirmation,
        from: instance.client.userId as string,
        image,
        legalHoldStatus,
      });
      const sentImage = await service.conversation.send({conversationDomain, payloadBundle: payload});

      stripAsset(sentImage.content);

      instance.messages.set(sentImage.id, sentImage);
      return sentImage.id;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async sendLocation({
    conversationDomain,
    conversationId,
    expireAfterMillis = 0,
    instanceId,
    location,
  }: SendLocationOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = MessageBuilder.createLocation({
        conversationId,
        from: instance.client.userId as string,
        location,
      });
      const sentLocation = await service.conversation.send({conversationDomain, payloadBundle: payload});

      instance.messages.set(sentLocation.id, sentLocation);
      return sentLocation.id;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async sendCall({content, conversationDomain, conversationId, instanceId}: SendCallOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const payload = MessageBuilder.createCall({
        content: content,
        conversationId,
        from: instance.client.userId as string,
      });
      const sentCall = await service.conversation.send({conversationDomain, payloadBundle: payload});

      instance.messages.set(sentCall.id, sentCall);
      return sentCall.id;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async sendPing({
    conversationDomain,
    conversationId,
    expectsReadConfirmation,
    expireAfterMillis = 0,
    instanceId,
    legalHoldStatus,
  }: SendPingOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = MessageBuilder.createPing({
        conversationId,
        from: instance.client.userId as string,
        ping: {
          expectsReadConfirmation,
          hotKnock: false,
          legalHoldStatus,
        },
      });
      const sentPing = await service.conversation.send({conversationDomain, payloadBundle: payload});

      instance.messages.set(sentPing.id, sentPing);
      return sentPing.id;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async sendButtonAction(instanceId: string, options: InstanceButtonOptions): Promise<void> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;
    if (service) {
      const payload = MessageBuilder.createButtonActionMessage({
        content: {
          buttonId: options.buttonId,
          referenceMessageId: options.referenceMessageId,
        },
        conversationId: options.conversationId,
        from: instance.client.userId as string,
      });
      await service.conversation.send({
        conversationDomain: options.conversationDomain,
        payloadBundle: payload,
        userIds: options.userIds,
      });
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendButtonActionConfirmation(instanceId: string, options: InstanceButtonOptions): Promise<void> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;
    if (service) {
      const payload = MessageBuilder.createButtonActionConfirmationMessage({
        content: {
          buttonId: options.buttonId,
          referenceMessageId: options.referenceMessageId,
        },
        conversationId: options.conversationId,
        from: instance.client.userId as string,
      });
      await service.conversation.send({
        conversationDomain: options.conversationDomain,
        payloadBundle: payload,
        userIds: options.userIds,
      });
    } else {
      throw new Error(`Account service for instance "${instanceId}" not set.`);
    }
  }

  async sendReaction(instanceId: string, options: InstanceReactionOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const payload = MessageBuilder.createReaction({
        conversationId: options.conversationId,
        from: instance.client.userId as string,
        reaction: {
          legalHoldStatus: options.legalHoldStatus,
          originalMessageId: options.originalMessageId,
          type: options.type,
        },
      });
      const {id: messageId} = await service.conversation.send({
        conversationDomain: options.conversationDomain,
        payloadBundle: payload,
      });
      return messageId;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async breakSession(instanceId: string, options: InstanceBreakSessionOptions): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const baseSessionId = `${options.userId}@${options.clientId}`;
      const sessionId = options.userDomain ? `${options.userDomain}@${baseSessionId}` : baseSessionId;
      const cryptobox = instance.account.service.cryptography.cryptobox;
      logger.info(`Corrupting Session with ID '${sessionId}'`);

      const cryptoboxSession = await cryptobox.session_load(sessionId);
      cryptoboxSession.session.session_states = {};

      const record = {
        created: Date.now(),
        id: sessionId,
        serialised: cryptoboxSession.session.serialise(),
        version: 'broken_by_qa',
      };
      logger.info(record);

      cryptobox['cachedSessions'].set(sessionId, cryptoboxSession);

      return instance.id;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async sendSessionReset(instanceId: string, options: InstanceConversationOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const payload = MessageBuilder.createSessionReset({
        conversationId: options.conversationId,
        from: instance.client.userId as string,
      });
      const {id: messageId} = await service.conversation.send({
        conversationDomain: options.conversationDomain,
        payloadBundle: payload,
      });
      return messageId;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async sendTyping(instanceId: string, options: InstanceTypingOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      if (options.status === CONVERSATION_TYPING.STARTED) {
        await service.conversation.sendTypingStart(options.conversationId);
      } else {
        await service.conversation.sendTypingStop(options.conversationId);
      }
      return instance.name;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async sendText({
    buttons = [],
    conversationDomain,
    conversationId,
    expectsReadConfirmation,
    expireAfterMillis = 0,
    instanceId,
    legalHoldStatus,
    linkPreview,
    mentions,
    message,
    quote,
  }: SendTextOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);

      let payloadBundle: OtrMessage = MessageBuilder.createText({
        conversationId,
        from: instance.client.userId as string,
        text: message,
      })
        .withMentions(mentions)
        .withQuote(quote)
        .withReadConfirmation(expectsReadConfirmation)
        .withLegalHoldStatus(legalHoldStatus)
        .build();

      if (buttons.length > 0) {
        const textProto = MessageToProtoMapper.mapText(payloadBundle);
        const compositeBuilder = MessageBuilder.createComposite({
          conversationId,
          from: instance.client.userId as string,
        })
          .withReadConfirmation(expectsReadConfirmation)
          .addText(textProto);
        buttons.forEach(button => compositeBuilder.addButton(button));
        payloadBundle = compositeBuilder.build();
      }

      let sentMessage = await service.conversation.send({conversationDomain, payloadBundle});

      if (linkPreview) {
        const editedWithPreviewPayload = MessageBuilder.createText({
          conversationId,
          from: instance.client.userId as string,
          messageId: sentMessage.id,
          text: message,
        })
          .withLinkPreviews([await service.linkPreview.uploadLinkPreviewImage(linkPreview)])
          .withMentions(mentions)
          .withQuote(quote)
          .withReadConfirmation(expectsReadConfirmation)
          .withLegalHoldStatus(legalHoldStatus)
          .build();

        sentMessage = await service.conversation.send({conversationDomain, payloadBundle: editedWithPreviewPayload});

        const messageContent = sentMessage.content as TextContent;

        if (messageContent.linkPreviews) {
          messageContent.linkPreviews.forEach(preview => {
            stripLinkPreview(preview);
          });
        }
      }

      instance.messages.set(sentMessage.id, sentMessage);
      return sentMessage.id;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  async updateText({
    conversationId,
    conversationDomain,
    expectsReadConfirmation,
    instanceId,
    legalHoldStatus,
    newLinkPreview,
    newMentions,
    newMessageText,
    newQuote,
    originalMessageId,
  }: UpdateTextOptions): Promise<string> {
    const instance = this.getInstance(instanceId);
    const service = instance.account.service;

    if (service) {
      const editedPayload = MessageBuilder.createEditedText({
        conversationId,
        from: instance.client.userId as string,
        newMessageText,
        originalMessageId,
      })
        .withMentions(newMentions)
        .withQuote(newQuote)
        .withReadConfirmation(expectsReadConfirmation)
        .withLegalHoldStatus(legalHoldStatus)
        .build();

      let editedMessage = await service.conversation.send({conversationDomain, payloadBundle: editedPayload});

      if (newLinkPreview) {
        const editedWithPreviewPayload = MessageBuilder.createEditedText({
          conversationId,
          from: instance.client.userId as string,
          messageId: editedMessage.id,
          newMessageText,
          originalMessageId,
        })
          .withLinkPreviews([await service.linkPreview.uploadLinkPreviewImage(newLinkPreview)])
          .withMentions(newMentions)
          .withQuote(newQuote)
          .withReadConfirmation(expectsReadConfirmation)
          .withLegalHoldStatus(legalHoldStatus)
          .build();

        editedMessage = await service.conversation.send({conversationDomain, payloadBundle: editedWithPreviewPayload});

        const editedMessageContent = editedMessage.content as EditedTextContent;

        if (editedMessageContent.linkPreviews) {
          editedMessageContent.linkPreviews.forEach(preview => stripLinkPreview(preview));
        }
      }

      instance.messages.set(originalMessageId, editedMessage);
      return editedMessage.id;
    }
    throw new Error(`Account service for instance ${instanceId} not set.`);
  }

  getInstances(): NodeMap<Instance> {
    return this.cachedInstances.getAll();
  }

  async removeAllClients(options: ClientsOptions): Promise<void> {
    const backendType = this.parseBackend(options.backend);
    const apiClient = new APIClient({urls: backendType});
    const account = new Account(apiClient);

    const ClientInfo: ClientInfo = {
      classification: ClientClassification.DESKTOP,
      cookieLabel: 'default',
      model: `E2E Test Server v${version}`,
    };

    const loginData = {
      clientType: ClientType.PERMANENT,
      email: options.email,
      password: options.password,
    };

    try {
      await account.login(loginData, true, ClientInfo);
    } catch (error) {
      logger.error(`[${formatDate()}]`, error);

      if (
        (error as BackendError).code !== HTTP_STATUS.FORBIDDEN ||
        (error as BackendError).label !== BackendErrorLabel.TOO_MANY_CLIENTS
      ) {
        throw error;
      }
    }

    const clients = await apiClient.client.api.getClients();
    const instances = this.cachedInstances.getAll();

    for (const client of clients) {
      for (const [instanceId, instance] of Object.entries(instances)) {
        if (instance.client.context?.clientId === client.id) {
          await this.deleteInstance(instanceId);
        }
      }
      if (client.class === ClientClassification.LEGAL_HOLD) {
        logger.info(`Can't delete client with ID "${client.id} since it's a Legal Hold client`);
      } else {
        await apiClient.client.api.deleteClient(client.id, options.password);
      }
    }

    await account.logout();
  }
}
