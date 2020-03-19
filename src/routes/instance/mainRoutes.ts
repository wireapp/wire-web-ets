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

import {ClientClassification, ClientType} from '@wireapp/api-client/dist/client/';
import {BackendData} from '@wireapp/api-client/dist/env';
import {Joi, celebrate} from 'celebrate';
import * as express from 'express';
import * as HTTP_STATUS_CODE from 'http-status-codes';

import {ErrorMessage, ServerErrorMessage} from '../../config';
import {InstanceService} from '../../InstanceService';

export interface InstanceRequest {
  backend?: string;
  customBackend?: BackendData;
  deviceClass?: ClientClassification.DESKTOP | ClientClassification.PHONE | ClientClassification.TABLET;
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

const validateCustomBackend = Joi.object({
  name: Joi.string().required(),
  rest: Joi.string().required(),
  ws: Joi.string().required(),
});

const validateBackend = Joi.string().valid('prod', 'production', 'staging');

export const mainRoutes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

    router.put(
    '/api/v1/instance/?',
    celebrate({
      body: {
        backend: validateBackend.allow('').optional(),
        customBackend: validateCustomBackend.optional(),
        deviceClass: Joi.string()
          .valid(ClientClassification.DESKTOP, ClientClassification.PHONE, ClientClassification.TABLET)
          .optional(),
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
      const {
        backend,
        customBackend,
        deviceClass,
        deviceLabel,
        deviceName,
        email,
        name: instanceName,
        password,
      }: InstanceRequest = req.body;

      const loginData = {
        clientType: ClientType.PERMANENT,
        email,
        password,
      };

      try {
        const instanceId = await instanceService.createInstance({
          backend,
          customBackend,
          deviceClass,
          deviceLabel,
          deviceName,
          instanceName,
          loginData,
        });
        return res.json({
          instanceId,
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

  router.get('/api/v1/instance/:instanceId/?', (req, res) => {
    const {instanceId = ''} = req.params;

    if (!instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      return res.status(errorMessage.code).json(errorMessage);
    }

    let instance;

    try {
      instance = instanceService.getInstance(instanceId);
    } catch (error) {
      const errorMessage: ServerErrorMessage = {
        code: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        error: error.message,
        stack: error.stack,
      };
      return res.status(errorMessage.code).json(errorMessage);
    }

    return res.json({
      backend: instance.backendType.name,
      clientId: instance.client.context!.clientId,
      instanceId,
      name: instance.name,
    });
  });

  router.delete('/api/v1/instance/:instanceId/?', async (req, res) => {
    const {instanceId = ''} = req.params;

    if (!instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      return res.status(errorMessage.code).json(errorMessage);
    }

    try {
      await instanceService.deleteInstance(instanceId);
      return res.json({});
    } catch (error) {
      const errorMessage: ServerErrorMessage = {
        code: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        error: error.message,
        stack: error.stack,
      };
      return res.status(errorMessage.code).json(errorMessage);
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
          .valid('prod', 'production', 'staging', '')
          .optional(),
        customBackend: validateCustomBackend,
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string().required(),
      },
    }),
    async (req: express.Request, res: express.Response) => {
      const {backend, customBackend, email, password}: InstanceRequest = req.body;

      try {
        await instanceService.removeAllClients(email, password, backend || customBackend);
        return res.json({});
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

  router.get('/api/v1/instance/:instanceId/clients/?', async (req: express.Request, res: express.Response) => {
    const {instanceId = ''} = req.params;

    if (!instanceService.instanceExists(instanceId)) {
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.NOT_FOUND,
        error: `Instance "${instanceId}" not found.`,
      };
      return res.status(errorMessage.code).json(errorMessage);
    }

    try {
      const clients = await instanceService.getAllClients(instanceId);
      return res.json(clients);
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
