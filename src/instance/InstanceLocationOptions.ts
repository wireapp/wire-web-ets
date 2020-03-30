import {ApiProperty} from '@nestjs/swagger';
import {IsUUID, IsBoolean, IsNumber, IsOptional, IsEnum, IsString} from 'class-validator';
import {LegalHoldStatus} from '@wireapp/core/dist/conversation/content/';

export class InstanceLocationOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;

  @ApiProperty()
  @IsNumber()
  latitude!: number;

  @ApiProperty()
  @IsNumber()
  longitude!: number;

  @ApiProperty({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsOptional()
  @IsEnum(LegalHoldStatus)
  legalHoldStatus!: LegalHoldStatus;

  @ApiProperty()
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  zoom?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  expectsReadConfirmation?: boolean;

  @ApiProperty()
  @IsOptional()
  messageTimer?: number;
}
