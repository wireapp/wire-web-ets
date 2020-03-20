import {Controller, Body, Param, Post} from '@nestjs/common';
import {ApiTags, ApiResponse} from '@nestjs/swagger';
import {NewInstanceResponse} from './NewInstanceResponse';
import {InstanceService} from './InstanceService';
import {InstanceCreationOptions} from './InstanceCreationOptions';

@ApiTags('Instance')
@Controller('instance')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {}

  @Post(':id')
  @ApiResponse({status: 201, type: NewInstanceResponse})
  async createInstance(@Param('id') id: number, @Body() body: InstanceCreationOptions): Promise<NewInstanceResponse> {
    const instanceId = await this.instanceService.createInstance(body);

    return {
      instanceId,
      name: body.name || '',
    };
  }
}
