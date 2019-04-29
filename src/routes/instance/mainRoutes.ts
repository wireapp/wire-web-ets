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

import {ClientType} from '@wireapp/api-client/dist/commonjs/client/';
import {Joi, celebrate} from 'celebrate';
import * as express from 'express';
import {InstanceService} from '../../InstanceService';

export interface InstanceRequest {
  backend: string;
  deviceLabel?: string;
  deviceName: string;
  email: string;
  name?: string;
  password: string;
}

interface ReducedInstances {
  [id: string]: {
    backend: string;
    clientId: string;
    instanceId: string;
    name: string;
  };
}

export const mainRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.put(
    '/api/v1/instance/?',
    celebrate({
      body: {
        backend: Joi.string()
          .valid(['prod', 'production', 'staging'])
          .required(),
        deviceLabel: Joi.string()
          .allow('')
          .optional(),
        deviceName: Joi.string()
          .allow('')
          .optional(),
        email: Joi.string()
          .email()
          .required(),
        name: Joi.string()
          .allow('')
          .optional(),
        password: Joi.string().required(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {backend, deviceLabel, deviceName, email, name: instanceName, password}: InstanceRequest = req.body;

      const loginData = {
        clientType: ClientType.PERMANENT,
        email,
        password,
      };

      try {
        const instanceId = await instanceService.createInstance(
          backend,
          loginData,
          deviceName,
          deviceLabel,
          instanceName
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

  router.get('/api/v1/instance/:instanceId/?', (req, res) => {
    const {instanceId = ''}: {instanceId: string} = req.params;

    if (!instanceService.instanceExists(instanceId)) {
      return res.status(400).json({error: `Instance "${instanceId}" not found.`});
    }

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
  });

  router.delete('/api/v1/instance/:instanceId/?', async (req, res) => {
    const {instanceId = ''}: {instanceId: string} = req.params;

    if (!instanceService.instanceExists(instanceId)) {
      return res.status(400).json({error: `Instance "${instanceId}" not found.`});
    }

    try {
      await instanceService.deleteInstance(instanceId);
      return res.json({});
    } catch (error) {
      return res.status(500).json({error: error.message, stack: error.stack});
    }
  });

  router.get('/api/v1/instances/?', (req, res) => {
    const instances = instanceService.getInstances();

    if (!Object.keys(instances).length) {
      return res.json({});
    }

    const reducedInstances: ReducedInstances = {};

    for (const instanceId in instances) {
      const {backendType, client, name} = instances[instanceId];

      reducedInstances[instanceId] = {
        backend: backendType.name,
        clientId: client.context!.clientId!,
        instanceId,
        name,
      };
    }

    return res.json(reducedInstances);
  });

  router.delete(
    '/api/v1/clients/?',
    celebrate({
      body: {
        backend: Joi.string()
          .valid(['prod', 'production', 'staging'])
          .required(),
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string().required(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {backend, email, password}: InstanceRequest = req.body;

      try {
        await instanceService.removeAllClients(backend, email, password);
        return res.json({});
      } catch (error) {
        return res.status(500).json({error: error.message, stack: error.stack});
      }
    }
  );

  router.get('/api/v1/instance/:instanceId/clients/?', async (req: express.Request, res: express.Response) => {
    const {instanceId = ''}: {instanceId: string} = req.params;

    if (!instanceService.instanceExists(instanceId)) {
      return res.status(400).json({error: `Instance "${instanceId}" not found.`});
    }

    try {
      const clients = await instanceService.getAllClients(instanceId);
      return res.json(clients);
    } catch (error) {
      return res.status(500).json({error: error.message, stack: error.stack});
    }
  });

  return router;
};
