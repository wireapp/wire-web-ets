import {ApiProperty} from '@nestjs/swagger';
import {ClientClassification} from '@wireapp/api-client/dist/client/';
import {Type} from 'class-transformer';
import {IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator';

export class BackendMeta {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  rest!: string;

  @ApiProperty()
  @IsString()
  ws!: string;
}

export class InstanceCreationOptions {
  @ApiProperty()
  @IsOptional()
  backend?: string;

  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  @Type(() => BackendMeta)
  customBackend?: BackendMeta;

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
