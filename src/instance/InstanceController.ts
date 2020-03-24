import {Body, Controller, Put} from '@nestjs/common';
import {ApiTags, ApiResponse} from '@nestjs/swagger';
import {InstanceCreationOptions} from './InstanceCreationOptions';
import {InstanceService} from './InstanceService';
import {NewInstanceResponse} from './NewInstanceResponse';

@ApiTags('Instance')
@Controller('instance')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {}

  @Put()
  @ApiResponse({description: 'The instance has successfully created.', status: 200})
  @ApiResponse({description: 'Validation error.', status: 422})
  @ApiResponse({description: 'Bad request.', status: 400})
  @ApiResponse({description: 'Internal server error.', status: 500})
  async putInstance(@Body() body: InstanceCreationOptions): Promise<NewInstanceResponse> {
    const instanceId = await this.instanceService.createInstance(body);
    return {
      instanceId,
      name: body.name || '',
    };
  }
}
