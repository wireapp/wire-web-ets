import {ApiProperty} from '@nestjs/swagger';
import {ClientClassification} from '@wireapp/api-client/dist/client/';
import {Type} from 'class-transformer';
import {IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator';

export class BackendMeta {
  @ApiProperty({example: 'my custom backend'})
  @IsString()
  name!: string;

  @ApiProperty({example: 'https://...'})
  @IsString()
  rest!: string;

  @ApiProperty({example: 'wss://...'})
  @IsString()
  ws!: string;
}

export class InstanceCreationOptions {
  @ApiProperty({example: 'staging'})
  @IsOptional()
  backend?: string;

  @ApiProperty()
  @ValidateNested()
  @IsOptional()
  @Type(() => BackendMeta)
  customBackend?: BackendMeta;

  @ApiProperty({enum: [ClientClassification.DESKTOP, ClientClassification.PHONE, ClientClassification.TABLET]})
  @IsEnum(ClientClassification)
  @IsOptional()
  deviceClass?: ClientClassification.DESKTOP | ClientClassification.PHONE | ClientClassification.TABLET;

  @ApiProperty({example: ''})
  @IsOptional()
  deviceLabel?: string;

  @ApiProperty({example: ''})
  deviceName?: string;

  @ApiProperty({example: 'email@example.com'})
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsOptional()
  name?: string;

  @ApiProperty({example: ''})
  @IsNotEmpty()
  password!: string;
}
