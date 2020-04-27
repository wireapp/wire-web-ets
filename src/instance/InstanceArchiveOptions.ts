import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsUUID} from 'class-validator';

export class InstanceArchiveOptions {
  @ApiProperty()
  @IsBoolean()
  archived!: boolean;

  @ApiProperty()
  @IsUUID(4)
  conversationId!: string;
}
