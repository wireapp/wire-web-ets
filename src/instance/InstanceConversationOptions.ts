import {ApiProperty} from '@nestjs/swagger';
import {IsUUID} from 'class-validator';

export class InstanceConversationOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;
}
