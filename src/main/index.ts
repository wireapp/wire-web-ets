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

import config from './config';
import Server from './Server';
import utils from './utils';

const server = new Server(config);

server
  .start()
  .then(port => console.info(`[${utils.formatDate()}] Server is running on port ${port}.`))
  .catch(error => console.error(`[${utils.formatDate()}] ${error.stack}`));

process.on('SIGINT', () => {
  console.log(`[${utils.formatDate()}] Received "SIGINT" signal. Exiting.`);
  server.stop();
});

process.on('SIGTERM', () => {
  console.log(`[${utils.formatDate()}] Received "SIGTERM" signal. Exiting.`);
  server.stop();
});

process.on('uncaughtException', error => console.error(`Uncaught exception: ${error.message}`, error));
process.on('unhandledRejection', error =>
  console.error(`Uncaught rejection "${error.constructor.name}": ${error.message}`, error)
);
