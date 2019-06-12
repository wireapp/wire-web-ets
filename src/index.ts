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

import * as logdown from 'logdown';

import {config} from './config';
import {Server} from './Server';
import {formatDate} from './utils';

const logger = logdown('@wireapp/wire-web-ets/index', {
  logger: console,
  markdown: false,
});

const server = new Server(config);

server
  .start()
  .then(port => logger.info(`[${formatDate()}] Server is running on port ${port}.`))
  .catch(error => {
    logger.error(`[${formatDate()}]`, error);
    process.exit(1);
  });

process.on('SIGINT', async () => {
  logger.log(`[${formatDate()}] Received "SIGINT" signal. Exiting.`);
  try {
    await server.stop();
  } catch (error) {
    logger.error(`[${formatDate()}]`, error);
  }
  process.exit();
});

process.on('SIGTERM', async () => {
  logger.log(`[${formatDate()}] Received "SIGTERM" signal. Exiting.`);
  try {
    await server.stop();
  } catch (error) {
    logger.error(`[${formatDate()}]`, error);
  }
  process.exit();
});

process.on('uncaughtException', error => {
  console.error(`[${formatDate()}] Uncaught exception: ${error.message}`, error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${formatDate()}] Unhandled rejection at:`, promise, 'reason:', reason);
});
