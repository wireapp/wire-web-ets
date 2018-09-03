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
import * as pm2 from 'pm2';
import {promisify} from 'util';

const utils = {
  fileIsReadable: (filePath: string) =>
    promisify(fs.access)(filePath, fs.constants.F_OK | fs.constants.R_OK)
      .then(() => true)
      .catch(() => false),
  formatDate(): string {
    const localeOptions = {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
      year: 'numeric',
    };
    return new Date().toLocaleDateString('de-DE', localeOptions);
  },
  pm2ConnectAsync: (noDaemonMode: boolean) =>
    new Promise<void>((resolve, reject) =>
      pm2.connect(
        noDaemonMode,
        err => (err ? reject(err) : resolve())
      )
    ),
  pm2ListAsync: () =>
    new Promise<pm2.ProcessDescription[]>((resolve, reject) =>
      pm2.list((err, list) => (err ? reject(err) : resolve(list)))
    ),
};

export default utils;
