export function createFilledBuffer(sizeInMegaBytes: number): Buffer {
  const characterBuffer = new Buffer('A');
  let dataBuffer = new Buffer('');

  const characters = sizeInMegaBytes * 1000000;

  for (let amount = 0; amount <= characters; amount++) {
    dataBuffer = Buffer.concat([dataBuffer, characterBuffer]);
  }

  return dataBuffer;
}
