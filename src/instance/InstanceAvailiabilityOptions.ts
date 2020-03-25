import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsUUID, IsEnum} from 'class-validator';
import {Availability} from '@wireapp/protocol-messaging';

export class InstanceAvailiabilityOptions {
  @ApiProperty({
    enum: [Availability.Type.AVAILABLE, Availability.Type.AWAY, Availability.Type.BUSY, Availability.Type.NONE],
  })
  @IsNotEmpty()
  @IsEnum(Availability.Type)
  type!: Availability.Type;

  @ApiProperty()
  @IsUUID('4')
  teamId!: string;
}
