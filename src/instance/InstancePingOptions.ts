import {ApiProperty} from '@nestjs/swagger';
import {LegalHoldStatus} from '@wireapp/core/dist/conversation/content/';
import {IsBoolean, IsEnum, IsOptional, IsUUID} from 'class-validator';

export class InstancePingOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;

  @ApiProperty({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsOptional()
  @IsEnum(LegalHoldStatus)
  legalHoldStatus?: LegalHoldStatus;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  expectsReadConfirmation?: boolean;

  @ApiProperty()
  @IsOptional()
  messageTimer?: number;
}
