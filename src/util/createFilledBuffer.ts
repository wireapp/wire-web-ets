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

export function createFilledBuffer(sizeInMegaBytes: number): Buffer {
  const characterBuffer = Buffer.alloc(1, 'A');
  let dataBuffer = Buffer.alloc(0);

  const characters = sizeInMegaBytes * 1000000;

  for (let amount = 0; amount <= characters; amount++) {
    dataBuffer = Buffer.concat([dataBuffer, characterBuffer]);
  }

  return dataBuffer;
}
