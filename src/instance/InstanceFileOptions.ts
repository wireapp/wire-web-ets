/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {LegalHoldStatus} from '@wireapp/core/src/main/conversation/content/';
import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested} from 'class-validator';
import {Type} from 'class-transformer';

class AudioMeta {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  durationInMillis?: number;

  @ApiPropertyOptional({isArray: true, type: Number})
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
  @Type(() => AudioMeta)
  @IsOptional()
  audio?: AudioMeta;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => VideoMeta)
  @IsOptional()
  video?: VideoMeta;

  @ApiPropertyOptional({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsEnum(LegalHoldStatus)
  @IsOptional()
  legalHoldStatus?: LegalHoldStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  expectsReadConfirmation?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  messageTimer?: number;
}
