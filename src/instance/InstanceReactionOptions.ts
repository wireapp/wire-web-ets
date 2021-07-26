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
import {ReactionType} from '@wireapp/core/src/main/conversation';
import {LegalHoldStatus} from '@wireapp/core/src/main/conversation/content/';
import {IsEnum, IsOptional, IsString, IsUUID} from 'class-validator';

export class InstanceReactionOptions {
  @ApiPropertyOptional({example: 'example.com'})
  @IsString()
  @IsOptional()
  conversationDomain?: string;

  @ApiProperty({example: ''})
  @IsUUID(4)
  conversationId!: string;

  @ApiPropertyOptional({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsEnum(LegalHoldStatus)
  @IsOptional()
  legalHoldStatus?: LegalHoldStatus;

  @ApiProperty({example: ''})
  @IsUUID(4)
  originalMessageId!: string;

  @ApiProperty({
    enum: [ReactionType.LIKE, ReactionType.NONE],
  })
  @IsEnum(ReactionType)
  type!: ReactionType;
}
