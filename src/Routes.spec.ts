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

import {APIClient} from '@wireapp/api-client';
import {AuthAPI} from '@wireapp/api-client/dist/auth/';
import {ClientAPI} from '@wireapp/api-client/dist/client/';
import {ConversationAPI} from '@wireapp/api-client/dist/conversation/';
import {NotificationAPI} from '@wireapp/api-client/dist/notification/';
import {UserAPI} from '@wireapp/api-client/dist/user/';
import axios, {AxiosError, AxiosRequestConfig, Method as RequestMethod} from 'axios';
import * as HTTP_STATUS_CODE from 'http-status-codes';
import nock from 'nock';
import UUID from 'pure-uuid';

import {ErrorMessage, config} from './config';
import {Server} from './Server';

type RequestResult<T> = {data: T; statusCode: number};

const backendURL = APIClient.BACKEND.PRODUCTION.rest;
const UUID_VERSION = 4;
const baseURL = `http://localhost:${config.PORT_HTTP}/api/v1`;

async function sendRequest<T>(
  method: RequestMethod,
  url: string,
  requestData: any,
  allowFailure: true,
): Promise<RequestResult<T | ErrorMessage>>;
async function sendRequest<T>(
  method: RequestMethod,
  url: string,
  requestData?: any,
  allowFailure?: boolean,
): Promise<RequestResult<T>>;
async function sendRequest<T>(
  method: RequestMethod,
  url: string,
  requestData?: any,
  allowFailure?: boolean,
): Promise<RequestResult<T | ErrorMessage>> {
  const requestConfig: AxiosRequestConfig = {method, url};
  if (requestData) {
    requestConfig.data = requestData;
    requestConfig.headers = {'Content-Type': 'application/json'};
  }

  try {
    const {data, status: statusCode} = await axios.request<T>(requestConfig);
    return {data, statusCode};
  } catch (error) {
    if (allowFailure) {
      return {
        data: (error as AxiosError<ErrorMessage>).response!.data,
        statusCode: (error as AxiosError).response!.status,
      };
    }
    throw error;
  }
}

function createInstance(
  data: {backend?: string; email?: string; password?: string},
  allowFailure: true,
): Promise<RequestResult<{instanceId: string} | ErrorMessage>>;
function createInstance(
  data?: {backend?: string; email?: string; password?: string},
  allowFailure?: boolean,
): Promise<RequestResult<{instanceId: string}>>;
function createInstance(
  data?: {backend?: string; email?: string; password?: string},
  allowFailure?: boolean,
): Promise<RequestResult<{instanceId: string} | ErrorMessage>> {
  const url = `${baseURL}/instance`;
  data = data || {backend: 'production', email: 'test@example.com', password: 'supersecret'};
  return sendRequest<{instanceId: string}>('put', url, data, allowFailure);
}

describe('Routes', () => {
  let etsServer: Server;

  const accessTokenData = {
    access_token:
      'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==.v=1.k=1.d=1498600993.t=a.l=.u=aaf9a833-ef30-4c22-86a0-9adc8a15b3b4.c=15037015562284012115',
    expires_in: 900,
    token_type: 'Bearer',
    user: new UUID(UUID_VERSION).format(),
  };

  beforeEach(async () => {
    etsServer = new Server(config);
    const clientId = '4e37b32f57f6da55';

    nock(backendURL)
      .post(AuthAPI.URL.LOGIN)
      .query({persist: 'true'})
      .reply(HTTP_STATUS_CODE.OK, accessTokenData)
      .persist();

    nock(backendURL).post(`${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`).reply(HTTP_STATUS_CODE.OK).persist();

    nock(backendURL).post(AuthAPI.URL.ACCESS).reply(HTTP_STATUS_CODE.OK, accessTokenData).persist();

    nock(backendURL).post(ClientAPI.URL.CLIENTS).reply(HTTP_STATUS_CODE.OK, {id: clientId}).persist();

    nock(backendURL)
      .post(new RegExp(`${ConversationAPI.URL.CONVERSATIONS}/.*/otr/messages`))
      .query(true)
      .reply(HTTP_STATUS_CODE.OK)
      .persist();

    nock(backendURL)
      .get(new RegExp(`${UserAPI.URL.USERS}/.*/${UserAPI.URL.PRE_KEYS}`))
      .reply(HTTP_STATUS_CODE.OK, {
        clients: [
          {
            client: clientId,
            prekey: new UUID(UUID_VERSION).format(),
          },
        ],
        user: new UUID(UUID_VERSION).format(),
      })
      .persist();

    nock(backendURL)
      .get(new RegExp(`${ConversationAPI.URL.CONVERSATIONS}/.*`))
      .reply(HTTP_STATUS_CODE.OK, {
        creator: new UUID(UUID_VERSION).format(),
        members: {
          others: [
            {
              [new UUID(UUID_VERSION).format()]: {
                id: new UUID(UUID_VERSION).format(),
              },
            },
          ],
          self: {
            id: new UUID(UUID_VERSION).format(),
          },
        },
      })
      .persist();

    nock(backendURL)
      .get(`${NotificationAPI.URL.NOTIFICATION}/${NotificationAPI.URL.LAST}`)
      .query({client: clientId})
      .reply(HTTP_STATUS_CODE.OK, {})
      .persist();

    nock(backendURL)
      .get(NotificationAPI.URL.NOTIFICATION)
      .query({client: clientId, size: 10000})
      .reply(HTTP_STATUS_CODE.OK, {has_more: false, notifications: []})
      .persist();

    nock(backendURL)
      .get(ClientAPI.URL.CLIENTS)
      .reply(HTTP_STATUS_CODE.OK, [{id: clientId}])
      .persist();

    await etsServer.start();
  });

  afterEach(async () => {
    if (etsServer && etsServer['server']) {
      await etsServer.stop();
    }
    nock.cleanAll();
  });

  it('can create instances', async () => {
    const returnValue = await createInstance();
    expect(returnValue.statusCode).toBe(HTTP_STATUS_CODE.OK);
    expect(returnValue.data.instanceId).toBeDefined();
  });

  it(`doesn't create an instance without login data`, async () => {
    const requestResult = await createInstance({backend: 'staging'}, true);
    if (!('error' in requestResult.data)) {
      return fail('No error returned');
    }
    expect(requestResult.statusCode).toBe(HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY);
    expect(requestResult.data.error).toContain('Validation error');
  });

  it(`doesn't create an instance without login data`, async () => {
    const requestResult = await createInstance({}, true);
    if (!('error' in requestResult.data)) {
      return fail('No error returned');
    }
    expect(requestResult.statusCode).toBe(HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY);
    expect(requestResult.data.error).toContain('Validation error');
  });

  it('can get the instance', async () => {
    const {data: createData, statusCode} = await createInstance();
    expect(statusCode).toBe(HTTP_STATUS_CODE.OK);

    const requestUrl = `${baseURL}/instance/${createData.instanceId}`;
    const {data: getInstanceData, statusCode: getInstanceStatusCode} = await sendRequest<{instanceId: string}>(
      'get',
      requestUrl,
    );
    expect(getInstanceStatusCode).toBe(HTTP_STATUS_CODE.OK);
    expect(getInstanceData.instanceId).toBe(createData.instanceId);
  });

  it('can send a text message', async () => {
    const {data: createData, statusCode: createInstanceStatusCode} = await createInstance();
    expect(createInstanceStatusCode).toBe(HTTP_STATUS_CODE.OK);

    const conversationId = new UUID(UUID_VERSION).format();
    const requestUrl = `${baseURL}/instance/${createData.instanceId}/sendText`;
    const requestData = {conversationId, text: 'Hello from Jasmine'};
    const {data: getData, statusCode: getStatusCode} = await sendRequest<{instanceId: string}>(
      'post',
      requestUrl,
      requestData,
    );
    expect(getStatusCode).toBe(HTTP_STATUS_CODE.OK);
    expect(getData.instanceId).toBe(createData.instanceId);
  });

  it('can send a text message with mention', async () => {
    const {data: createData, statusCode: createInstanceStatusCode} = await createInstance();
    expect(createInstanceStatusCode).toBe(HTTP_STATUS_CODE.OK);

    const conversationId = new UUID(UUID_VERSION).format();
    const requestUrl = `${baseURL}/instance/${createData.instanceId}/sendText`;
    const requestData = {
      conversationId,
      mentions: [
        {
          length: 8,
          start: 6,
          userId: new UUID(UUID_VERSION).format(),
        },
      ],
      text: 'Hello @Jasmine!',
    };
    const {data: sendTextData, statusCode: sendTextStatusCode} = await sendRequest<{instanceId: string}>(
      'post',
      requestUrl,
      requestData,
    );
    expect(sendTextStatusCode).toBe(HTTP_STATUS_CODE.OK);
    expect(sendTextData.instanceId).toBe(createData.instanceId);
  });

  it('can send a text message with multiple mentions', async () => {
    const {data: createData, statusCode: createInstanceStatusCode} = await createInstance();
    expect(createInstanceStatusCode).toBe(HTTP_STATUS_CODE.OK);

    const conversationId = new UUID(UUID_VERSION).format();
    const requestUrl = `${baseURL}/instance/${createData.instanceId}/sendText`;
    const requestData = {
      conversationId,
      mentions: [
        {
          length: 8,
          start: 6,
          userId: new UUID(UUID_VERSION).format(),
        },
        {
          length: 6,
          start: 19,
          userId: new UUID(UUID_VERSION).format(),
        },
      ],
      text: 'Hello @Jasmine and @Bernd!',
    };
    const requestResult = await sendRequest<{instanceId: string}>('post', requestUrl, requestData);
    const {data: sendTextData, statusCode: sendTextStatusCode} = requestResult;
    expect(sendTextStatusCode).toBe(HTTP_STATUS_CODE.OK);
    expect(sendTextData.instanceId).toBe(createData.instanceId);
  });

  it('sends the correct error code for not found', async () => {
    const {statusCode: createInstanceStatusCode} = await createInstance();
    expect(createInstanceStatusCode).toBe(HTTP_STATUS_CODE.OK);

    const requestUrl = `${baseURL}/doesnotexist`;
    const {statusCode: invalidURLStatusCode} = await sendRequest('get', requestUrl, {}, true);
    expect(invalidURLStatusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND);
  });

  it('saves sent messages', async () => {
    const {data: createData, statusCode: createInstanceStatusCode} = await createInstance();
    expect(createInstanceStatusCode).toBe(HTTP_STATUS_CODE.OK);

    const message = 'Hello from Jasmine';

    const conversationId = new UUID(UUID_VERSION).format();
    const textRequestUrl = `${baseURL}/instance/${createData.instanceId}/sendText`;
    const textRequestData = {conversationId, text: message};
    await sendRequest('post', textRequestUrl, textRequestData);

    const messagesRequestUrl = `${baseURL}/instance/${createData.instanceId}/getMessages`;
    const messagesRequestData = {conversationId};
    const {data: getMessagesData, statusCode: getMessagesStatusCode} = await sendRequest<{content: {text: string}}[]>(
      'post',
      messagesRequestUrl,
      messagesRequestData,
    );

    expect(getMessagesStatusCode).toBe(HTTP_STATUS_CODE.OK);
    expect(getMessagesData[0].content.text).toEqual(message);
  });
});
