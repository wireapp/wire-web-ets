import {Body, Controller, Put, Delete, Param, Res, Get, Post} from '@nestjs/common';
import {ApiTags, ApiResponse, ApiOperation} from '@nestjs/swagger';
import {InstanceCreationOptions} from './InstanceCreationOptions';
import {InstanceService} from './InstanceService';
import {NewInstanceResponse} from './NewInstanceResponse';
import {ErrorMessage, ServerErrorMessage} from '../config';
import * as HTTP_STATUS_CODE from 'http-status-codes';
import {Response} from 'express';
import {Validator} from 'class-validator';
import {InstanceClearOptions} from './InstanceClearOptions';

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
  @ApiResponse({description: 'Validation error', status: 422})
  @ApiResponse({description: 'Internal server error', status: 500})
  async deleteInstance(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    const validator = new Validator();
    if (!validator.isUUID(instanceId, '4')) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
        error: `Instance ID must me a UUID.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    await this.instanceService.deleteInstance(instanceId);
  }

  @Get(':instanceId')
  @ApiOperation({summary: 'Get information about an instance.'})
  @ApiResponse({description: 'The instance has successfully deleted.', status: 200})
  @ApiResponse({description: 'Instance not found', status: 404})
  @ApiResponse({description: 'Validation error', status: 422})
  @ApiResponse({description: 'Internal server error', status: 500})
  async getInstance(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    const validator = new Validator();
    if (!validator.isUUID(instanceId, '4')) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
        error: `Instance ID must me a UUID.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    try {
      const instance = this.instanceService.getInstance(instanceId);
      res.json({
        backend: instance.backendType.name,
        clientId: instance.client.context!.clientId,
        instanceId,
        name: instance.name,
      });
    } catch (error) {
      const errorMessage: ServerErrorMessage = {
        code: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        error: error.message,
        stack: error.stack,
      };
      res.status(errorMessage.code).json(errorMessage);
    }
  }

  @Post(':instanceId/clear')
  @ApiOperation({summary: 'Clear a conversation.'})
  @ApiResponse({description: 'The conversation archived status has been updated.', status: 200})
  @ApiResponse({description: 'Instance not found', status: 404})
  @ApiResponse({description: 'Validation error', status: 422})
  @ApiResponse({description: 'Internal server error', status: 500})
  async clearConversation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceClearOptions,
    @Res() res: Response,
  ): Promise<void> {
    const validator = new Validator();
    if (!validator.isUUID(instanceId, '4')) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
        error: `Instance ID must me a UUID.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    try {
      const instanceName = await this.instanceService.toggleArchiveConversation(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      const errorMessage: ServerErrorMessage = {
        code: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        error: error.message,
        stack: error.stack,
      };
      res.status(errorMessage.code).json(errorMessage);
    }
  }
}
