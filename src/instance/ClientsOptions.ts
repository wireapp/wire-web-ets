import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsNotEmpty, IsOptional, IsString, ValidateNested, IsEmail} from 'class-validator';

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

export class ClientsOptions {
  @ApiPropertyOptional({example: 'staging'})
  @IsOptional()
  backend?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @IsOptional()
  @Type(() => BackendMeta)
  customBackend?: BackendMeta;

  @ApiProperty({example: 'email@example.com'})
  @IsEmail()
  email!: string;

  @ApiProperty({example: ''})
  @IsNotEmpty()
  password!: string;
}
