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
import * as path from 'path';
import {promisify} from 'util';

const router = express.Router();

const healthRoute = (): express.RequestHandler =>
  router.get('/log/?', async (req, res) => {
    const logFile = path.join(__dirname, '..', '..', '..', 'output.log');
    try {
      const log = await promisify(fs.readFile)(logFile, {encoding: 'utf8'});
      return res.send(log);
    } catch (error) {
      return res.status(500).json({error: error.message, stack: error.stack});
    }
  });

export default healthRoute;
