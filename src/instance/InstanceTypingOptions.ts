import {ApiProperty} from '@nestjs/swagger';
import {CONVERSATION_TYPING} from '@wireapp/api-client/src/conversation/data/';
import {IsEnum, IsUUID} from 'class-validator';

export class InstanceTypingOptions {
  @ApiProperty()
  @IsUUID(4)
  conversationId!: string;

  @ApiProperty({
    enum: [CONVERSATION_TYPING.STARTED, CONVERSATION_TYPING.STOPPED],
  })
  @IsEnum(CONVERSATION_TYPING)
  status!: CONVERSATION_TYPING;
}
