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

// @ts-check

const {default: config} = require('../../dist/config');
const {default: Server} = require('../../dist/Server');
const nock = require('nock');
const request = require('request');
const {APIClient} = require('@wireapp/api-client');
const backendURL = APIClient.BACKEND.PRODUCTION.rest;
const {AuthAPI} = require('@wireapp/api-client/dist/commonjs/auth/');
const {ClientAPI} = require('@wireapp/api-client/dist/commonjs/client/');
const {ConversationAPI} = require('@wireapp/api-client/dist/commonjs/conversation/');
const {NotificationAPI} = require('@wireapp/api-client/dist/commonjs/notification/');

const HTTP_CODE_OK = 200;
const HTTP_CODE_UNPROCESSABLE_ENTITY = 422;

const sendRequest = async (method, url, data) => {
  const body = JSON.stringify(data);
  return new Promise((resolve, reject) => {
    request(url, {body, headers: {'Content-Type': 'application/json'}, method}, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

describe('Routes', () => {
  let etsServer;
  const baseURL = `http://localhost:${config.PORT_HTTP}/api/v1`;

  const accessTokenData = {
    access_token:
      'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==.v=1.k=1.d=1498600993.t=a.l=.u=aaf9a833-ef30-4c22-86a0-9adc8a15b3b4.c=15037015562284012115',
    expires_in: 900,
    token_type: 'Bearer',
    user: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
  };

  beforeEach(() => {
    etsServer = new Server(config);
    const clientId = '4e37b32f57f6da55';
    nock(backendURL)
      .post(AuthAPI.URL.LOGIN)
      .query({persist: true})
      .reply(HTTP_CODE_OK, accessTokenData);
    nock(backendURL)
      .post(AuthAPI.URL.ACCESS + '/' + AuthAPI.URL.LOGOUT)
      .reply(HTTP_CODE_OK);
    nock(backendURL)
      .post(ClientAPI.URL.CLIENTS)
      .reply(HTTP_CODE_OK, {id: clientId});
    nock(backendURL)
      .post(new RegExp(ConversationAPI.URL.CONVERSATIONS + '/.*/otr/messages'))
      .query({ignore_missing: false})
      .reply(HTTP_CODE_OK)
      .persist();
    nock(backendURL)
      .get(NotificationAPI.URL.NOTIFICATION + '/last')
      .query({client: clientId})
      .reply(HTTP_CODE_OK, {});
    nock(backendURL)
      .get(ClientAPI.URL.CLIENTS)
      .reply(HTTP_CODE_OK, [{id: clientId}]);
  });

  afterEach(async done => {
    if (etsServer && etsServer.server) {
      try {
        await etsServer.stop();
        done();
      } catch (error) {
        console.error(error);
      }
    } else {
      done();
    }
  });

  const createInstance = async data => {
    await etsServer.start();
    const url = baseURL + '/instance';
    data = data || {backend: 'production', email: 'test@example.com', password: 'supersecret'};
    return sendRequest('put', url, data);
  };

  it('can create instances', async done => {
    try {
      const {statusCode, body} = await createInstance();
      expect(statusCode).toBe(HTTP_CODE_OK);
      const {instanceId} = JSON.parse(body);
      expect(instanceId).toBeDefined();
      done();
    } catch (error) {
      console.error(error);
    }
  });

  it(`doesn't create an instance without login data`, async done => {
    try {
      const {statusCode, body} = await createInstance({backend: 'staging'});
      expect(statusCode).toBe(HTTP_CODE_UNPROCESSABLE_ENTITY);
      const {error} = JSON.parse(body);
      expect(error).toContain('Validation error');
      done();
    } catch (error) {
      console.error(error);
    }
  });

  it(`doesn't create an instance without login data`, async done => {
    try {
      const {statusCode, body} = await createInstance({});
      expect(statusCode).toBe(HTTP_CODE_UNPROCESSABLE_ENTITY);
      const {error} = JSON.parse(body);
      expect(error).toContain('Validation error');
      done();
    } catch (error) {
      console.error(error);
    }
  });

  it('can get the instance', async done => {
    try {
      const {statusCode, body} = await createInstance();
      expect(statusCode).toBe(HTTP_CODE_OK);
      const {instanceId} = JSON.parse(body);

      const requestUrl = `${baseURL}/instance/${instanceId}`;
      const {body: requestedBody, statusCode: requestedStatusCode} = await sendRequest('get', requestUrl);
      expect(requestedStatusCode).toBe(HTTP_CODE_OK);
      const {instanceId: requestedId} = JSON.parse(requestedBody);

      expect(requestedId).toBe(instanceId);
      done();
    } catch (error) {
      console.error(error);
    }
  });

  it('can send a text message', async done => {
    try {
      const {statusCode, body} = await createInstance();
      expect(statusCode).toBe(HTTP_CODE_OK);
      const {instanceId} = JSON.parse(body);

      const requestUrl = `${baseURL}/instance/${instanceId}/sendText`;
      const requestData = {conversationId: 'b8258e66-5314-4ca1-a80e-ee0c523a0adb', text: 'Hello from Jasmine'};
      const {body: requestedBody, statusCode: requestedStatusCode} = await sendRequest('post', requestUrl, requestData);
      expect(requestedStatusCode).toBe(HTTP_CODE_OK);

      const {instanceId: requestedId} = JSON.parse(requestedBody);
      expect(requestedId).toBe(instanceId);
      done();
    } catch (error) {
      console.error(error);
    }
  });
});
