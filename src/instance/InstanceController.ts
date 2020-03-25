import {Body, Controller, Delete, Get, Param, Post, Put, Res} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Validator} from 'class-validator';
import {Response} from 'express';
import * as HTTP_STATUS_CODE from 'http-status-codes';
import {ErrorMessage, ServerErrorMessage} from '../config';
import {InstanceClearOptions} from './InstanceClearOptions';
import {InstanceCreationOptions} from './InstanceCreationOptions';
import {InstanceService} from './InstanceService';
import {InstanceArchiveOptions} from './InstanceArchiveOptions';
import {status500description, status422description} from '../utils';
import {InstanceAvailiabilityOptions} from './InstanceAvailiabilityOptions';

const isUUID = (text: string) => new Validator().isUUID(text, '4');
const errorMessageInstanceUUID: ErrorMessage = {
  code: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  error: `Instance ID must me a UUID.`,
};

const errorMessageInternalServer = (error: any): ServerErrorMessage => {
  return {
    code: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    error: error.message,
    stack: error.stack,
  };
};

@ApiTags('Instance')
@Controller('instance')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {}

  @Put()
  @ApiOperation({summary: 'Create a new instance.'})
  @ApiResponse({description: 'The instance has successfully created.', status: 200})
  @ApiResponse({description: 'Bad request', status: 400})
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async putInstance(@Body() body: InstanceCreationOptions, @Res() res: Response): Promise<void> {
    const instanceId = await this.instanceService.createInstance(body);
    res.status(HTTP_STATUS_CODE.OK).json({
      instanceId,
      name: body.name || '',
    });
  }

  @Delete(':instanceId')
  @ApiOperation({summary: 'Delete an instance.'})
  @ApiResponse({description: 'The instance has successfully deleted.', status: 200})
  @ApiResponse({description: 'Instance not found', status: 404})
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async deleteInstance(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
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
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getInstance(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
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
      res.status(errorMessageInternalServer(error).code).json(errorMessageInternalServer(error));
    }
  }

  @Post(':instanceId/archive')
  @ApiOperation({summary: 'Archive a conversation.'})
  @ApiResponse({description: 'The conversation archived status has been updated.', status: 200})
  @ApiResponse({description: 'Instance not found', status: 404})
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async arvhiveConversation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceArchiveOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
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
      res.status(errorMessageInternalServer(error).code).json(errorMessageInternalServer(error));
    }
  }

  @Post(':instanceId/availability')
  @ApiOperation({summary: "Set a user's availiability."})
  @ApiResponse({description: "The user's availability has been updated.", status: 200})
  @ApiResponse({description: 'Instance not found', status: 404})
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async setAvailability(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceAvailiabilityOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    try {
      const instanceName = await this.instanceService.setAvailability(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(errorMessageInternalServer(error).code).json(errorMessageInternalServer(error));
    }
  }

  @Post(':instanceId/clear')
  @ApiOperation({summary: 'Clear a conversation.'})
  @ApiResponse({description: 'The conversation has been cleared.', status: 200})
  @ApiResponse({description: 'Instance not found', status: 404})
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async clearConversation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceClearOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    try {
      const instanceName = await this.instanceService.clearConversation(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(errorMessageInternalServer(error).code).json(errorMessageInternalServer(error));
    }
  }

  @Get(':instanceId/clients')
  @ApiOperation({summary: 'Get all clients of an instance.'})
  @ApiResponse({description: 'The list of all clients.', status: 200})
  @ApiResponse({description: 'Instance not found', status: 404})
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getClients(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      res.status(errorMessage.code).json(errorMessage);
    }

    try {
      const clients = this.instanceService.getAllClients(instanceId);
      res.json(clients);
    } catch (error) {
      res.status(errorMessageInternalServer(error).code).json(errorMessageInternalServer(error));
    }
  }
}
