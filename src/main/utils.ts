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

function fileIsReadable(filePath: string): Promise<boolean> {
  return promisify(fs.access)(filePath, fs.constants.F_OK | fs.constants.R_OK)
    .then(() => true)
    .catch(() => false);
}

function formatDate(): string {
  const localeOptions = {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    year: 'numeric',
  };
  return new Date().toLocaleDateString('de-DE', localeOptions);
}

async function getPm2Instance(): Promise<pm2.ProcessDescription> {
  await pm2ConnectAsync(true);
  const [instance] = await pm2ListAsync();
  pm2.disconnect();
  return instance;
}

function pm2ConnectAsync(noDaemonMode: boolean): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    pm2.connect(
      noDaemonMode,
      err => (err ? reject(err) : resolve())
    )
  );
}

function pm2ListAsync(): Promise<pm2.ProcessDescription[]> {
  return new Promise<pm2.ProcessDescription[]>((resolve, reject) =>
    pm2.list((err, list) => (err ? reject(err) : resolve(list)))
  );
}

function calcPm2Uptime(rawUptime: number): string {
  const uptimeInSeconds = Math.round((Date.now() - rawUptime) / 1000);

  const pad = (t: number) => (t < 10 ? '0' + t : t);

  const hours = Math.floor(uptimeInSeconds / 3600);
  const minutes = Math.floor((uptimeInSeconds - hours * 3600) / 60);
  const seconds = Math.floor(uptimeInSeconds - hours * 3600 - minutes * 60);

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export {fileIsReadable, formatDate, getPm2Instance, calcPm2Uptime};
