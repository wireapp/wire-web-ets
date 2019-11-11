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
import {AuthAPI} from '@wireapp/api-client/dist/commonjs/auth/';
import {ClientAPI} from '@wireapp/api-client/dist/commonjs/client/';
import {ConversationAPI} from '@wireapp/api-client/dist/commonjs/conversation/';
import {NotificationAPI} from '@wireapp/api-client/dist/commonjs/notification/';
import {UserAPI} from '@wireapp/api-client/dist/commonjs/user/';
import * as HTTP_STATUS_CODE from 'http-status-codes';
import UUID from 'pure-uuid';
import {config} from './config';
import {Server} from './Server';

import * as nock from 'nock';
import * as request from 'request';

const backendURL = APIClient.BACKEND.PRODUCTION.rest;
const UUID_VERSION = 4;

type RequestOptions = Record<string, string | any>;

const sendRequest = (method: string, url: string, data?: RequestOptions): Promise<request.Response> => {
  let options: request.CoreOptions = {method};
  if (data) {
    const body = JSON.stringify(data);
    options = {body, headers: {'Content-Type': 'application/json'}, method};
  }
  return new Promise((resolve, reject) => {
    request(url, options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

describe('Routes', () => {
  let etsServer: Server;
  const baseURL = `http://localhost:${config.PORT_HTTP}/api/v1`;

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

    nock(backendURL)
      .post(`${AuthAPI.URL.ACCESS}/${AuthAPI.URL.LOGOUT}`)
      .reply(HTTP_STATUS_CODE.OK)
      .persist();

    nock(backendURL)
      .post(AuthAPI.URL.ACCESS)
      .reply(HTTP_STATUS_CODE.OK, accessTokenData)
      .persist();

    nock(backendURL)
      .post(ClientAPI.URL.CLIENTS)
      .reply(HTTP_STATUS_CODE.OK, {id: clientId})
      .persist();

    nock(backendURL)
      .post(new RegExp(`${ConversationAPI.URL.CONVERSATIONS}/.*/otr/messages`))
      .query({ignore_missing: 'false'})
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

  const createInstance = (data?: RequestOptions) => {
    const url = `${baseURL}/instance`;
    data = data || {backend: 'production', email: 'test@example.com', password: 'supersecret'};
    return sendRequest('put', url, data);
  };

  it('can create instances', async () => {
    const {statusCode, body} = await createInstance();
    expect(statusCode).toBe(HTTP_STATUS_CODE.OK);
    const {instanceId} = JSON.parse(body);
    expect(instanceId).toBeDefined();
  });

  it(`doesn't create an instance without login data`, async () => {
    const {statusCode, body} = await createInstance({backend: 'staging'});
    expect(statusCode).toBe(HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY);
    const {error} = JSON.parse(body);
    expect(error).toContain('Validation error');
  });

  it(`doesn't create an instance without login data`, async () => {
    const {statusCode, body} = await createInstance({});
    expect(statusCode).toBe(HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY);
    const {error} = JSON.parse(body);
    expect(error).toContain('Validation error');
  });

  it('can get the instance', async () => {
    const {statusCode, body} = await createInstance();
    expect(statusCode).toBe(HTTP_STATUS_CODE.OK);
    const {instanceId} = JSON.parse(body);

    const requestUrl = `${baseURL}/instance/${instanceId}`;
    const {body: requestedBody, statusCode: requestedStatusCode} = await sendRequest('get', requestUrl);
    expect(requestedStatusCode).toBe(HTTP_STATUS_CODE.OK);
    const {instanceId: requestedId} = JSON.parse(requestedBody);

    expect(requestedId).toBe(instanceId);
  });

  it('can send a text message', async () => {
    const {statusCode, body} = await createInstance();
    expect(statusCode).toBe(HTTP_STATUS_CODE.OK);
    const {instanceId} = JSON.parse(body);

    const conversationId = new UUID(UUID_VERSION).format();
    const requestUrl = `${baseURL}/instance/${instanceId}/sendText`;
    const requestData = {conversationId, text: 'Hello from Jasmine'};
    const {body: requestedBody, statusCode: requestedStatusCode} = await sendRequest('post', requestUrl, requestData);
    expect(requestedStatusCode).toBe(HTTP_STATUS_CODE.OK);

    const {instanceId: requestedId} = JSON.parse(requestedBody);
    expect(requestedId).toBe(instanceId);
  });

  it('can send a text message with mention', async () => {
    const {statusCode, body} = await createInstance();
    expect(statusCode).toBe(HTTP_STATUS_CODE.OK);
    const {instanceId} = JSON.parse(body);

    const conversationId = new UUID(UUID_VERSION).format();
    const requestUrl = `${baseURL}/instance/${instanceId}/sendText`;
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
    const {body: requestedBody, statusCode: requestedStatusCode} = await sendRequest('post', requestUrl, requestData);
    expect(requestedStatusCode).toBe(HTTP_STATUS_CODE.OK);

    const {instanceId: requestedId} = JSON.parse(requestedBody);
    expect(requestedId).toBe(instanceId);
  });

  it('can send a text message with multiple mentions', async () => {
    const {statusCode, body} = await createInstance();
    expect(statusCode).toBe(HTTP_STATUS_CODE.OK);
    const {instanceId} = JSON.parse(body);

    const conversationId = new UUID(UUID_VERSION).format();
    const requestUrl = `${baseURL}/instance/${instanceId}/sendText`;
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
    const {body: requestedBody, statusCode: requestedStatusCode} = await sendRequest('post', requestUrl, requestData);
    expect(requestedStatusCode).toBe(HTTP_STATUS_CODE.OK);

    const {instanceId: requestedId} = JSON.parse(requestedBody);
    expect(requestedId).toBe(instanceId);
  });

  it('sends the correct error code for not found', async () => {
    const {statusCode} = await createInstance();
    expect(statusCode).toBe(HTTP_STATUS_CODE.OK);

    const requestUrl = `${baseURL}/doesnotexist`;
    const {statusCode: requestedStatusCode} = await sendRequest('get', requestUrl);
    expect(requestedStatusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND);
  });

  it('saves sent messages', async () => {
    const {statusCode, body} = await createInstance();
    expect(statusCode).toBe(HTTP_STATUS_CODE.OK);
    const {instanceId} = JSON.parse(body);

    const message = 'Hello from Jasmine';

    const conversationId = new UUID(UUID_VERSION).format();
    const textRequestUrl = `${baseURL}/instance/${instanceId}/sendText`;
    const textRequestData = {conversationId, text: message};
    await sendRequest('post', textRequestUrl, textRequestData);

    const messagesRequestUrl = `${baseURL}/instance/${instanceId}/getMessages`;
    const messagesRequestData = {conversationId};
    const {body: requestedBody, statusCode: requestedStatusCode} = await sendRequest(
      'post',
      messagesRequestUrl,
      messagesRequestData,
    );

    const receivedPayload = JSON.parse(requestedBody);

    expect(requestedStatusCode).toBe(HTTP_STATUS_CODE.OK);
    expect(receivedPayload[0].content.text).toEqual(message);
  });
});
