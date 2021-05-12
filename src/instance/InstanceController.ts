import {Body, Controller, Delete, Get, Param, Post, Put, Res} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {
  FileContent,
  FileMetaDataContent,
  ImageContent,
  LinkPreviewContent,
  LocationContent,
  QuoteContent,
} from '@wireapp/core/src/main/conversation/content';
import * as crypto from 'crypto';
import {isUUID} from 'class-validator';
import {Response} from 'express';
import * as fs from 'fs-extra';
import {StatusCodes as HTTP_STATUS_CODE} from 'http-status-codes';
import logdown from 'logdown';
import UUID from 'uuidjs';
import * as path from 'path';
import {config} from '../config';
import {
  formatDate,
  formatUptime,
  hexToUint8Array,
  status404instance,
  status422description,
  status500description,
} from '../utils';
import {ClientsOptions} from './ClientsOptions';
import {InstanceArchiveOptions} from './InstanceArchiveOptions';
import {InstanceAvailabilityOptions} from './InstanceAvailabilityOptions';
import {InstanceBreakSessionOptions} from './InstanceBreakSessionOptions';
import {InstanceButtonOptions} from './InstanceButtonOptions';
import {InstanceConversationOptions} from './InstanceConversationOptions';
import {InstanceCreationOptions} from './InstanceCreationOptions';
import {InstanceDeleteOptions} from './InstanceDeleteOptions';
import {InstanceDeliveryOptions} from './InstanceDeliveryOptions';
import {InstanceFileOptions} from './InstanceFileOptions';
import {InstanceImageOptions} from './InstanceImageOptions';
import {InstanceLocationOptions} from './InstanceLocationOptions';
import {InstanceMuteOptions} from './InstanceMuteOptions';
import {InstancePingOptions} from './InstancePingOptions';
import {InstanceReactionOptions} from './InstanceReactionOptions';
import {InstanceService} from './InstanceService';
import {InstanceTextOptions} from './InstanceTextOptions';
import {InstanceTextUpdateOptions} from './InstanceTextUpdateOptions';
import {InstanceTypingOptions} from './InstanceTypingOptions';

const {uptime: nodeUptime, version: nodeVersion} = process;
const {LOG_ERROR, LOG_OUTPUT, NODE_DEBUG} = process.env;
const outLogFile = process.env.LOG_OUTPUT;
const errorLogFile = process.env.LOG_ERROR;

const logger = logdown('@wireapp/wire-web-ets/InstanceController', {
  logger: console,
  markdown: false,
});

interface ErrorMessage {
  code: number;
  error: string;
}

interface ServerErrorMessage extends ErrorMessage {
  stack?: string;
}

const errorMessageInstanceUUID: ErrorMessage = {
  code: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  error: `Instance ID must me a UUID.`,
};

interface ReducedInstances {
  [id: string]: {
    backend: string;
    clientId: string;
    instanceId: string;
    name: string;
  };
}

interface InfoData {
  code: number;
  commit?: string;
  instance: {
    env: {
      LOG_ERROR?: string;
      LOG_OUTPUT?: string;
      NODE_DEBUG?: string;
    };
    uptime: string;
  };
  message: string;
}

const createInternalServerError = (error: Error): ServerErrorMessage => {
  return {
    code: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    error: error.message,
    stack: error.stack,
  };
};

const createInstanceNotFoundError = (instanceId: string): ErrorMessage => {
  return {
    code: HTTP_STATUS_CODE.NOT_FOUND,
    error: `Instance "${instanceId}" not found.`,
  };
};

@ApiTags('Instance')
@Controller('instance')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {}

  @Put()
  @ApiOperation({summary: 'Create a new instance.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse({description: 'Bad request', status: 400})
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async putInstance(@Body() body: InstanceCreationOptions, @Res() res: Response): Promise<void> {
    try {
      const instanceId = await this.instanceService.createInstance(body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: body.name || '',
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Delete(':instanceId')
  @ApiOperation({summary: 'Delete an instance.'})
  @ApiResponse({
    schema: {
      example: {},
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async deleteInstance(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      await this.instanceService.deleteInstance(instanceId);
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Get(':instanceId')
  @ApiOperation({summary: 'Get information about an instance.'})
  @ApiResponse({
    schema: {
      example: {
        backend: 'string',
        clientId: 'string',
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getInstance(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
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
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/archive')
  @ApiOperation({summary: 'Archive a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async arvhiveConversation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceArchiveOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.toggleArchiveConversation(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/availability')
  @ApiOperation({summary: "Set a user's availability."})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  @ApiBody({
    description: 'Type can be `0` (none), `1` (available), `2` (away), `3` (busy).',
    type: InstanceAvailabilityOptions,
  })
  async setAvailability(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceAvailabilityOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.setAvailability(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/clear')
  @ApiOperation({summary: 'Clear a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async clearConversation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceConversationOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.clearConversation(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Get(':instanceId/clients')
  @ApiOperation({summary: 'Get all clients of an instance.'})
  @ApiResponse({
    schema: {
      example: [
        {
          class: 'string',
          cookie: 'string',
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          location: {
            lat: 0,
            lon: 0,
          },
          model: 'string',
          time: '2020-04-29T11:29:02.445Z',
          type: 'string',
        },
      ],
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getClients(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const clients = this.instanceService.getAllClients(instanceId);
      res.json(clients);
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/delete')
  @ApiOperation({summary: 'Delete a message locally.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async deleteMessage(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeleteOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.deleteMessageLocal(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/deleteEverywhere')
  @ApiOperation({summary: 'Delete a message for everyone.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async deleteEverywhere(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeleteOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.deleteMessageEveryone(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Get(':instanceId/fingerprint')
  @ApiOperation({summary: "Get the fingerprint from the instance's client."})
  @ApiResponse({
    schema: {
      example: {
        fingerprint: 'string',
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getFingerprint(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const fingerprint = this.instanceService.getFingerprint(instanceId);
      res.json({
        fingerprint,
        instanceId,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/getMessages')
  @ApiOperation({summary: 'Get all messages.'})
  @ApiResponse({
    schema: {
      example: [
        {
          confirmations: [
            {
              firstMessageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              from: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              moreMessageIds: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
              type: 0,
            },
          ],
          content: {
            expectsReadConfirmation: true,
            legalHoldStatus: 0,
            text: 'string',
          },
          conversation: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          from: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          messageTimer: 0,
          reactions: [
            {
              from: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              legalHoldStatus: 0,
              originalMessageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              type: '❤️',
            },
          ],
          state: 'PayloadBundleState.INCOMING',
          timestamp: 'string',
          type: 'string',
        },
      ],
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getMessages(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceConversationOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const messages = this.instanceService.getMessages(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json(messages || []);
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/mute')
  @ApiOperation({summary: 'Mute a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async muteConversation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceMuteOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.toggleMuteConversation(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendConfirmationDelivered')
  @ApiOperation({summary: 'Send a delivery confirmation for a message.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendConfirmationDelivered(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeliveryOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.sendConfirmationDelivered(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendConfirmationRead')
  @ApiOperation({summary: 'Send a read confirmation for a message.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendConfirmationRead(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeliveryOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.sendConfirmationRead(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendEphemeralConfirmationDelivered')
  @ApiOperation({summary: 'Send a delivery confirmation for an ephemeral message.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendEphemeralConfirmationDelivered(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeliveryOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.sendEphemeralConfirmationDelivered(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendEphemeralConfirmationRead')
  @ApiOperation({summary: 'Send a read confirmation for an ephemeral message.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendEphemeralConfirmationRead(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeliveryOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.sendEphemeralConfirmationRead(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendFile')
  @ApiOperation({summary: 'Send a file to a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        messageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendFile(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceFileOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const data = Buffer.from(body.data, 'base64');
      const fileContent: FileContent = {data};
      const metadata: FileMetaDataContent = {
        length: data.length,
        name: body.fileName,
        type: body.type,
        video: body.video,
      };

      if (body.audio) {
        metadata.audio = {
          durationInMillis: body.audio.durationInMillis,
        };

        if (body.audio.normalizedLoudness) {
          metadata.audio.normalizedLoudness = Buffer.from(body.audio.normalizedLoudness);
        }
      }

      const customCipher = body.otherCipher ? 'AES-128-CCM' : undefined;
      let customHash: Buffer | undefined;

      if (body.otherHash) {
        customHash = crypto.createHash('SHA256').update(Buffer.from(UUID.genV4().toString(), 'utf-8')).digest();
      }

      if (body.invalidHash) {
        customHash = Buffer.from(UUID.genV4().toString(), 'utf-8');
      }

      const messageId = await this.instanceService.sendFile(
        instanceId,
        body.conversationId,
        fileContent,
        metadata,
        body.expectsReadConfirmation,
        body.legalHoldStatus,
        body.messageTimer,
        customHash,
        customCipher,
      );
      const instanceName = this.instanceService.getInstance(instanceId).name;
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendImage')
  @ApiOperation({summary: 'Send an image to a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        messageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendImage(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceImageOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    const customCipher = body.otherCipher ? 'AES-128-CCM' : undefined;
    let customHash: Buffer | undefined;

    if (body.otherHash) {
      customHash = crypto.createHash('SHA256').update(Buffer.from(UUID.genV4().toString(), 'utf-8')).digest();
    }

    if (body.invalidHash) {
      customHash = Buffer.from(UUID.genV4().toString(), 'utf-8');
    }

    try {
      const data = Buffer.from(body.data, 'base64');
      const image: ImageContent = {data, height: body.height, type: body.type, width: body.width};
      const messageId = await this.instanceService.sendImage(
        instanceId,
        body.conversationId,
        image,
        body.expectsReadConfirmation,
        body.legalHoldStatus,
        body.messageTimer,
        customHash,
        customCipher,
      );
      const instanceName = this.instanceService.getInstance(instanceId).name;
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendLocation')
  @ApiOperation({summary: 'Send an location to a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        messageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendLocation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceLocationOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const location: LocationContent = {
        expectsReadConfirmation: body.expectsReadConfirmation,
        latitude: body.latitude,
        legalHoldStatus: body.legalHoldStatus,
        longitude: body.longitude,
        name: body.locationName,
        zoom: body.zoom,
      };

      const messageId = await this.instanceService.sendLocation(
        instanceId,
        body.conversationId,
        location,
        body.messageTimer,
      );
      const instanceName = this.instanceService.getInstance(instanceId).name;
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendPing')
  @ApiOperation({summary: 'Send an ping to a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        messageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendPing(
    @Param('instanceId') instanceId: string,
    @Body() body: InstancePingOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const messageId = await this.instanceService.sendPing(
        instanceId,
        body.conversationId,
        body.expectsReadConfirmation,
        body.legalHoldStatus,
        body.messageTimer,
      );

      const instanceName = this.instanceService.getInstance(instanceId).name;
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendButtonAction')
  @ApiOperation({summary: 'Send a button action to a poll.'})
  @ApiResponse({
    schema: {
      example: {},
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendButtonAction(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceButtonOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      await this.instanceService.sendButtonAction(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({});
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendButtonActionConfirmation')
  @ApiOperation({summary: 'Send a confirmation to a button action.'})
  @ApiResponse({
    schema: {
      example: {},
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendButtonActionConfirmation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceButtonOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      await this.instanceService.sendButtonActionConfirmation(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({});
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendReaction')
  @ApiOperation({summary: 'Send a reaction to a message.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        messageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendReaction(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceReactionOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const messageId = await this.instanceService.sendReaction(instanceId, body);
      const instanceName = this.instanceService.getInstance(instanceId).name;
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/breakSession')
  @ApiOperation({summary: 'Break a session to a specific device of a remote user (on purpose).'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async breakSession(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceBreakSessionOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.breakSession(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendSessionReset')
  @ApiOperation({summary: 'Clear a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        messageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendSessionReset(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceConversationOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.sendSessionReset(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendText')
  @ApiOperation({summary: 'Send a text message to a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        messageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  @ApiBody({
    type: InstanceTextOptions,
  })
  async sendText(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceTextOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    let linkPreviewContent: LinkPreviewContent | undefined;
    let quoteContent: QuoteContent | undefined;

    if (body.linkPreview) {
      linkPreviewContent = {
        ...body.linkPreview,
        image: undefined,
      };

      if (body.linkPreview.image) {
        const data = Buffer.from(body.linkPreview.image.data, 'base64');
        const imageContent: ImageContent = {
          data,
          height: body.linkPreview.image.height,
          type: body.linkPreview.image.type,
          width: body.linkPreview.image.width,
        };

        linkPreviewContent.image = imageContent;
      }
    }

    if (body.quote) {
      quoteContent = {
        quotedMessageId: body.quote.quotedMessageId,
        quotedMessageSha256: hexToUint8Array(body.quote.quotedMessageSha256),
      };
    }

    try {
      const messageId = await this.instanceService.sendText(
        instanceId,
        body.conversationId,
        body.text,
        linkPreviewContent,
        body.mentions,
        quoteContent,
        body.expectsReadConfirmation,
        body.legalHoldStatus,
        body.messageTimer,
        body.buttons,
      );
      const instanceName = this.instanceService.getInstance(instanceId).name;
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/sendTyping')
  @ApiOperation({summary: 'Send a typing indicator to a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendTyping(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceTypingOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    try {
      const instanceName = await this.instanceService.sendTyping(instanceId, body);
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Post(':instanceId/updateText')
  @ApiOperation({summary: 'Update a text message in a conversation.'})
  @ApiResponse({
    schema: {
      example: {
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        messageId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async updateText(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceTextUpdateOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId, 4)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
    }

    let linkPreviewContent: LinkPreviewContent | undefined;
    let quoteContent: QuoteContent | undefined;

    if (body.linkPreview) {
      linkPreviewContent = {
        ...body.linkPreview,
        image: undefined,
      };

      if (body.linkPreview.image) {
        const data = Buffer.from(body.linkPreview.image.data, 'base64');
        const imageContent: ImageContent = {
          data,
          height: body.linkPreview.image.height,
          type: body.linkPreview.image.type,
          width: body.linkPreview.image.width,
        };

        linkPreviewContent.image = imageContent;
      }
    }

    if (body.quote) {
      quoteContent = {
        quotedMessageId: body.quote.quotedMessageId,
        quotedMessageSha256: hexToUint8Array(body.quote.quotedMessageSha256),
      };
    }

    try {
      const messageId = await this.instanceService.updateText(
        instanceId,
        body.conversationId,
        body.firstMessageId,
        body.text,
        linkPreviewContent,
        body.mentions,
        quoteContent,
        body.expectsReadConfirmation,
        body.legalHoldStatus,
      );
      const instanceName = this.instanceService.getInstance(instanceId).name;
      res.status(HTTP_STATUS_CODE.OK).json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }
}

@ApiTags('Instances')
@Controller('instances')
export class InstancesController {
  constructor(private readonly instanceService: InstanceService) {}

  @Get()
  @ApiOperation({summary: 'Get all instances.'})
  @ApiResponse({
    schema: {
      example: {
        backend: 'string',
        clientId: 'string',
        instanceId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status500description)
  async getInstances(@Res() res: Response): Promise<void> {
    const instances = this.instanceService.getInstances();

    if (!Object.keys(instances).length) {
      res.json({});
      return;
    }

    const reducedInstances: ReducedInstances = {};

    for (const instanceId in instances) {
      const {backendType, client, name} = instances[instanceId];

      reducedInstances[instanceId] = {
        backend: backendType.name,
        clientId: client.context!.clientId!,
        instanceId,
        name,
      };
    }

    try {
      res.json(reducedInstances);
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }
}

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly instanceService: InstanceService) {}

  @Delete()
  @ApiOperation({summary: 'Delete all clients.'})
  @ApiResponse({
    schema: {
      example: {},
    },
    status: 200,
  })
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getClients(@Body() body: ClientsOptions, @Res() res: Response): Promise<void> {
    try {
      await this.instanceService.removeAllClients(body);
      res.json({});
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }
}

@ApiTags('Server')
@Controller()
export class ServerController {
  @Get()
  @ApiOperation({summary: 'Get information about the server.'})
  @ApiResponse({
    schema: {
      example: {
        code: 0,
        commit: 'string',
        instance: {
          env: {
            LOG_ERROR: 'string',
            LOG_OUTPUT: 'string',
            NODE_DEBUG: 'string',
          },
          uptime: 'string',
        },
        message: 'string',
      },
    },
    status: 200,
  })
  @ApiResponse(status500description)
  async getServer(@Res() res: Response): Promise<void> {
    const commitHashFile = path.join(config.DIST_DIR, 'commit');
    const infoData: InfoData = {
      code: HTTP_STATUS_CODE.OK,
      instance: {
        env: {
          LOG_ERROR,
          LOG_OUTPUT,
          NODE_DEBUG,
        },
        uptime: formatUptime(nodeUptime()),
      },
      message: `E2E Test Service v${config.VERSION} ready (Node.js ${nodeVersion})`,
    };

    try {
      const commitHash = await fs.readFile(commitHashFile, {encoding: 'utf8'});
      infoData.commit = commitHash.trim();
    } catch (error) {
      logger.error(`[${formatDate()}]`, error);
    }

    res.json(infoData);
  }

  @Get('/commit')
  @ApiOperation({summary: 'Get the latest commit hash as plain text.'})
  @ApiResponse({
    schema: {
      example: 'string',
    },
    status: 200,
  })
  @ApiResponse(status500description)
  async getCommit(@Res() res: Response): Promise<void> {
    try {
      const commitHashFile = path.join(config.DIST_DIR, 'commit');
      const commitHash = await fs.readFile(commitHashFile, {encoding: 'utf8'});
      res.contentType('text/plain; charset=UTF-8').send(commitHash.trim());
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }

  @Get('/log')
  @ApiOperation({summary: 'Get the complete log as plain text.'})
  @ApiResponse({
    schema: {
      example: 'string',
    },
    status: 200,
  })
  @ApiResponse(status500description)
  async getLog(@Res() res: Response): Promise<void> {
    try {
      let logData: string[] = [];

      if (errorLogFile) {
        logData.push(`=== ${errorLogFile} ===`);
        try {
          const errorLogData = await fs.readFile(errorLogFile, {encoding: 'utf8'});
          logData = [errorLogData];
        } catch (error) {
          logger.error(error);
          logData.push(`Error: Could not find error log file "${errorLogFile}" or it is not readable.`);
        }
      } else {
        logData.push('Error: No error log file specified.');
      }

      if (outLogFile) {
        logData.push(`=== ${outLogFile} ===`);
        try {
          const outLogData = await fs.readFile(outLogFile, {encoding: 'utf8'});
          logData.push(outLogData);
        } catch (error) {
          logger.error(error);
          logData.push(`Error: Could not find output log file "${outLogFile}" or it is not readable.`);
        }
      } else {
        logData.push('Error: No output log file specified.');
      }

      res.contentType('text/plain; charset=UTF-8').send(logData.join('\n'));
    } catch (error) {
      res.status(createInternalServerError(error).code).json(createInternalServerError(error));
    }
  }
}
