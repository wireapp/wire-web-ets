import {ApiProperty} from '@nestjs/swagger';
import {IsUUID, IsBoolean, IsNumber, IsOptional, IsEnum, IsString, ValidateNested} from 'class-validator';
import {LegalHoldStatus, AudioMetaData, VideoMetaData} from '@wireapp/core/dist/conversation/content/';

export class InstanceFileOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;

  @ApiProperty()
  @ValidateNested()
  audio!: AudioMetaData;

  @ApiProperty()
  @ValidateNested()
  video!: VideoMetaData;

  @ApiProperty()
  @IsString()
  data!: string;

  @ApiProperty()
  @IsString()
  fileName!: string;

  @ApiProperty()
  @IsNumber()
  height!: number;

  @ApiProperty()
  @IsNumber()
  width!: number;

  @ApiProperty()
  @IsString()
  type!: string;

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
