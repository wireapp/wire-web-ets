import {ApiProperty} from '@nestjs/swagger';
import {IsUUID} from 'class-validator';

export class InstanceDeleteOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;

  @ApiProperty()
  @IsUUID('4')
  messageId!: string;
}
