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
import {ClientClassification} from '@wireapp/api-client/src/client/';
import {Type} from 'class-transformer';
import {IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator';
import {InvalidateIf} from '../util/validationUtil';

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

export class InstanceCreationOptions {
  @InvalidateIf<InstanceCreationOptions>(options => !!options.customBackend, {
    message: 'Only one of backend or customBackend supported.',
  })
  @ApiPropertyOptional({example: 'staging'})
  @IsString()
  @IsOptional()
  backend?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => BackendMeta)
  @IsOptional()
  customBackend?: BackendMeta;

  @ApiPropertyOptional({example: 'anta.wire.link'})
  @IsString()
  @IsOptional()
  federationDomain?: string;

  @ApiPropertyOptional({enum: [ClientClassification.DESKTOP, ClientClassification.PHONE, ClientClassification.TABLET]})
  @IsEnum(ClientClassification)
  @IsOptional()
  deviceClass?: ClientClassification.DESKTOP | ClientClassification.PHONE | ClientClassification.TABLET;

  @ApiPropertyOptional({example: 'ETS Device Label'})
  @IsString()
  @IsOptional()
  deviceLabel?: string;

  @ApiProperty({example: 'ETS Device Model'})
  @IsString()
  @IsNotEmpty()
  deviceName!: string;

  @ApiProperty({example: 'email@example.com'})
  @IsString()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({example: true})
  @IsBoolean()
  @IsOptional()
  isTemporary?: boolean;

  @ApiPropertyOptional({example: 'My ETS Instance'})
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({example: ''})
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({example: '000000'})
  @IsString()
  @IsOptional()
  verificationCode?: string;
}
