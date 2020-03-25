import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsUUID} from 'class-validator';

export class InstanceArchiveOptions {
  @ApiProperty()
  @IsNotEmpty()
  archived!: boolean;

  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;
}
