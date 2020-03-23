import {Injectable} from '@nestjs/common';
import UUID from 'pure-uuid';
import {formatDate, isAssetContent, stripAsset, stripLinkPreview} from '../utils';
import {Account} from '@wireapp/core';
import {LRUCache} from '@wireapp/lru-cache';
import {Instance} from '../InstanceService';
import {BackendData} from '@wireapp/api-client/dist/env/';
import {ClientClassification} from '@wireapp/api-client/dist/client/';
import {APIClient} from '@wireapp/api-client';
import {ClientInfo} from '@wireapp/core/dist/client/';
import {MemoryEngine} from '@wireapp/store-engine';
import {PayloadBundle, PayloadBundleType, ReactionType} from '@wireapp/core/dist/conversation';
import {ClientType} from '@wireapp/api-client/dist/client/ClientType';
import {
  ClearedContent,
  ConfirmationContent,
  ConversationContent,
  DeletedContent,
  EditedTextContent,
  HiddenContent,
  ReactionContent,
  TextContent,
} from '@wireapp/core/dist/conversation/content';
import {InstanceCreationOptions} from './InstanceCreationOptions';

@Injectable()
export class InstanceService {
  private readonly cachedInstances: LRUCache<Instance> = new LRUCache(100);

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

  private attachListeners(account: Account, instance: Instance): void {
    account.on(Account.TOPIC.ERROR, error => console.error(`[${formatDate()}]`, error));

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
    const instanceId = new UUID(4).format();
    const backendType = this.parseBackend(options.backend || options.customBackend);

    const engine = new MemoryEngine();

    console.info(`[${formatDate()}] Initializing MemoryEngine...`);

    await engine.init('wire-web-ets');

    console.info(`[${formatDate()}] Creating APIClient with "${backendType.name}" backend ...`);

    const client = new APIClient({urls: backendType});
    const account = new Account(client);

    const ClientInfo: ClientInfo = {
      classification: options.deviceClass || ClientClassification.DESKTOP,
      cookieLabel: 'default',
      label: options.deviceLabel,
      model: options.deviceName || 'E2E Test Server',
    };

    console.info(`[${formatDate()}] Logging in ...`);

    try {
      await account.login(
        {
          clientType: ClientType.TEMPORARY,
          email: options.email,
          password: options.password,
        },
        true,
        ClientInfo,
      );
      await account.listen();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(`Backend error: ${error.response.data.message}`);
      }

      console.error(`[${formatDate()}]`, error);
      throw error;
    }

    const instance: Instance = {
      account,
      backendType,
      client,
      engine,
      id: instanceId,
      messages: new LRUCache(),
      name: options.name || '',
    };

    this.cachedInstances.set(instanceId, instance);

    this.attachListeners(account, instance);

    console.info(`[${formatDate()}] Created instance with id "${instanceId}".`);

    return instanceId;
  }
}
