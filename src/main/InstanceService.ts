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
import {ClientInfo} from '@wireapp/core/dist/client/root';
import {
  AssetContent,
  EditedTextContent,
  FileContent,
  FileMetaDataContent,
  ImageContent,
  LocationContent,
} from '@wireapp/core/dist/conversation/content/';
import {
  PayloadBundleIncoming,
  PayloadBundleOutgoing,
  PayloadBundleType,
  ReactionType,
} from '@wireapp/core/dist/conversation/root';
import {LRUCache} from '@wireapp/lru-cache';
import {MemoryEngine} from '@wireapp/store-engine';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine';
import * as logdown from 'logdown';
import UUID from 'pure-uuid';

import utils from './utils';

const {version}: {version: string} = require('../package.json');

const logger = logdown('@wireapp/wire-web-ets/instanceService', {
  logger: console,
  markdown: false,
});

type MessagePayload = PayloadBundleIncoming | PayloadBundleOutgoing;

export interface Instance {
  account: Account;
  backendType: {
    name: string;
    rest: string;
    ws: string;
  };
  client: APIClient;
  engine: CRUDEngine;
  id: string;
  messages: LRUCache<MessagePayload>;
  name: string;
}

class InstanceService {
  private cachedInstances: LRUCache<Instance>;

  constructor(private maximumInstances = 100) {
    this.cachedInstances = new LRUCache(this.maximumInstances);
  }

  async archiveConversation(instanceId: string, conversationId: string, archive: boolean): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.toggleArchiveConversation(conversationId, archive);
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

  async createInstance(
    backend: string,
    loginData: LoginData,
    deviceModel?: string,
    instanceName?: string
  ): Promise<string> {
    const instanceId = new UUID(4).format();
    const backendType = backend === 'staging' ? APIClient.BACKEND.STAGING : APIClient.BACKEND.PRODUCTION;

    const engine = new MemoryEngine();

    logger.log(`[${utils.formatDate()}] Initializing MemoryEngine...`);

    await engine.init('wire-web-ets');

    logger.log(`[${utils.formatDate()}] Creating APIClient with "${backendType.name}" backend ...`);
    const client = new APIClient({store: engine, urls: backendType});
    const account = new Account(client);

    const ClientInfo: ClientInfo = {
      classification: ClientClassification.DESKTOP,
      cookieLabel: 'default',
      model: deviceModel || `E2E Test Server v${version}`,
    };

    logger.log(`[${utils.formatDate()}] Logging in ...`);

    try {
      await account.login(loginData, true, ClientInfo);
      await account.listen();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(`Backend error: ${error.response.data.message}`);
      }

      throw error;
    }

    const instance: Instance = {
      account,
      backendType,
      client,
      engine,
      id: instanceId,
      messages: new LRUCache(),
      name: instanceName || '',
    };

    this.cachedInstances.set(instanceId, instance);

    account.on(PayloadBundleType.TEXT, (payload: PayloadBundleIncoming) => instance.messages.set(payload.id, payload));
    account.on(PayloadBundleType.ASSET, (payload: PayloadBundleIncoming) => {
      const metaPayload = instance.messages.get(payload.id);
      if (metaPayload && payload) {
        (payload.content as AssetContent).uploaded = (metaPayload.content as AssetContent).uploaded;
      }
      instance.messages.set(payload.id, payload);
    });
    account.on(PayloadBundleType.ASSET_META, (payload: PayloadBundleIncoming) =>
      instance.messages.set(payload.id, payload)
    );
    account.on(PayloadBundleType.ASSET_IMAGE, (payload: PayloadBundleIncoming) =>
      instance.messages.set(payload.id, payload)
    );
    account.on(PayloadBundleType.MESSAGE_EDIT, (payload: PayloadBundleIncoming) => {
      const editedContent = payload.content as EditedTextContent;
      payload.id = editedContent.originalMessageId;
      delete editedContent.originalMessageId;
      instance.messages.set(payload.id, payload);
    });

    logger.log(`[${utils.formatDate()}] Created instance with id "${instanceId}".`);

    return instanceId;
  }

  async deleteInstance(instanceId: string): Promise<void> {
    const instance = this.getInstance(instanceId);

    await instance.account.logout();

    this.cachedInstances.delete(instanceId);
    logger.log(`[${utils.formatDate()}] Deleted instance with id "${instanceId}".`);
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

  getInstances(): Array<{[id: string]: Instance}> {
    return this.cachedInstances.getAll();
  }

  getMessages(instanceId: string, conversationId: string): MessagePayload[] {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const allMessages = instance.messages.getAll();
      const messageArray = allMessages.reduce((messages: MessagePayload[], message) => {
        const messageId = Object.keys(message)[0];
        messages.push(message[messageId]);
        return messages;
      }, []);

      return messageArray.filter(message => message.conversation === conversationId);
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

  async removeAllClients(backend: string, email: string, password: string): Promise<void> {
    const backendType = backend === 'staging' ? APIClient.BACKEND.STAGING : APIClient.BACKEND.PRODUCTION;
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
      if (error.code !== StatusCode.FORBIDDEN || error.label !== BackendErrorLabel.TOO_MANY_CLIENTS) {
        throw error;
      }
    }

    const clients = await apiClient.client.api.getClients();
    const instances = this.cachedInstances.getAll();

    for (const client of clients) {
      for (const instanceId in instances) {
        const instance = this.cachedInstances.get(instanceId);
        if (instance && instance.client.context && instance.client.context.clientId === client.id) {
          await this.deleteInstance(instanceId);
        }
      }
      await apiClient.client.api.deleteClient(client.id, password);
    }

    await account.logout();
  }

  async resetSession(instanceId: string, conversationId: string): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const sessionResetPayload = instance.account.service.conversation.createSessionReset();
      const {id: messageId} = await instance.account.service.conversation.send(conversationId, sessionResetPayload);
      return messageId;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendText(instanceId: string, conversationId: string, message: string, expireAfterMillis = 0): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      instance.account.service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = await instance.account.service.conversation.createText(message);
      const sentMessage = await instance.account.service.conversation.send(conversationId, payload);
      instance.messages.set(sentMessage.id, sentMessage);
      return sentMessage.id;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendConfirmation(instanceId: string, conversationId: string, messageId: string): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const payload = instance.account.service.conversation.createConfirmation(messageId);
      await instance.account.service.conversation.send(conversationId, payload);
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendConfirmationEphemeral(instanceId: string, conversationId: string, messageId: string): Promise<string> {
    const instance = this.getInstance(instanceId);
    const message = instance.messages.get(messageId);

    if (!message) {
      throw new Error(`Message with ID "${messageId}" not found.`);
    }

    if (instance.account.service) {
      const confirmationPayload = instance.account.service.conversation.createConfirmation(messageId);
      await instance.account.service.conversation.send(conversationId, confirmationPayload);
      await instance.account.service.conversation.deleteMessageEveryone(conversationId, messageId, [message.from]);
      return instance.name;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendImage(
    instanceId: string,
    conversationId: string,
    image: ImageContent,
    expireAfterMillis = 0
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    if (instance.account.service) {
      instance.account.service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = await instance.account.service.conversation.createImage(image);
      const sentImage = await instance.account.service.conversation.send(conversationId, payload);
      delete (sentImage.content as ImageContent).data;
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
    expireAfterMillis = 0
  ): Promise<string> {
    const instance = this.getInstance(instanceId);
    if (instance.account.service) {
      instance.account.service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);

      const metadataPayload = await instance.account.service.conversation.createFileMetadata(metadata);
      await instance.account.service.conversation.send(conversationId, metadataPayload);

      const filePayload = await instance.account.service.conversation.createFileData(file, metadataPayload.id);
      const sentFile = await instance.account.service.conversation.send(conversationId, filePayload);
      delete (sentFile.content as FileContent).data;
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
    expireAfterMillis = 0
  ): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      instance.account.service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = await instance.account.service.conversation.createLocation(location);
      const sentMessage = await instance.account.service.conversation.send(conversationId, payload);
      instance.messages.set(sentMessage.id, sentMessage);
      return sentMessage.id;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendPing(instanceId: string, conversationId: string, expireAfterMillis = 0): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      instance.account.service.conversation.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);
      const payload = instance.account.service.conversation.createPing();
      const {id: messageId} = await instance.account.service.conversation.send(conversationId, payload);
      return messageId;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async sendTyping(instanceId: string, conversationId: string, status: CONVERSATION_TYPING): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      if (status === CONVERSATION_TYPING.STARTED) {
        await instance.account.service.conversation.sendTypingStart(conversationId);
      } else {
        await instance.account.service.conversation.sendTypingStop(conversationId);
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
    type: ReactionType
  ): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const payload = instance.account.service.conversation.createReaction(originalMessageId, type);
      const {id: messageId} = await instance.account.service.conversation.send(conversationId, payload);
      return messageId;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }

  async updateText(
    instanceId: string,
    conversationId: string,
    originalMessageId: string,
    newMessageText: string
  ): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const payload = instance.account.service.conversation.createEditedText(newMessageText, originalMessageId);
      const editedMessage = await instance.account.service.conversation.send(conversationId, payload);
      instance.messages.set(originalMessageId, editedMessage);
      return editedMessage.id;
    } else {
      throw new Error(`Account service for instance ${instanceId} not set.`);
    }
  }
}

export default InstanceService;
