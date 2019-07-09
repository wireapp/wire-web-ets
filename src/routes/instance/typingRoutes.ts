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

import {CONVERSATION_TYPING} from '@wireapp/api-client/dist/commonjs/event/';
import {Joi, celebrate} from 'celebrate';
import * as express from 'express';

import {InstanceService} from '../../InstanceService';
import {MessageRequest} from './conversationRoutes';

export interface TypingMessageRequest extends MessageRequest {
  status: CONVERSATION_TYPING;
}

export const typingRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.post(
    '/api/v1/instance/:instanceId/sendTyping/?',
    celebrate({
      body: {
        conversationId: Joi.string()
          .uuid()
          .required(),
        status: Joi.string()
          .valid([CONVERSATION_TYPING.STARTED, CONVERSATION_TYPING.STOPPED])
          .required(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, status}: TypingMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.sendTyping(instanceId, conversationId, status);
        return res.json({
          instanceId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    },
  );

  return router;
};
