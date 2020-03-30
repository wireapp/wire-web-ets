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
  LegalHoldStatus,
} from '@wireapp/core/dist/conversation/content/';
import {Joi, celebrate} from 'celebrate';
import * as express from 'express';
import * as HTTP_STATUS_CODE from 'http-status-codes';

import {ErrorMessage, ServerErrorMessage} from '../../config';
import {InstanceService} from '../../InstanceService';
import {MessageRequest} from './conversationRoutes';

interface AssetMessageRequest extends MessageRequest {
  data: string;
  expectsReadConfirmation?: boolean;
  legalHoldStatus?: LegalHoldStatus;
  messageTimer?: number;
  type: string;
}

export interface FileMessageRequest extends AssetMessageRequest {
  audio?: {
    durationInMillis?: number;
    normalizedLoudness?: number[];
  };
  fileName: string;
  video?: {
    durationInMillis?: number;
    height?: number;
    width?: number;
  };
}

export interface ImageMessageRequest extends AssetMessageRequest {
  height: number;
  width: number;
}

export const validateAudioMetaData = Joi.object({
  durationInMillis: Joi.number().optional(),
  normalizedLoudness: Joi.array().items(Joi.number()).optional(),
});

export const validateVideoMetaData = Joi.object({
  durationInMillis: Joi.number().optional(),
  height: Joi.number().optional(),
  width: Joi.number().optional(),
});

export const assetRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.post(
    '/api/v1/instance/:instanceId/sendFile/?',
    celebrate({
      body: {
        audio: validateAudioMetaData.optional(),
        conversationId: Joi.string().uuid().required(),
        data: Joi.string().base64().required(),
        expectsReadConfirmation: Joi.boolean().default(false).optional(),
        fileName: Joi.string().required(),
        legalHoldStatus: Joi.number()
          .valid(LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED)
          .optional(),
        messageTimer: Joi.number().default(0).optional(),
        type: Joi.string().required(),
        video: validateVideoMetaData.optional(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''} = req.params;
      const {
        audio,
        conversationId,
        data: base64Data,
        expectsReadConfirmation,
        fileName,
        legalHoldStatus,
        messageTimer,
        type,
        video,
      }: FileMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        const errorMessage: ErrorMessage = {
          code: HTTP_STATUS_CODE.NOT_FOUND,
          error: `Instance "${instanceId}" not found.`,
        };
        return res.status(errorMessage.code).json(errorMessage);
      }

      try {
        const data = Buffer.from(base64Data, 'base64');
        const fileContent: FileContent = {data};
        const metadata: FileMetaDataContent = {length: data.length, name: fileName, type, video};

        if (audio) {
          metadata.audio = {
            durationInMillis: audio.durationInMillis,
          };

          if (audio.normalizedLoudness) {
            metadata.audio.normalizedLoudness = Buffer.from(audio.normalizedLoudness);
          }
        }

        const messageId = await instanceService.sendFile(
          instanceId,
          conversationId,
          fileContent,
          metadata,
          expectsReadConfirmation,
          legalHoldStatus,
          messageTimer,
        );
        const instanceName = instanceService.getInstance(instanceId).name;

        return res.json({
          instanceId,
          messageId,
          name: instanceName,
        });
      } catch (error) {
        const errorMessage: ServerErrorMessage = {
          code: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
          error: error.message,
          stack: error.stack,
        };
        return res.status(errorMessage.code).json(errorMessage);
      }
    },
  );

  router.post(
    '/api/v1/instance/:instanceId/sendImage/?',
    celebrate({
      body: {
        conversationId: Joi.string().uuid().required(),
        data: Joi.string().base64().required(),
        expectsReadConfirmation: Joi.boolean().default(false).optional(),
        height: Joi.number().min(1).required(),
        legalHoldStatus: Joi.number()
          .valid(LegalHoldStatus.UNKNOWN, LegalHoldStatus.DISABLED, LegalHoldStatus.ENABLED)
          .optional(),
        messageTimer: Joi.number().default(0).optional(),
        type: Joi.string().required(),
        width: Joi.number().min(1).required(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''} = req.params;
      const {
        conversationId,
        data: base64Data,
        expectsReadConfirmation,
        height,
        legalHoldStatus,
        messageTimer,
        type,
        width,
      }: ImageMessageRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        const errorMessage: ErrorMessage = {
          code: HTTP_STATUS_CODE.NOT_FOUND,
          error: `Instance "${instanceId}" not found.`,
        };
        return res.status(errorMessage.code).json(errorMessage);
      }

      try {
        const data = Buffer.from(base64Data, 'base64');
        const image: ImageContent = {data, height, type, width};
        const messageId = await instanceService.sendImage(
          instanceId,
          conversationId,
          image,
          expectsReadConfirmation,
          legalHoldStatus,
          messageTimer,
        );
        const instanceName = instanceService.getInstance(instanceId).name;

        return res.json({
          instanceId,
          messageId,
          name: instanceName,
        });
      } catch (error) {
        const errorMessage: ErrorMessage = {
          code: HTTP_STATUS_CODE.NOT_FOUND,
          error: `Instance "${instanceId}" not found.`,
        };
        return res.status(errorMessage.code).json(errorMessage);
      }
    },
  );

  return router;
};
