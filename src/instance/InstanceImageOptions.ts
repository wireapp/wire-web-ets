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
import {IsUUID, IsBoolean, IsNumber, IsOptional, IsEnum, IsString} from 'class-validator';
import {LegalHoldStatus} from '@wireapp/core/src/main/conversation/content/';

export class InstanceImageOptions {
  @ApiPropertyOptional({example: 'example.com'})
  @IsOptional()
  @IsString()
  conversationDomain?: string;

  @ApiProperty({example: ''})
  @IsUUID(4)
  conversationId!: string;

  @ApiProperty({example: ''})
  @IsString()
  data!: string;

  @ApiProperty({example: false})
  @IsBoolean()
  @IsOptional()
  expectsReadConfirmation?: boolean;

  @ApiProperty({example: 0})
  @IsNumber()
  height!: number;

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

  @ApiProperty({example: 0})
  @IsNumber()
  width!: number;
}
