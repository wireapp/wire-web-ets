import {ApiProperty} from '@nestjs/swagger';
import {LegalHoldStatus} from '@wireapp/core/dist/conversation/content/';
import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested} from 'class-validator';

class AudioMeta {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  durationInMillis?: number;

  @ApiProperty()
  @IsNumber({}, {each: true})
  @IsOptional()
  normalizedLoudness?: number[];
}

class VideoMeta {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  durationInMillis?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty()
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

  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  audio?: AudioMeta;

  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  video?: VideoMeta;

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
