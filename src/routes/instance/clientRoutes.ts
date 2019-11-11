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
import * as HTTP_STATUS_CODE from 'http-status-codes';

import {ErrorMessage, ServerErrorMessage} from '../../config';
import {InstanceService} from '../../InstanceService';

export const clientRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.get('/api/v1/instance/:instanceId/fingerprint/?', async (req: express.Request, res: express.Response) => {
    const {instanceId = ''} = req.params;

    if (!instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      return res.status(errorMessage.code).json(errorMessage);
    }

    try {
      const fingerprint = instanceService.getFingerprint(instanceId);
      return res.json({
        fingerprint,
        instanceId,
      });
    } catch (error) {
      const errorMessage: ServerErrorMessage = {
        code: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        error: error.message,
        stack: error.stack,
      };
      return res.status(errorMessage.code).json(errorMessage);
    }
  });

  return router;
};
