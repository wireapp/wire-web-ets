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

import {
  FileContent,
  FileMetaDataContent,
  ImageContent,
  LinkPreviewContent,
  MentionContent,
} from '@wireapp/core/dist/conversation/content/';
import * as express from 'express';
import * as Joi from 'joi';
import InstanceService from '../../InstanceService';
import joiValidate from '../../middlewares/joiValidate';
import {validateMention} from './conversationRoutes';

interface AssetMessageRequest {
  conversationId: string;
  data: string;
  messageTimer?: number;
  type: string;
}

export interface FileMessageRequest extends AssetMessageRequest {
  fileName: string;
}

export interface ImageMessageRequest extends AssetMessageRequest {
  height: number;
  width: number;
}

export interface LinkPreviewRequest {
  image?: {
    data: string;
    height: number;
    type: string;
    width: number;
  };
  permanentUrl: string;
  summary?: string;
  title?: string;
  tweet?: {
    author?: string;
    username?: string;
  };
  url: string;
  urlOffset: number;
}

export const validateLinkPreview = {
  image: Joi.object({
    data: Joi.string().required(),
    height: Joi.number().required(),
    type: Joi.string().required(),
    width: Joi.number().required(),
  }).optional(),
  permanentUrl: Joi.string().required(),
  summary: Joi.string().optional(),
  title: Joi.string().optional(),
  tweet: Joi.object({
    author: Joi.string().optional(),
    username: Joi.string().optional(),
  }).optional(),
  url: Joi.string().required(),
  urlOffset: Joi.number().required(),
};

const assetRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.post(
    '/api/v1/instance/:instanceId/sendFile/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      data: Joi.string().required(),
      fileName: Joi.string().required(),
      messageTimer: Joi.number()
        .optional()
        .default(0),
      type: Joi.string().required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, data: base64Data, fileName, messageTimer, type}: FileMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const data = Buffer.from(base64Data, 'base64');
        const file: FileContent = {data};
        const metadata: FileMetaDataContent = {length: data.length, name: fileName, type};
        const messageId = await instanceService.sendFile(instanceId, conversationId, file, metadata, messageTimer);
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
    '/api/v1/instance/:instanceId/sendImage/?',
    joiValidate({
      conversationId: Joi.string()
        .uuid()
        .required(),
      data: Joi.string()
        .base64()
        .required(),
      height: Joi.number()
        .min(1)
        .required(),
      messageTimer: Joi.number()
        .optional()
        .default(0),
      type: Joi.string().required(),
      width: Joi.number()
        .min(1)
        .required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {conversationId, data: base64Data, height, messageTimer, type, width}: ImageMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const data = Buffer.from(base64Data, 'base64');
        const image: ImageContent = {data, height, type, width};
        const messageId = await instanceService.sendImage(instanceId, conversationId, image, messageTimer);
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
    '/api/v1/instance/:instanceId/sendLinkPreview/?',
    joiValidate({
      ...validateLinkPreview,
      conversationId: Joi.string().required(),
      mentions: Joi.array()
        .items(validateMention)
        .optional(),
      text: Joi.string().required(),
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {
        conversationId,
        image,
        mentions,
        permanentUrl,
        summary,
        text,
        title,
        tweet,
        url,
        urlOffset,
      }: LinkPreviewRequest & {conversationId: string; mentions?: MentionContent[]; text: string} = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      const linkPreview: LinkPreviewContent = {
        permanentUrl,
        summary,
        title,
        tweet,
        url,
        urlOffset,
      };

      try {
        let imageContent: ImageContent | undefined;

        if (image) {
          const data = Buffer.from(image.data, 'base64');
          imageContent = {data, height: image.height, type: image.type, width: image.width};

          linkPreview.image = imageContent;
        }

        const messageId = await instanceService.sendLinkPreview(
          instanceId,
          conversationId,
          text,
          linkPreview,
          mentions
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

  return router;
};

export default assetRoutes;
