import {Body, Controller, Delete, Get, Param, Post, Put, Res} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Validator} from 'class-validator';
import {Response} from 'express';
import * as HTTP_STATUS_CODE from 'http-status-codes';
import {ErrorMessage, ServerErrorMessage} from '../config';
import {InstanceConversationOptions} from './InstanceConversationOptions';
import {InstanceCreationOptions} from './InstanceCreationOptions';
import {InstanceService} from './InstanceService';
import {InstanceArchiveOptions} from './InstanceArchiveOptions';
import {status500description, status422description, status404instance} from '../utils';
import {InstanceAvailabilityOptions} from './InstanceAvailabilityOptions';
import {InstanceDeleteOptions} from './InstanceDeleteOptions';
import {InstanceMuteOptions} from './InstanceMuteOptions';
import {InstanceDeliveryOptions} from './InstanceDeliveryOptions';
import {InstanceImageOptions} from './InstanceImageOptions';
import {ImageContent, LocationContent} from '@wireapp/core/dist/conversation/content';
import {InstanceLocationOptions} from './InstanceLocationOptions';
import {InstancePingOptions} from './InstancePingOptions';
import {InstanceButtonOptions} from './InstanceButtonOptions';
import {InstanceReactionOptions} from './InstanceReactionOptions';
import {InstanceTypingOptions} from './InstanceTypingOptions';

const isUUID = (text: string) => new Validator().isUUID(text, '4');
const errorMessageInstanceUUID: ErrorMessage = {
  code: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  error: `Instance ID must me a UUID.`,
};

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
  @ApiResponse({description: 'The instance has successfully created.', status: 200})
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
  @ApiResponse({description: 'The instance has successfully deleted.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async deleteInstance(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The instance has successfully deleted.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getInstance(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The conversation archived status has been updated.', status: 200})
  @ApiResponse(status404instance)
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
  @ApiResponse({description: "The user's availability has been updated.", status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async setAvailability(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceAvailabilityOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The conversation has been cleared.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async clearConversation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceConversationOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The list of all clients.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getClients(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The message was deleted locally.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async deleteMessage(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeleteOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The message was deleted for everyone.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async deleteEverywhere(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeleteOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The fingerprint of the client.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getFingerprint(@Param('instanceId') instanceId: string, @Res() res: Response): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'All messages.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async getMessages(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceConversationOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The conversation muted status has been updated.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async muteConversation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceMuteOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The delivery confirmation has been sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendConfirmationDelivered(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeliveryOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The read confirmation has been sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendConfirmationRead(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeliveryOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The delivery confirmation for an ephemeral message has been sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendEphemeralConfirmationDelivered(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeliveryOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'The read confirmation for an ephemeral message has been sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendEphemeralConfirmationRead(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceDeliveryOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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

  @Post(':instanceId/sendImage')
  @ApiOperation({summary: 'Send an image to a conversation.'})
  @ApiResponse({description: 'Image sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendImage(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceImageOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
      res.status(errorMessageInstanceUUID.code).json(errorMessageInstanceUUID);
    }

    if (!this.instanceService.instanceExists(instanceId)) {
      res.status(createInstanceNotFoundError(instanceId).code).json(createInstanceNotFoundError(instanceId));
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
  @ApiResponse({description: 'Location sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendLocation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceLocationOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'Ping sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendPing(
    @Param('instanceId') instanceId: string,
    @Body() body: InstancePingOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'Button action sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendButtonAction(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceButtonOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'Confirmation sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendButtonActionConfirmation(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceButtonOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
  @ApiResponse({description: 'Reaction sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendReaction(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceReactionOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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

  @Post(':instanceId/sendSessionReset')
  @ApiOperation({summary: 'Clear a conversation.'})
  @ApiResponse({description: 'The conversation has been cleared.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendSessionReset(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceConversationOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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

  @Post(':instanceId/sendTyping')
  @ApiOperation({summary: 'Send a typing indicator to a conversation.'})
  @ApiResponse({description: 'Typing indicator has been sent.', status: 200})
  @ApiResponse(status404instance)
  @ApiResponse(status422description)
  @ApiResponse(status500description)
  async sendTyping(
    @Param('instanceId') instanceId: string,
    @Body() body: InstanceTypingOptions,
    @Res() res: Response,
  ): Promise<void> {
    if (!isUUID(instanceId)) {
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
}
