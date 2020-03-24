import {BackendData} from '@wireapp/api-client/dist/env/';
import {ClientClassification} from '@wireapp/api-client/dist/client/';
import {IsOptional, IsNotEmpty, IsEnum} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class InstanceCreationOptions {
  @IsOptional()
  backend?: string;

  @IsOptional()
  customBackend?: BackendData;

  @ApiProperty({enum: [ClientClassification.DESKTOP, ClientClassification.PHONE, ClientClassification.TABLET]})
  @IsEnum(ClientClassification)
  deviceClass?: ClientClassification.DESKTOP | ClientClassification.PHONE | ClientClassification.TABLET;

  @IsOptional()
  deviceLabel?: string;

  @IsOptional()
  deviceName?: string;

  @ApiProperty()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsNotEmpty()
  password!: string;
}
