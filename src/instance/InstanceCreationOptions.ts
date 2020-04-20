import {ApiProperty} from '@nestjs/swagger';
import {ClientClassification} from '@wireapp/api-client/dist/client/';
import {BackendData} from '@wireapp/api-client/dist/env/';
import {IsEnum, IsNotEmpty, IsOptional, ValidateNested} from 'class-validator';

export class InstanceCreationOptions {
  @ApiProperty()
  @IsOptional()
  backend?: string;

  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  customBackend?: BackendData;

  @ApiProperty({enum: [ClientClassification.DESKTOP, ClientClassification.PHONE, ClientClassification.TABLET]})
  @IsEnum(ClientClassification)
  deviceClass?: ClientClassification.DESKTOP | ClientClassification.PHONE | ClientClassification.TABLET;

  @ApiProperty()
  @IsOptional()
  deviceLabel?: string;

  @ApiProperty()
  @IsOptional()
  deviceName?: string;

  @ApiProperty()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsNotEmpty()
  password!: string;
}
