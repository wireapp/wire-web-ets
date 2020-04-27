import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsUUID, IsOptional} from 'class-validator';

export class InstanceDeliveryOptions {
  @ApiProperty()
  @IsUUID(4)
  conversationId!: string;

  @ApiProperty()
  @IsUUID(4)
  firstMessageId!: string;

  @ApiPropertyOptional({isArray: true, type: String})
  @IsUUID(4, {each: true})
  @IsOptional()
  moreMessageIds?: string[];
}
