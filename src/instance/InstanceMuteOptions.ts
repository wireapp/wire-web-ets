import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsUUID} from 'class-validator';

export class InstanceMuteOptions {
  @ApiProperty()
  @IsNotEmpty()
  muted!: boolean;

  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;
}
