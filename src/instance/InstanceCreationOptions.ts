import {BackendData} from '@wireapp/api-client/dist/env/';
import {ClientClassification} from '@wireapp/api-client/dist/client/';
import {IsOptional, IsNotEmpty, IsEnum} from 'class-validator';
import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class InstanceCreationOptions {
  @IsOptional()
  backend?: string;

  @IsOptional()
  customBackend?: BackendData;

  @ApiModelProperty({enum: [ClientClassification.DESKTOP, ClientClassification.PHONE, ClientClassification.TABLET]})
  @IsEnum(ClientClassification)
  deviceClass?: ClientClassification.DESKTOP | ClientClassification.PHONE | ClientClassification.TABLET;

  @IsOptional()
  deviceLabel?: string;

  @IsOptional()
  deviceName?: string;

  @ApiModelProperty()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  name?: string;

  @ApiModelProperty()
  @IsNotEmpty()
  password!: string;
}
