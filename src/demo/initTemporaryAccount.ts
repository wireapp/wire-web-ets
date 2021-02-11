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

import 'dotenv-defaults/config';

import {Account} from '@wireapp/core';
import {ClientType} from '@wireapp/api-client/src/client';
import {APIClient} from '@wireapp/api-client';

const {WIRE_BACKEND, WIRE_EMAIL, WIRE_PASSWORD} = process.env;

if (!WIRE_EMAIL) {
  throw new Error('Please set an email address for your Wire user account in your `.env` file to login.');
}

if (!WIRE_PASSWORD) {
  throw new Error('Please set a password for your Wire user account in your `.env` file to login.');
}

export async function initTemporaryAccount(): Promise<Account> {
  const apiClient = new APIClient({
    urls: WIRE_BACKEND === 'staging' ? APIClient.BACKEND.STAGING : APIClient.BACKEND.PRODUCTION,
  });

  const account = new Account(apiClient);

  const clientType = ClientType.TEMPORARY;

  await account.login({
    clientType,
    email: WIRE_EMAIL,
    password: WIRE_PASSWORD,
  });

  console.info(
    `Logged in on "${apiClient.config.urls.rest}" with client ID "${account.clientId}" (${clientType}) from user ID "${account.userId}".`,
  );

  return account;
}
