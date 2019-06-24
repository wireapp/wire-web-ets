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

import {AvailabilityType} from '@wireapp/core/dist/broadcast/';
import {Joi, celebrate} from 'celebrate';
import * as express from 'express';
import {InstanceService} from '../../InstanceService';

export interface AvailabilityRequest {
  teamId: string;
  type: AvailabilityType;
}

export const userRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.post(
    '/api/v1/instance/:instanceId/availability/?',
    celebrate({
      body: {
        teamId: Joi.string()
          .uuid()
          .required(),
        type: Joi.number()
          .valid([0, 1, 2, 3])
          .required(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {instanceId = ''}: {instanceId: string} = req.params;
      const {teamId, type}: AvailabilityRequest = req.body;

      if (!instanceService.instanceExists(instanceId)) {
        return res.status(400).json({error: `Instance "${instanceId}" not found.`});
      }

      try {
        const instanceName = await instanceService.setAvailability(instanceId, teamId, type);
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
