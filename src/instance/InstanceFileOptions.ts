import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {LegalHoldStatus} from '@wireapp/core/src/main/conversation/content/';
import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested} from 'class-validator';
import {Type} from 'class-transformer';

class AudioMeta {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationInMillis?: number;

  @ApiPropertyOptional({isArray: true, type: Number})
  @IsOptional()
  @IsNumber({}, {each: true})
  normalizedLoudness?: number[];
}

class VideoMeta {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationInMillis?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  width?: number;
}

export class InstanceFileOptions {
  @ApiProperty()
  @IsUUID(4)
  conversationId!: string;

  @ApiProperty()
  @IsString()
  data!: string;

  @ApiProperty()
  @IsString()
  fileName!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @IsOptional()
  @Type(() => AudioMeta)
  audio?: AudioMeta;

  @ApiPropertyOptional()
  @ValidateNested()
  @IsOptional()
  @Type(() => VideoMeta)
  video?: VideoMeta;

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
