import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsUUID, IsBoolean, IsNumber, IsOptional, IsEnum, IsString} from 'class-validator';
import {LegalHoldStatus} from '@wireapp/core/src/main/conversation/content/';

export class InstanceImageOptions {
  @ApiProperty()
  @IsUUID(4)
  conversationId!: string;

  @ApiProperty()
  @IsString()
  data!: string;

  @ApiProperty()
  @IsNumber()
  height!: number;

  @ApiProperty()
  @IsNumber()
  width!: number;

  @ApiProperty()
  @IsString()
  type!: string;

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
  @IsNumber()
  messageTimer?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  otherHash?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  invalidHash?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  otherCipher?: boolean;
}
