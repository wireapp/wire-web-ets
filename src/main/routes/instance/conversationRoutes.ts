/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import {ReactionType} from '@wireapp/core/dist/conversation/root';
import * as express from 'express';
import * as Joi from 'joi';
import InstanceService from '../../InstanceService';
import joiValidate from '../../middlewares/joiValidate';

export interface MessagesRequest {
  conversationId: string;
}

export interface DeletionRequest extends MessagesRequest {
  messageId: string;
}

export interface TextRequest extends MessagesRequest {
  messageTimer?: number;
  text: string;
}

export interface ReactionRequest extends MessagesRequest {
  originalMessageId: string;
  type: ReactionType;
}

export interface LocationRequest extends MessagesRequest {
  latitude: number;
  locationName?: string;
  longitude: number;
  messageTimer?: number;
  zoom?: number;
}

export interface MessageUpdateRequest extends MessagesRequest {
  firstMessageId: string;
  text: string;
}

const conversationRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.post(
    '/api/v1/instance/:instanceId/clear/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId}: MessagesRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.clearConversation(instanceId, conversationId);
        return res.json({
          instanceId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.post(
    '/api/v1/instance/:instanceId/delete/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      messageId: Joi.string()
        .uuid()
        .required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, messageId}: DeletionRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.deleteMessageLocal(instanceId, conversationId, messageId);
        return res.json({
          instanceId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.post(
    '/api/v1/instance/:instanceId/deleteEverywhere/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      messageId: Joi.string()
        .uuid()
        .required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, messageId}: DeletionRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.deleteMessageEveryone(instanceId, conversationId, messageId);
        return res.json({
          instanceId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.post(
    '/api/v1/instance/:instanceId/getMessages/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId}: MessagesRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const messages = instanceService.getMessages(instanceId, conversationId);
        return res.json(messages || {});
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.post(
    '/api/v1/instance/:instanceId/sendLocation/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      latitude: Joi.number().required(),
      locationName: Joi.string().optional(),
      longitude: Joi.number().required(),
      messageTimer: Joi.number()
        .optional()
        .default(0),
      zoom: Joi.number().optional(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, latitude, longitude, locationName, messageTimer, zoom}: LocationRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const messageId = await instanceService.sendLocation(
          instanceId,
          conversationId,
          {
            latitude,
            longitude,
            name: locationName,
            zoom,
          },
          messageTimer
        );
        const instanceName = instanceService.getInstance(instanceId).name;
        return res.json({
          instanceId,
          messageId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.post(
    '/api/v1/instance/:instanceId/sendText/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      messageTimer: Joi.number()
        .optional()
        .default(0),
      text: Joi.string().required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, messageTimer, text}: TextRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const messageId = await instanceService.sendText(instanceId, conversationId, text, messageTimer);
        const instanceName = instanceService.getInstance(instanceId).name;
        return res.json({
          instanceId,
          messageId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.post(
    '/api/v1/instance/:instanceId/sendPing/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      messageTimer: Joi.number()
        .optional()
        .default(0),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, messageTimer}: TextRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const messageId = await instanceService.sendPing(instanceId, conversationId, messageTimer);
        const instanceName = instanceService.getInstance(instanceId).name;
        return res.json({
          instanceId,
          messageId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.post(
    '/api/v1/instance/:instanceId/sendReaction/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      originalMessageId: Joi.string()
        .uuid()
        .required(),
      type: Joi.string()
        .valid(ReactionType.LIKE, ReactionType.NONE)
        .required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, originalMessageId, type}: ReactionRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const messageId = await instanceService.sendReaction(instanceId, conversationId, originalMessageId, type);
        const instanceName = instanceService.getInstance(instanceId).name;
        return res.json({
          instanceId,
          messageId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.post(
    '/api/v1/instance/:instanceId/updateText/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      firstMessageId: Joi.string()
        .uuid()
        .required(),
      text: Joi.string().required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, firstMessageId, text}: MessageUpdateRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const messageId = await instanceService.updateText(instanceId, conversationId, firstMessageId, text);
        const instanceName = instanceService.getInstance(instanceId).name;
        return res.json({
          instanceId,
          messageId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  return router;
};

export default conversationRoutes;
