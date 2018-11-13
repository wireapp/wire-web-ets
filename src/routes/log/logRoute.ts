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
import * as logdown from 'logdown';

const router = express.Router();
const outLogFile = process.env.LOG_OUTPUT;
const errorLogFile = process.env.LOG_ERROR;

const logger = logdown('@wireapp/wire-web-ets/routes/log/logRoute', {
  logger: console,
  markdown: false,
});

const logRoute = () =>
  router.get('/log/?', async (req, res) => {
    try {
      let logData = '';

      if (errorLogFile) {
        logData += `=== ${errorLogFile} ===\n`;
        try {
          const errorLogData = await fs.readFile(errorLogFile, {encoding: 'utf8'});
          logData += `${errorLogData}`;
        } catch (error) {
          logger.error(error);
          logData += `Error: Could not find error log file "${errorLogFile}" or it is not readable.`;
        }
      } else {
        logData += `Error: No error log file specified.`;
      }

      logData += '\n';

      if (outLogFile) {
        logData += `=== ${outLogFile} ===\n`;
        try {
          const outLogData = await fs.readFile(outLogFile, {encoding: 'utf8'});
          logData += outLogData;
        } catch (error) {
          logger.error(error);
          logData += `Error: Could not find output log file "${outLogFile}" or it is not readable.`;
        }
      } else {
        logData += `Error: No output log file specified.`;
      }

      return res.contentType('text/plain; charset=UTF-8').send(logData);
    } catch (error) {
      return res.status(500).json({error: error.message, stack: error.stack});
    }
  });

export default logRoute;
