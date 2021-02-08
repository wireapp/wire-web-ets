import {ApiProperty} from '@nestjs/swagger';
import {IsUUID, IsString} from 'class-validator';

export class InstanceBreakSessionOptions {
  @ApiProperty()
  @IsUUID(4)
  userId!: string;

  @ApiProperty()
  @IsString()
  clientId!: string;
}
