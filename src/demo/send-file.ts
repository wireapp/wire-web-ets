import {initTemporaryAccount} from './initTemporaryAccount';
import {sendFile} from '../send/sendFile';
import {createFilledBuffer} from '../util/createFilledBuffer';

async function main(): Promise<void> {
  const client = await initTemporaryAccount();

  console.info(`Generating file (~1.5 MB)...`);

  const dataBuffer = createFilledBuffer(1.5);

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
}

main().catch(console.error);
