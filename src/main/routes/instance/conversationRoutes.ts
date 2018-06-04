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

import * as express from 'express';
import * as Joi from 'joi';

import InstanceService from '../../InstanceService';

export interface MessageRequest {
  conversationId: string;
  payload: string;
}

export interface MessageUpdateRequest {
  conversationId: string;
  firstMessageId: string;
  payload: string;
}

const conversationRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.post('/api/v1/instance/:instanceId/sendText', async (req: express.Request, res: express.Response) => {
    const {instanceId = ''}: {instanceId: string} = req.params;
    const {conversationId, payload}: MessageRequest = req.body;

    const joiSchema = {
      conversationId: Joi.string()
        .uuid()
        .required(),
      payload: Joi.string().required(),
    };
    const {error: joiError} = Joi.validate(req.body, joiSchema);
    if (joiError) {
      return res.status(422).json({error: `Validation error: ${joiError.message}}`});
    }

    if (!instanceService.instanceExists(instanceId)) {
      return res.status(400).json({error: `Instance "${instanceId}" not found.`});
    }

    try {
      const messageId = await instanceService.sendText(instanceId, conversationId, payload);
      const instanceName = instanceService.getInstance(instanceId).name;
      return res.json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      return res.status(500).json({error: error.message, stack: error.stack});
    }
  });

  router.post('/api/v1/instance/:instanceId/sendPing', async (req: express.Request, res: express.Response) => {
    const {instanceId = ''}: {instanceId: string} = req.params;
    const {conversationId}: MessageRequest = req.body;

    const joiSchema = {
      conversationId: Joi.string()
        .uuid()
        .required(),
    };
    const {error: joiError} = Joi.validate(req.body, joiSchema);
    if (joiError) {
      return res.status(422).json({error: `Validation error: ${joiError.message}}`});
    }

    if (!instanceService.instanceExists(instanceId)) {
      return res.status(400).json({error: `Instance "${instanceId}" not found.`});
    }

    try {
      const messageId = await instanceService.sendPing(instanceId, conversationId);
      const instanceName = instanceService.getInstance(instanceId).name;
      return res.json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      return res.status(500).json({error: error.message, stack: error.stack});
    }
  });

  router.post('/api/v1/instance/:instanceId/updateText', async (req: express.Request, res: express.Response) => {
    const {instanceId = ''}: {instanceId: string} = req.params;
    const {conversationId, firstMessageId, payload}: MessageUpdateRequest = req.body;

    const joiSchema = {
      conversationId: Joi.string()
        .uuid()
        .required(),
      firstMessageId: Joi.string()
        .uuid()
        .required(),
      payload: Joi.string().required(),
    };
    const {error: joiError} = Joi.validate(req.body, joiSchema);
    if (joiError) {
      return res.status(422).json({error: `Validation error: ${joiError.message}}`});
    }

    if (!instanceService.instanceExists(instanceId)) {
      return res.status(400).json({error: `Instance "${instanceId}" not found.`});
    }

    try {
      const messageId = await instanceService.updateText(instanceId, conversationId, firstMessageId, payload);
      const instanceName = instanceService.getInstance(instanceId).name;
      return res.json({
        instanceId,
        messageId,
        name: instanceName,
      });
    } catch (error) {
      return res.status(500).json({error: error.message, stack: error.stack});
    }
  });

  return router;
};

export default conversationRoutes;
