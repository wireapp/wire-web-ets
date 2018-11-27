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
import joiValidate from '../../middlewares/joiValidate';

export interface ConfirmationMessageRequest {
  conversationId: string;
  firstMessageId: string;
  moreMessageIds?: string[];
}

const confirmationRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.post(
    '/api/v1/instance/:instanceId/sendConfirmationDelivered',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      firstMessageId: Joi.string()
        .uuid()
        .required(),
      moreMessageIds: Joi.array()
        .items(Joi.string().uuid())
        .optional(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, firstMessageId, moreMessageIds}: ConfirmationMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.sendConfirmationDelivered(
          instanceId,
          conversationId,
          firstMessageId,
          moreMessageIds
        );
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
    '/api/v1/instance/:instanceId/sendConfirmationRead',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      messageId: Joi.string()
        .uuid()
        .required(),
      moreMessageIds: Joi.array()
        .items(Joi.string().uuid())
        .optional(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, firstMessageId, moreMessageIds}: ConfirmationMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.sendConfirmationRead(
          instanceId,
          conversationId,
          firstMessageId,
          moreMessageIds
        );
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
    '/api/v1/instance/:instanceId/markEphemeralDelivered',
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
      const {conversationId, firstMessageId, moreMessageIds}: ConfirmationMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.sendEphemeralConfirmationDelivered(
          instanceId,
          conversationId,
          firstMessageId,
          moreMessageIds
        );
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
    '/api/v1/instance/:instanceId/markEphemeralRead',
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
      const {conversationId, firstMessageId, moreMessageIds}: ConfirmationMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.sendEphemeralConfirmationRead(
          instanceId,
          conversationId,
          firstMessageId,
          moreMessageIds
        );
        return res.json({
          instanceId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  return router;
};

export default confirmationRoutes;
