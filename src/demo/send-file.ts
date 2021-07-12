/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
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

import {initTemporaryAccount} from './initTemporaryAccount';
import {sendFile} from '../send/sendFile';
import {promisify} from 'util';
import fs from 'fs';
import path from 'path';

async function main(): Promise<void> {
  const client = await initTemporaryAccount();

  console.info(`Reading file (~15 MB)...`);

  const readFileAsync = promisify(fs.readFile);
  const dataBuffer = await readFileAsync(path.join(__dirname, '../fixtures/files/text/15mb.txt'));

  console.info(`Read file.`);

  console.info(`Sending file...`);

  await sendFile({
    conversationId: process.env.WIRE_CONVERSATION_ID!,
    conversationService: client.service!.conversation!,
    file: {
      data: dataBuffer,
    },
    metadata: {
      length: dataBuffer.length,
      name: 'some-file.txt',
      type: 'plain/text',
    },
  });

  console.info(`Sent file.`);
}

main().catch(console.error);
