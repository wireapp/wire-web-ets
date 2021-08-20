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
import {Type} from 'class-transformer';
import {IsNotEmpty, IsOptional, IsString, ValidateNested, IsEmail} from 'class-validator';
import {BackendIdentifier} from "./InstanceService";

export class BackendMeta {
  @ApiProperty({example: 'my custom backend'})
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({example: 'https://...'})
  @IsString()
  @IsNotEmpty()
  rest!: string;

  @ApiProperty({example: 'wss://...'})
  @IsString()
  @IsNotEmpty()
  ws!: string;
}

export class ClientsOptions {
  @ApiPropertyOptional({example: 'staging'})
  @IsString()
  @IsOptional()
  backend?: BackendIdentifier;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => BackendMeta)
  @IsOptional()
  customBackend?: BackendMeta;

  @ApiProperty({example: 'email@example.com'})
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({example: ''})
  @IsNotEmpty()
  @IsString()
  password!: string;
}
