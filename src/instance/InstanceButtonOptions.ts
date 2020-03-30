import {ApiProperty} from '@nestjs/swagger';
import {IsUUID, IsString} from 'class-validator';

export class InstanceButtonOptions {
  @ApiProperty()
  @IsUUID('4')
  conversationId!: string;

  @ApiProperty()
  @IsUUID('4')
  referenceMessageId!: string;

  @ApiProperty()
  @IsString()
  buttonId!: string;

  @ApiProperty()
  @IsUUID('4', {each: true})
  userIds!: string[];
}
