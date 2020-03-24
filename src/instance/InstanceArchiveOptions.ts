import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {IsNotEmpty} from 'class-validator';

export class InstanceArchiveOptions {
  @ApiModelProperty()
  @IsNotEmpty()
  archived!: boolean;

  @ApiModelProperty()
  @IsNotEmpty()
  conversationId!: string;
}
