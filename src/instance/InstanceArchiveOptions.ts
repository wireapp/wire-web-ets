import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';

export class InstanceArchiveOptions {
  @ApiProperty()
  @IsNotEmpty()
  archived!: boolean;

  @ApiProperty()
  @IsNotEmpty()
  conversationId!: string;
}
