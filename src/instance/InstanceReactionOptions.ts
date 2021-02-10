import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {ReactionType} from '@wireapp/core/src/main/conversation';
import {LegalHoldStatus} from '@wireapp/core/src/main/conversation/content/';
import {IsEnum, IsOptional, IsUUID} from 'class-validator';

export class InstanceReactionOptions {
  @ApiProperty()
  @IsUUID(4)
  conversationId!: string;

  @ApiProperty()
  @IsUUID(4)
  originalMessageId!: string;

  @ApiProperty({
    enum: [ReactionType.LIKE, ReactionType.NONE],
  })
  @IsEnum(ReactionType)
  type!: ReactionType;

  @ApiPropertyOptional({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsOptional()
  @IsEnum(LegalHoldStatus)
  legalHoldStatus?: LegalHoldStatus;
}
