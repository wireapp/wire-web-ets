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

import {LoginData} from '@wireapp/api-client/dist/commonjs/auth/';
import * as express from 'express';
import {check, validationResult} from 'express-validator/check';
import InstanceService from '../../InstanceService';

export interface InstanceRequest {
  backend: string;
  deviceName: string;
  email: string;
  name?: string;
  password: string;
}

const mainRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.put(
    '/api/v1/instance/?',
    [
      check('backend')
        .matches(/^(prod(uction)?|staging)$/)
        .withMessage('Should be "prod", "production" or "staging".'),
      check('email').isAscii(),
      check('password').exists(),
    ],
    async (req: express.Request, res: express.Response) => {
      const {backend, deviceName, email, name: instanceName, password}: InstanceRequest = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped()});
      }

      const LoginData: LoginData = {
        email,
        password,
        persist: true,
      };

      try {
        const instanceId = await instanceService.createInstance(backend, LoginData, deviceName, instanceName);
        return res.json({
          instanceId,
          name: instanceName,
        });
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.get('/api/v1/instance/:instanceId', (req, res) => {
    const {instanceId}: {instanceId: string} = req.params;

    if (instanceService.instanceExists(instanceId)) {
      let instance;

      try {
        instance = instanceService.getInstance(instanceId);
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }

      return res.json({
        backend: instance.backendType.name,
        clientId: instance.client.context!.clientId,
        instanceId,
        name: instance.name,
      });
    }

    return res.sendStatus(404);
  });

  router.get('/api/v1/instances', (req, res) => {
    const instances = instanceService.getInstances();

    if (instances.length) {
      return res.json({
        instances,
      });
    }

    return res.sendStatus(404);
  });

  return router;
};

export default mainRoutes;
