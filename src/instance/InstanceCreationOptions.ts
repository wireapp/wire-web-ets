import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {ClientClassification} from '@wireapp/api-client/dist/client/';
import {Type} from 'class-transformer';
import {IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, isEmail, IsEmail} from 'class-validator';

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
  @ApiPropertyOptional({example: 'staging'})
  @IsOptional()
  backend?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @IsOptional()
  @Type(() => BackendMeta)
  customBackend?: BackendMeta;

  @ApiPropertyOptional({enum: [ClientClassification.DESKTOP, ClientClassification.PHONE, ClientClassification.TABLET]})
  @IsEnum(ClientClassification)
  @IsOptional()
  deviceClass?: ClientClassification.DESKTOP | ClientClassification.PHONE | ClientClassification.TABLET;

  @ApiPropertyOptional({example: ''})
  @IsOptional()
  deviceLabel?: string;

  @ApiProperty({example: ''})
  @IsNotEmpty()
  deviceName!: string;

  @ApiProperty({example: 'email@example.com'})
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiProperty({example: ''})
  @IsNotEmpty()
  password!: string;
}
