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

import {ApiProperty} from '@nestjs/swagger';
import {CONVERSATION_TYPING} from '@wireapp/api-client/src/conversation/data/';
import {IsEnum, IsUUID} from 'class-validator';

export class InstanceTypingOptions {
  @ApiProperty({example: ''})
  @IsUUID(4)
  conversationId!: string;

  @ApiProperty({
    enum: [CONVERSATION_TYPING.STARTED, CONVERSATION_TYPING.STOPPED],
  })
  @IsEnum(CONVERSATION_TYPING)
  status!: CONVERSATION_TYPING;
}
