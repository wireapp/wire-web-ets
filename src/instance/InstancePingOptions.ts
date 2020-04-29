import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {LegalHoldStatus} from '@wireapp/core/dist/conversation/content/';
import {IsBoolean, IsEnum, IsOptional, IsUUID} from 'class-validator';

export class InstancePingOptions {
  @ApiProperty()
  @IsUUID(4)
  conversationId!: string;

  @ApiPropertyOptional({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsOptional()
  @IsEnum(LegalHoldStatus)
  legalHoldStatus?: LegalHoldStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  expectsReadConfirmation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  messageTimer?: number;
}
