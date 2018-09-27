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

import * as fs from 'fs';
import * as moment from 'moment';
import {promisify} from 'util';

function fileIsReadable(filePath: string): Promise<boolean> {
  return promisify(fs.access)(filePath, fs.constants.F_OK | fs.constants.R_OK)
    .then(() => true)
    .catch(() => false);
}

function formatDate(): string {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

function formatUptime(uptime: number): string {
  const duration = moment.duration(uptime, 'seconds').asMilliseconds();
  return moment.utc(duration).format('HH:mm:ss');
}

export {fileIsReadable, formatDate, formatUptime};
