import {ApiProperty} from '@nestjs/swagger';
import {IsUUID, IsBoolean, IsNumber, IsOptional, IsEnum} from 'class-validator';
import {LegalHoldStatus} from '@wireapp/core/dist/conversation/content/';

export class InstanceImageOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;

  @ApiProperty()
  data!: string;

  @ApiProperty()
  @IsNumber()
  height!: number;

  @ApiProperty()
  @IsNumber()
  width!: number;

  @ApiProperty()
  type!: string;

  @ApiProperty({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsEnum(LegalHoldStatus)
  legalHoldStatus!: LegalHoldStatus;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  expectsReadConfirmation?: boolean;

  @ApiProperty()
  @IsOptional()
  messageTimer?: number;
}
