import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty} from 'class-validator';

export class InstanceClearOptions {
  @ApiProperty()
  @IsNotEmpty()
  conversationId!: string;
}
