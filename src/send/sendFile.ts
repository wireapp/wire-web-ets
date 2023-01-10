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

import {LegalHoldStatus} from '@wireapp/protocol-messaging';
import {AssetService, ConversationService} from '@wireapp/core/src/main/conversation';
import {FileContent, FileMetaDataContent} from '@wireapp/core/src/main/conversation/content';
import {MessageBuilder} from '@wireapp/core/src/main/conversation/message/MessageBuilder';
import {ConversationProtocol} from '@wireapp/api-client/src/conversation/NewConversation';

export async function sendFile({
  conversationId,
  conversationService,
  assetService,
  customAlgorithm,
  customHash,
  conversationDomain,
  expectsReadConfirmation,
  expireAfterMillis = 0,
  file,
  legalHoldStatus,
  metadata,
  from,
}: {
  assetService: AssetService;
  conversationDomain?: string;
  conversationId: string;
  conversationService: ConversationService;
  customAlgorithm?: string;
  customHash?: Buffer;
  expectsReadConfirmation?: boolean;
  expireAfterMillis?: number;
  file: FileContent;
  from: string;
  legalHoldStatus?: LegalHoldStatus;
  metadata: FileMetaDataContent;
}): Promise<ReturnType<ConversationService['send']>> {
  conversationService.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);

  const metadataPayload = MessageBuilder.createFileMetadata({
    conversationId,
    expectsReadConfirmation,
    from,
    legalHoldStatus,
    metaData: metadata,
  });
  await conversationService.send({
    conversationDomain,
    payload: metadataPayload,
    protocol: ConversationProtocol.PROTEUS,
  });

  const uploadResult = await assetService.uploadAsset(file.data, {
    algorithm: customAlgorithm,
  });

  const asset = await uploadResult.response;

  if (customHash) {
    asset.sha256 = customHash;
  }

  const filePayload = MessageBuilder.createFileData({
    asset: asset,
    conversationId,
    expectsReadConfirmation,
    file,
    from,
    legalHoldStatus,
    originalMessageId: metadataPayload.id,
  });
  return conversationService.send({conversationDomain, payload: filePayload, protocol: ConversationProtocol.PROTEUS});
}
