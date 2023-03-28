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

import moment from 'moment';
import {
  AssetContent,
  ConversationContent,
  FileAssetContent,
  ImageAssetContent,
  ImageContent,
  LinkPreviewUploadedContent,
  RemoteData,
} from '@wireapp/core/src/main/conversation/content/';
import {EncryptedAssetUploaded} from '@wireapp/core/src/main/cryptography';
import {StatusCodes as HTTP_STATUS_CODE} from 'http-status-codes';

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

function stripAssetData(asset: Partial<EncryptedAssetUploaded>): void {
  delete asset.cipherText;
  delete asset.keyBytes;
  delete asset.sha256;
}

function stripAsset(content?: ConversationContent): void {
  if (isFileAssetContent(content)) {
    stripAssetData(content.asset);
    delete (content as Partial<FileAssetContent>).file;
  } else if (isAssetContent(content) && content.uploaded) {
    delete (content.uploaded as Partial<RemoteData>).sha256;
    delete (content.uploaded as Partial<RemoteData>).otrKey;
  } else if (isImageAssetContent(content)) {
    delete (content.image as Partial<ImageContent>).data;
  }
}

function stripLinkPreview(linkPreview: LinkPreviewUploadedContent): void {
  if (linkPreview.imageUploaded) {
    stripAssetData(linkPreview.imageUploaded.asset);
    delete (linkPreview.imageUploaded.image as Partial<ImageContent>).data;
  }
}

const status404instance = {description: 'Instance not found', status: HTTP_STATUS_CODE.NOT_FOUND};
const status422description = {description: 'Validation error', status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY};
const status500description = {description: 'Internal server error', status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR};
const status403description = {description: 'Code Authentication failed', status: HTTP_STATUS_CODE.FORBIDDEN};

export {
  formatDate,
  formatUptime,
  hexToUint8Array,
  isAssetContent,
  stripAsset,
  stripLinkPreview,
  status404instance,
  status422description,
  status403description,
  status500description,
};
