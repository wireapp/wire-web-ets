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

import {Joi, celebrate} from 'celebrate';
import * as express from 'express';

import {InstanceService} from '../../InstanceService';
import {MessageRequest} from './conversationRoutes';

export interface ConfirmationMessageRequest extends MessageRequest {
  firstMessageId: string;
  moreMessageIds?: string[];
}

export const confirmationRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.post(
    '/api/v1/instance/:instanceId/sendConfirmationDelivered',
    celebrate({
      body: {
        conversationId: Joi.string()
          .uuid()
          .required(),
        firstMessageId: Joi.string()
          .uuid()
          .required(),
        moreMessageIds: Joi.array()
          .items(Joi.string().uuid())
          .optional(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''} = req.params;
      const {conversationId, firstMessageId, moreMessageIds}: ConfirmationMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.sendConfirmationDelivered(
          instanceId,
          conversationId,
          firstMessageId,
          moreMessageIds,
        );
        return res.json({
          instanceId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    },
  );

  router.post(
    '/api/v1/instance/:instanceId/sendConfirmationRead',
    celebrate({
      body: {
        conversationId: Joi.string()
          .uuid()
          .required(),
        firstMessageId: Joi.string()
          .uuid()
          .required(),
        moreMessageIds: Joi.array()
          .items(Joi.string().uuid())
          .optional(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''} = req.params;
      const {conversationId, firstMessageId, moreMessageIds}: ConfirmationMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.sendConfirmationRead(
          instanceId,
          conversationId,
          firstMessageId,
          moreMessageIds,
        );
        return res.json({
          instanceId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    },
  );

  router.post(
    '/api/v1/instance/:instanceId/sendEphemeralConfirmationDelivered',
    celebrate({
      body: {
        conversationId: Joi.string()
          .uuid()
          .required(),
        firstMessageId: Joi.string()
          .uuid()
          .required(),
        moreMessageIds: Joi.array()
          .items(Joi.string().uuid())
          .optional(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''} = req.params;
      const {conversationId, firstMessageId, moreMessageIds}: ConfirmationMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.sendEphemeralConfirmationDelivered(
          instanceId,
          conversationId,
          firstMessageId,
          moreMessageIds,
        );
        return res.json({
          instanceId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    },
  );

  router.post(
    '/api/v1/instance/:instanceId/sendEphemeralConfirmationRead',
    celebrate({
      body: {
        conversationId: Joi.string()
          .uuid()
          .required(),
        firstMessageId: Joi.string()
          .uuid()
          .required(),
        moreMessageIds: Joi.array()
          .items(Joi.string().uuid())
          .optional(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''} = req.params;
      const {conversationId, firstMessageId, moreMessageIds}: ConfirmationMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.sendEphemeralConfirmationRead(
          instanceId,
          conversationId,
          firstMessageId,
          moreMessageIds,
        );
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
