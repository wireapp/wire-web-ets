import {ApiProperty} from '@nestjs/swagger';
import {IsUUID} from 'class-validator';

export class InstanceClearOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;
}
