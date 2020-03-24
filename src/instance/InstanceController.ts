import {Body, Controller, Put, Delete, Param, Res} from '@nestjs/common';
import {ApiTags, ApiResponse, ApiOperation} from '@nestjs/swagger';
import {InstanceCreationOptions} from './InstanceCreationOptions';
import {InstanceService} from './InstanceService';
import {NewInstanceResponse} from './NewInstanceResponse';
import {ErrorMessage} from '../config';
import * as HTTP_STATUS_CODE from 'http-status-codes';
import {Response} from 'express';

@ApiTags('Instance')
@Controller('instance')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {}

  @Put()
  @ApiOperation({summary: 'Create a new instance.'})
  @ApiResponse({description: 'The instance has successfully created.', status: 200})
  @ApiResponse({description: 'Bad request', status: 400})
  @ApiResponse({description: 'Validation error', status: 422})
  @ApiResponse({description: 'Internal server error', status: 500})
  async putInstance(@Body() body: InstanceCreationOptions): Promise<NewInstanceResponse> {
    const instanceId = await this.instanceService.createInstance(body);
    return {
      instanceId,
      name: body.name || '',
    };
  }

  @Delete(':instanceId')
  @ApiOperation({summary: 'Delete an instance.'})
  @ApiResponse({description: 'The instance has successfully deleted.', status: 200})
  @ApiResponse({description: 'Instance not found', status: 404})
  @ApiResponse({description: 'Internal server error', status: 500})
  async deleteInstance(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!this.instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    await this.instanceService.deleteInstance(instanceId);
  }
}
