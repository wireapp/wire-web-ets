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
): Promise<ReturnType<ConversationService['send']>> {
  conversationService.messageTimer.setMessageLevelTimer(conversationId, expireAfterMillis);

  const metadataPayload = conversationService.messageBuilder.createFileMetadata(
    conversationId,
    metadata,
    undefined,
    expectsReadConfirmation,
    legalHoldStatus,
  );
  await conversationService.send(metadataPayload);

  const filePayload = await conversationService.messageBuilder.createFileData(
    conversationId,
    file,
    metadataPayload.id,
    expectsReadConfirmation,
    legalHoldStatus,
  );
  return conversationService.send(filePayload);
}
