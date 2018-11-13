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

import * as moment from 'moment';

import {
  AssetContent,
  ConversationContent,
  FileAssetContent,
  ImageAssetContent,
  LinkPreviewUploadedContent,
} from '@wireapp/core/dist/conversation/content/';
import {EncryptedAssetUploaded} from '@wireapp/core/dist/cryptography';

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

function isAssetContent(content: any): content is AssetContent {
  return !!((content as AssetContent).uploaded || (content as AssetContent).preview);
}

function isFileAssetContent(content: any): content is FileAssetContent {
  return !!(content as FileAssetContent).file && !!(content as FileAssetContent).asset;
}

function isImageAssetContent(content: any): content is ImageAssetContent {
  return !!(content as ImageAssetContent).image && !!(content as ImageAssetContent).asset;
}

function stripAssetData(asset: EncryptedAssetUploaded): void {
  delete asset.cipherText;
  delete asset.keyBytes;
  delete asset.sha256;
}

function stripAsset(content?: ConversationContent): void {
  if (isFileAssetContent(content)) {
    stripAssetData(content.asset);
    delete content.file;
  } else if (isAssetContent(content) && content.uploaded) {
    delete content.uploaded.sha256;
    delete content.uploaded.otrKey;
  } else if (isImageAssetContent(content)) {
    delete content.image.data;
  }
}

function stripLinkPreview(linkPreview: LinkPreviewUploadedContent): void {
  if (linkPreview.imageUploaded) {
    stripAssetData(linkPreview.imageUploaded.asset);
    delete linkPreview.imageUploaded.image.data;
  }

  if (linkPreview.image) {
    delete linkPreview.image.data;
  }
}

export {formatDate, formatUptime, hexToUint8Array, isAssetContent, stripAsset, stripLinkPreview};
