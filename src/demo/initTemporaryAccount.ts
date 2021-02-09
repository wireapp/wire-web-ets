import {Account} from '@wireapp/core';
import {ClientType} from '@wireapp/api-client/dist/client';

import 'dotenv-defaults/config';
import {APIClient} from '@wireapp/api-client';

const {WIRE_EMAIL, WIRE_PASSWORD} = process.env;

export async function initTemporaryAccount(): Promise<Account> {
  const apiClient = new APIClient();

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
