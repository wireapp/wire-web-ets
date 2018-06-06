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

import APIClient = require('@wireapp/api-client');
import {LoginData} from '@wireapp/api-client/dist/commonjs/auth/';
import {ClientClassification} from '@wireapp/api-client/dist/commonjs/client/';
import {Config} from '@wireapp/api-client/dist/commonjs/Config';
import {CONVERSATION_TYPING} from '@wireapp/api-client/dist/commonjs/event/';
import {Account} from '@wireapp/core';
import {ClientInfo} from '@wireapp/core/dist/client/root';
import {Image} from '@wireapp/core/dist/conversation/root';
import LRUCache from '@wireapp/lru-cache';
import {MemoryEngine} from '@wireapp/store-engine';
import {CRUDEngine} from '@wireapp/store-engine/dist/commonjs/engine';
import UUID from 'pure-uuid';

const {version}: {version: string} = require('../package.json');

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
  name: string;
}

class InstanceService {
  private cachedInstances: LRUCache<Instance>;

  constructor(private maximumInstances = 100) {
    this.cachedInstances = new LRUCache(this.maximumInstances);
  }

  async createInstance(
    backend: string,
    LoginData: LoginData,
    deviceModel?: string,
    instanceName?: string
  ): Promise<string> {
    const instanceId = new UUID(4).format();
    const backendType = backend === 'staging' ? APIClient.BACKEND.STAGING : APIClient.BACKEND.PRODUCTION;

    const engine = new MemoryEngine();

    console.log('Initializing MemoryEngine...');

    await engine.init('');

    console.log(`Creating APIClient with "${backendType.name}" backend ...`);
    const client = new APIClient(new Config(engine, backendType));
    const account = new Account(client);

    const ClientInfo: ClientInfo = {
      classification: ClientClassification.DESKTOP,
      cookieLabel: 'default',
      model: deviceModel || `E2E Test Server v${version}`,
    };

    console.log(`Logging in ...`);

    try {
      await account.login(LoginData, true, ClientInfo);
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
      name: instanceName || '',
    };

    this.cachedInstances.set(instanceId, instance);

    return instanceId;
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
        throw new Error('Instance identity broken.');
      }
    } else {
      throw new Error('Account service not set.');
    }
  }

  getInstance(instanceId: string): Instance {
    const instance = this.cachedInstances.get(instanceId);

    if (!instance) {
      throw new Error('Instance not found.');
    }

    return instance;
  }

  getInstances(): Instance[] {
    return this.cachedInstances.getAll().map(instance => instance.value);
  }

  async sendText(instanceId: string, conversationId: string, message: string): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      const messageId = await instance.account.service.conversation.sendTextMessage(conversationId, message);
      return messageId;
    } else {
      throw new Error('Account service not set.');
    }
  }

  async sendConfirmation(instanceId: string, conversationId: string, messageId: string): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.sendConfirmation(conversationId, messageId);
      return instance.name;
    } else {
      throw new Error('Account service not set.');
    }
  }

  async sendImage(instanceId: string, conversationId: string, image: Image): Promise<string> {
    const instance = this.getInstance(instanceId);
    if (instance.account.service) {
      const messageId = await instance.account.service.conversation.sendImage(conversationId, image);
      return messageId;
    } else {
      throw new Error('Account service not set.');
    }
  }

  async sendPing(instanceId: string, conversationId: string): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      await instance.account.service.conversation.sendPing(conversationId);
      return instance.name;
    } else {
      throw new Error('Account service not set.');
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
      throw new Error('Account service not set.');
    }
  }

  updateText(instanceId: string, conversationId: string, messageId: string, text: string): Promise<string> {
    const instance = this.getInstance(instanceId);

    if (instance.account.service) {
      return instance.account.service.conversation.updateTextMessage(conversationId, messageId, text);
    } else {
      throw new Error('Account service not set.');
    }
  }
}

export default InstanceService;
