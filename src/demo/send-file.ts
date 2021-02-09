import {initTemporaryAccount} from './initTemporaryAccount';
import {sendFile} from '../send/sendFile';

async function main(): Promise<void> {
  const client = await initTemporaryAccount();

  const characterBuffer = new Buffer('A');
  let dataBuffer = new Buffer('');

  console.info(`Generating file (~1.5 MB)...`);

  for (let amount = 0; amount <= 1500000; amount++) {
    dataBuffer = Buffer.concat([dataBuffer, characterBuffer]);
  }

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
