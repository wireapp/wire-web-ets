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
import {ConversationService} from '@wireapp/core/src/main/conversation';
import {FileContent, FileMetaDataContent} from '@wireapp/core/src/main/conversation/content';

export async function sendFile(
  conversationService: ConversationService,
  conversationId: string,
  file: FileContent,
  metadata: FileMetaDataContent,
  expectsReadConfirmation?: boolean,
  legalHoldStatus?: LegalHoldStatus,
  expireAfterMillis = 0,
  otherHash?: Buffer,
  customAlgorithm?: string,
): Promise<ReturnType<ConversationService['send']>> {
  conversationService.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);

  const metadataPayload = conversationService.messageBuilder.createFileMetadata({
    conversationId,
    expectsReadConfirmation,
    legalHoldStatus,
    metaData: metadata,
  });
  await conversationService.send(metadataPayload);

  const filePayload = await conversationService.messageBuilder.createFileData({
    cipherOptions: {customAlgorithm, otherHash},
    conversationId,
    expectsReadConfirmation,
    file,
    legalHoldStatus,
    originalMessageId: metadataPayload.id,
  });
  return conversationService.send(filePayload);
}
