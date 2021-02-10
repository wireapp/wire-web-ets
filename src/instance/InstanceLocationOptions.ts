import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsUUID, IsBoolean, IsNumber, IsOptional, IsEnum, IsString} from 'class-validator';
import {LegalHoldStatus} from '@wireapp/core/src/main/conversation/content/';

export class InstanceLocationOptions {
  @ApiProperty()
  @IsUUID(4)
  conversationId!: string;

  @ApiProperty()
  @IsNumber()
  latitude!: number;

  @ApiProperty()
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsOptional()
  @IsEnum(LegalHoldStatus)
  legalHoldStatus?: LegalHoldStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  zoom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  expectsReadConfirmation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  messageTimer?: number;
}
