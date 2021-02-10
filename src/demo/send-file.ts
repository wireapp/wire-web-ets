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

  await sendFile(
    client.service!.conversation!,
    process.env.WIRE_CONVERSATION_ID!,
    {
      data: dataBuffer,
    },
    {
      length: dataBuffer.length,
      name: 'some-file.txt',
      type: 'plain/text',
    },
  );

  console.info(`Sent file.`);
}

main().catch(console.error);
