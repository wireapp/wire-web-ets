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
import * as fs from 'fs-extra';
import * as HTTP_STATUS_CODE from 'http-status-codes';
import * as logdown from 'logdown';
import * as path from 'path';

import {ServerConfig} from '../config';
import {formatDate, formatUptime} from '../utils';

const logger = logdown('@wireapp/wire-web-ets/mainRoute', {
  logger: console,
  markdown: false,
});

const router = express.Router();
const {uptime: nodeUptime, version: nodeVersion} = process;
const {LOG_ERROR, LOG_OUTPUT, NODE_DEBUG} = process.env;

interface InfoData {
  code: number;
  commit?: string;
  instance: {
    env: {
      LOG_ERROR?: string;
      LOG_OUTPUT?: string;
      NODE_DEBUG?: string;
    };
    uptime: string;
  };
  message: string;
}

export const mainRoute = (config: ServerConfig) => {
  const commitHashFile = path.join(config.DIST_DIR, 'commit');

  return router.get(['/', '/api/v1/?'], async (req, res) => {
    const infoData: InfoData = {
      code: HTTP_STATUS_CODE.OK,
      instance: {
        env: {
          LOG_ERROR,
          LOG_OUTPUT,
          NODE_DEBUG,
        },
        uptime: formatUptime(nodeUptime()),
      },
      message: `E2E Test Service v${config.VERSION} ready (Node.js ${nodeVersion})`,
    };

    try {
      const commitHash = await fs.readFile(commitHashFile, {encoding: 'utf8'});
      infoData.commit = commitHash.trim();
    } catch (error) {
      logger.error(`[${formatDate()}]`, error);
    }

    res.json(infoData);
  });
};
