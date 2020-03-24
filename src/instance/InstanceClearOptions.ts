import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import {IsNotEmpty} from 'class-validator';

export class InstanceClearOptions {
  @ApiModelProperty()
  @IsNotEmpty()
  conversationId!: string;
}
