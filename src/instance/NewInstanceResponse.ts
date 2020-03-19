import { ApiProperty } from "@nestjs/swagger";

export class NewInstanceResponse {
  @ApiProperty()
  instanceId!: string;

  @ApiProperty()
  name!: string;
}
