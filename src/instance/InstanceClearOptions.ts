import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsUUID} from 'class-validator';

export class InstanceClearOptions {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  conversationId!: string;
}
