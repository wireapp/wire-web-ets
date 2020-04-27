import {ApiProperty} from '@nestjs/swagger';
import {IsUUID} from 'class-validator';

export class InstanceDeliveryOptions {
  @ApiProperty()
  @IsUUID(4)
  conversationId!: string;

  @ApiProperty()
  @IsUUID(4)
  firstMessageId!: string;

  @ApiProperty({isArray: true, type: String})
  @IsUUID(4, {each: true})
  moreMessageIds!: string[];
}
