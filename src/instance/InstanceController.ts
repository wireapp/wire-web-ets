import {Body, Controller, Put} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {InstanceCreationOptions} from './InstanceCreationOptions';
import {InstanceService} from './InstanceService';
import {NewInstanceResponse} from './NewInstanceResponse';

@ApiTags('Instance')
@Controller('instance')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {}

  @Put()
  async putInstance(@Body() body: InstanceCreationOptions): Promise<NewInstanceResponse> {
    const instanceId = await this.instanceService.createInstance(body);
    return {
      instanceId,
      name: body.name || '',
    };
  }
}
