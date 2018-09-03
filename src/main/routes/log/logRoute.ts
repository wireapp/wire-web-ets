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
import * as fs from 'fs';
import {promisify} from 'util';
import {fileIsReadable, getPm2Instance} from '../../utils';

const router = express.Router();

const logRoute = () =>
  router.get('/log/?', async (req, res) => {
    try {
      const instance = await getPm2Instance();
      if (instance && instance.pm2_env) {
        const {pm_err_log_path: errorLogPath, pm_out_log_path: outLogPath} = instance.pm2_env;

        let logData = '';

        if (errorLogPath && (await fileIsReadable(errorLogPath))) {
          const errorLogData = await promisify(fs.readFile)(errorLogPath, {encoding: 'utf8'});
          logData += `=== ${errorLogPath} ===\n${errorLogData}\n`;
        }

        if (outLogPath && (await fileIsReadable(outLogPath))) {
          const outLogData = await promisify(fs.readFile)(outLogPath, {encoding: 'utf8'});
          logData += `=== ${outLogPath} ===\n${outLogData}`;
        }

        return res.contentType('text/plain; charset=UTF-8').send(logData);
      } else {
        throw new Error(`pm2 couldn't find any instances.`);
      }
    } catch (error) {
      return res.status(500).json({error: error.message, stack: error.stack});
    }
  });

export default logRoute;
