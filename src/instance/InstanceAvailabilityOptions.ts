import {ApiProperty} from '@nestjs/swagger';
import {Availability} from '@wireapp/protocol-messaging';
import {IsEnum, IsUUID} from 'class-validator';

export class InstanceAvailabilityOptions {
  @ApiProperty({
    enum: [Availability.Type.AVAILABLE, Availability.Type.AWAY, Availability.Type.BUSY, Availability.Type.NONE],
  })
  @IsEnum(Availability.Type)
  type!: Availability.Type;

  @ApiProperty()
  @IsUUID('4')
  teamId!: string;
}
