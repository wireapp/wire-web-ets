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
import * as path from 'path';

import {ServerConfig} from '../../config';

const router = express.Router();

export const commitRoute = (config: ServerConfig) => {
  const commitHashFile = path.join(config.DIST_DIR, 'commit');

  return router.get(['/commit/?', '/api/v1/commit/?'], async (req, res) => {
    try {
      const commitHash = await fs.readFile(commitHashFile, {encoding: 'utf8'});
      return res.contentType('text/plain; charset=UTF-8').send(commitHash.trim());
    } catch (error) {
      return res.status(500).json({error: error.message, stack: error.stack});
    }
  });
};
