import {ApiProperty} from '@nestjs/swagger';
import {IsUUID} from 'class-validator';

export class InstanceDeliveryOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;

  @ApiProperty()
  @IsUUID('4')
  firstMessageId!: string;

  @ApiProperty()
  @IsUUID('4')
  moreMessageIds!: string[];
}
