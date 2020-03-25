import {ApiProperty} from '@nestjs/swagger';
import {IsUUID, IsBoolean} from 'class-validator';

export class InstanceMuteOptions {
  @ApiProperty()
  @IsBoolean()
  muted!: boolean;

  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;
}
