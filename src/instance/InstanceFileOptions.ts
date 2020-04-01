import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {LegalHoldStatus} from '@wireapp/core/dist/conversation/content/';
import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested} from 'class-validator';

class AudioMeta {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  durationInMillis?: number;

  @ApiPropertyOptional()
  @IsNumber({}, {each: true})
  @IsOptional()
  normalizedLoudness?: number[];
}

class VideoMeta {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  durationInMillis?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  width?: number;
}

export class InstanceFileOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;

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

  @ApiPropertyOptional()
  @ValidateNested()
  @IsOptional()
  audio?: AudioMeta;

  @ApiPropertyOptional()
  @ValidateNested()
  @IsOptional()
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
  messageTimer?: number;
}
