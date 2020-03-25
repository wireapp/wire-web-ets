import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsUUID} from 'class-validator';
import {AvailabilityType} from '@wireapp/core/dist/broadcast';
import {Availability} from '@wireapp/protocol-messaging';

export class InstanceAvailiabilityOptions {
  @ApiProperty({
    enum: [Availability.Type.AVAILABLE, Availability.Type.AWAY, Availability.Type.BUSY, Availability.Type.NONE],
  })
  @IsNotEmpty()
  type!: AvailabilityType;

  @ApiProperty()
  @IsUUID('4')
  teamId!: string;
}
