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
  @ApiPropertyOptional({example: 0})
  @IsNumber()
  @IsOptional()
  durationInMillis?: number;

  @ApiPropertyOptional({isArray: true, type: Number})
  @IsNumber({}, {each: true})
  @IsOptional()
  normalizedLoudness?: number[];
}

class VideoMeta {
  @ApiPropertyOptional({example: 0})
  @IsNumber()
  @IsOptional()
  durationInMillis?: number;

  @ApiPropertyOptional({example: 0})
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({example: 0})
  @IsNumber()
  @IsOptional()
  width?: number;
}

export class InstanceFileOptions {
  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AudioMeta)
  @IsOptional()
  audio?: AudioMeta;

  @ApiPropertyOptional({example: 'example.com'})
  @IsOptional()
  @IsString()
  conversationDomain?: string;

  @ApiProperty({example: ''})
  @IsUUID()
  conversationId!: string;

  @ApiProperty({example: ''})
  @IsString()
  data!: string;

  @ApiProperty({example: ''})
  @IsString()
  fileName!: string;

  @ApiPropertyOptional({example: false})
  @IsOptional()
  @IsBoolean()
  expectsReadConfirmation?: boolean;

  @ApiPropertyOptional({example: false})
  @IsOptional()
  @IsBoolean()
  invalidHash?: boolean;

  @ApiPropertyOptional({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsEnum(LegalHoldStatus)
  @IsOptional()
  legalHoldStatus?: LegalHoldStatus;

  @ApiPropertyOptional({example: 0})
  @IsNumber()
  @IsOptional()
  @IsNumber()
  messageTimer?: number;

  @ApiPropertyOptional({example: false})
  @IsOptional()
  @IsBoolean()
  otherAlgorithm?: boolean;

  @ApiPropertyOptional({example: false})
  @IsOptional()
  @IsBoolean()
  otherHash?: boolean;

  @ApiProperty({example: ''})
  @IsString()
  type!: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => VideoMeta)
  @IsOptional()
  video?: VideoMeta;
}
