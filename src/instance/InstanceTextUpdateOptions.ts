import {ApiProperty} from '@nestjs/swagger';
import {IsUUID} from 'class-validator';
import {InstanceTextOptions} from './InstanceTextOptions';

export class InstanceTextUpdateOptions extends InstanceTextOptions {
  @ApiProperty()
  @IsUUID('4')
  firstMessageId!: string;
}
