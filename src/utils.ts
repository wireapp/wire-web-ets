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

import {
  FileAssetContent,
  ImageAssetContent,
  LinkPreviewUploadedContent,
} from '@wireapp/core/dist/conversation/content/';
import * as fs from 'fs';
import * as moment from 'moment';
import {promisify} from 'util';

function fileIsReadable(filePath: string): Promise<boolean> {
  return promisify(fs.access)(filePath, fs.constants.F_OK | fs.constants.R_OK)
    .then(() => true)
    .catch(() => false);
}

function formatDate(): string {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

function formatUptime(uptime: number): string {
  const duration = moment.duration(uptime, 'seconds').asMilliseconds();
  return moment.utc(duration).format('HH:mm:ss');
}

function hexToUint8Array(inputString: string): Uint8Array {
  const buffer = Buffer.from(inputString, 'hex');
  return new Uint8Array(buffer);
}

function stripAssetData(content: ImageAssetContent | FileAssetContent): void {
  delete content.asset.cipherText;
  delete content.asset.keyBytes;
  delete content.asset.sha256;

  if ((content as ImageAssetContent).image) {
    delete (content as ImageAssetContent).image.data;
  }

  if ((content as FileAssetContent).file) {
    delete (content as FileAssetContent).file;
  }
}

function stripLinkPreviewData(linkPreview: LinkPreviewUploadedContent): void {
  if (linkPreview.imageUploaded) {
    delete linkPreview.imageUploaded.asset.cipherText;
    delete linkPreview.imageUploaded.asset.keyBytes;
    delete linkPreview.imageUploaded.asset.sha256;
    delete linkPreview.imageUploaded.image.data;
  }

  if (linkPreview.image) {
    delete linkPreview.image.data;
  }
}

export {fileIsReadable, formatDate, formatUptime, hexToUint8Array, stripAssetData, stripLinkPreviewData};
