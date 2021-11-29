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
import {IsOptional, IsString, IsUUID, ValidateNested, IsEnum, IsBoolean, IsNumber} from 'class-validator';
import {Type} from 'class-transformer';
import {LegalHoldStatus} from '@wireapp/core/src/main/conversation/content';

class QuoteMeta {
  @ApiProperty({example: ''})
  @IsUUID(4)
  quotedMessageId!: string;

  @ApiProperty({example: ''})
  @IsString()
  quotedMessageSha256!: string;
}

class MentionsMeta {
  @ApiProperty({example: 0})
  @IsNumber()
  length!: number;

  @ApiProperty({example: 0})
  @IsNumber()
  start!: number;

  @ApiProperty({example: ''})
  @IsUUID(4)
  userId!: string;

  @ApiProperty({example: ''})
  @IsString()
  @IsOptional()
  userDomain?: string;
}

class TweetMeta {
  @ApiPropertyOptional({example: ''})
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({example: ''})
  @IsString()
  @IsOptional()
  username?: string;
}

class ImageMeta {
  @ApiPropertyOptional({example: 'example.com'})
  @IsString()
  @IsOptional()
  conversationDomain?: string;

  @ApiProperty({example: ''})
  @IsString()
  data!: string;

  @ApiPropertyOptional({example: false})
  @IsBoolean()
  @IsOptional()
  expectsReadConfirmation?: boolean;

  @ApiProperty({example: 0})
  @IsNumber()
  height!: number;

  @ApiPropertyOptional({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsEnum(LegalHoldStatus)
  @IsOptional()
  legalHoldStatus?: LegalHoldStatus;

  @ApiPropertyOptional({example: 0})
  @IsNumber()
  @IsOptional()
  messageTimer?: number;

  @ApiProperty({example: ''})
  @IsString()
  type!: string;

  @ApiProperty({example: 0})
  @IsNumber()
  width!: number;
}

class LinkPreviewMeta {
  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => ImageMeta)
  @IsOptional()
  image?: ImageMeta;

  @ApiPropertyOptional({example: ''})
  @IsString()
  @IsOptional()
  permanentUrl?: string;

  @ApiPropertyOptional({example: ''})
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({example: ''})
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => TweetMeta)
  @IsOptional()
  tweet?: TweetMeta;

  @ApiProperty({example: ''})
  @IsString()
  url!: string;

  @ApiProperty({example: 0})
  @IsNumber()
  urlOffset!: number;
}

export class InstanceTextOptions {
  @ApiPropertyOptional({isArray: true, type: String})
  @IsString({each: true})
  @IsOptional()
  buttons?: string[];

  @ApiPropertyOptional({example: 'example.com'})
  @IsString()
  @IsOptional()
  conversationDomain?: string;

  @ApiProperty({example: ''})
  @IsUUID()
  conversationId!: string;

  @ApiPropertyOptional({example: false})
  @IsBoolean()
  @IsOptional()
  expectsReadConfirmation?: boolean;

  @ApiPropertyOptional({
    enum: [LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED],
  })
  @IsEnum(LegalHoldStatus)
  @IsOptional()
  legalHoldStatus?: LegalHoldStatus;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => LinkPreviewMeta)
  @IsOptional()
  linkPreview?: LinkPreviewMeta;

  @ApiPropertyOptional({isArray: true, type: MentionsMeta})
  @ValidateNested({each: true})
  @Type(() => MentionsMeta)
  @IsOptional()
  mentions?: MentionsMeta[];

  @ApiPropertyOptional({example: 0})
  @IsOptional()
  messageTimer?: number;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => QuoteMeta)
  @IsOptional()
  quote?: QuoteMeta;

  @ApiProperty({example: ''})
  @IsString()
  text!: string;
}
