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
import * as logdown from 'logdown';
import {ServerConfig} from '../config';
import {calcPm2Uptime, getPm2Instance} from '../utils';

const router = express.Router();
const {version: nodeVersion} = process;

const logger = logdown('@wireapp/wire-web-ets/routes/error/errorRoutes', {
  logger: console,
  markdown: false,
});

interface InstanceData {
  uptime?: string;
}

const mainRoute = (config: ServerConfig) =>
  router.get(['/', '/api/v1/?'], async (req, res) => {
    const instanceData: InstanceData = {};
    try {
      const instance = await getPm2Instance();
      if (instance && instance.pm2_env && instance.pm2_env.pm_uptime) {
        instanceData.uptime = calcPm2Uptime(instance.pm2_env.pm_uptime);
      }
    } catch (error) {
      logger.error(error.stack);
    }
    const infoData = {
      code: 200,
      instance: {...instanceData},
      message: `E2E Test Service v${config.VERSION} ready (Node.js ${nodeVersion})`,
    };
    res.json(infoData);
  });

export default mainRoute;
