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
import {check, validationResult} from 'express-validator/check';

import InstanceService from '../../InstanceService';

export interface MessageRequest {
  conversationId: string;
  payload: string;
}

export interface MessageUpdateRequest {
  conversationId: string;
  messageId: string;
  payload: string;
}

const conversationRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.post(
    '/api/v1/instance/:id/sendText',
    [check('conversationId').isUUID(), check('payload').isString()],
    async (req: express.Request, res: express.Response) => {
      const {id: instanceId = ''}: {id: string} = req.params;
      const {conversationId, payload}: MessageRequest = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()});
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
    }
  );

  router.post(
    '/api/v1/instance/:id/sendPing',
    [check('conversationId').isUUID()],
    async (req: express.Request, res: express.Response) => {
      const {id: instanceId = ''}: {id: string} = req.params;
      const {conversationId}: MessageRequest = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()});
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
    }
  );

  router.post(
    '/api/v1/instance/:id/updateText',
    [check('conversationId').isUUID(), check('messageId').isUUID(), check('payload').isString()],
    async (req: express.Request, res: express.Response) => {
      const {id: instanceId = ''}: {id: string} = req.params;
      const {conversationId, messageId, payload}: MessageUpdateRequest = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()});
      }

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const newMessageId = await instanceService.updateText(instanceId, conversationId, messageId, payload);
        const instanceName = instanceService.getInstance(instanceId).name;
        return res.json({
          instanceId,
          messageId: newMessageId,
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
