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

/* eslint no-magic-numbers: "off" */
// @ts-check

require('dotenv').config({path: 'spec/test/.env'});
const {default: config} = require('../../dist/config');
const {default: Server} = require('../../dist/Server');
const nock = require('nock');
const request = require('request');
const Client = require('@wireapp/api-client/dist/commonjs/Client');
const backendURL = Client.BACKEND.PRODUCTION.rest;
const {AuthAPI} = require('@wireapp/api-client/dist/commonjs/auth/');
const {ClientAPI} = require('@wireapp/api-client/dist/commonjs/client/');
const {ConversationAPI} = require('@wireapp/api-client/dist/commonjs/conversation/');
const {UserAPI} = require('@wireapp/api-client/dist/commonjs/user/');
const {NotificationAPI} = require('@wireapp/api-client/dist/commonjs/notification/');

const sendRequest = async (method, url, data) => {
  const body = JSON.stringify(data);
  return new Promise((resolve, reject) => {
    request(url, {method, body, headers: {'Content-Type': 'application/json'}}, (error, response) => {
      if (error) {
        reject(error)
      } else {
        resolve(response);
      }
    });
  });
}

describe('Routes', () => {
  let server;
  const baseURL = `http://localhost:${config.PORT_HTTP}/api/v1`;

  const accessTokenData = {
    access_token:
      'iJCRCjc8oROO-dkrkqCXOade997oa8Jhbz6awMUQPBQo80VenWqp_oNvfY6AnU5BxEsdDPOBfBP-uz_b0gAKBQ==.v=1.k=1.d=1498600993.t=a.l=.u=aaf9a833-ef30-4c22-86a0-9adc8a15b3b4.c=15037015562284012115',
    expires_in: 900,
    token_type: 'Bearer',
    user: 'aaf9a833-ef30-4c22-86a0-9adc8a15b3b4',
  };

  beforeEach(() => {
    server = new Server(config);
    const clientId = '4e37b32f57f6da55';
    nock(backendURL).post(AuthAPI.URL.LOGIN).query({persist: true}).reply(200, accessTokenData);
    nock(backendURL).post(AuthAPI.URL.ACCESS + '/' + AuthAPI.URL.LOGOUT).reply(200);
    nock(backendURL).post(ClientAPI.URL.CLIENTS).reply(200, {id: clientId});
    nock(backendURL).post(new RegExp(ConversationAPI.URL.CONVERSATIONS + '/.*/otr/messages')).query({ignore_missing: false}).reply(200);
    nock(backendURL).get(NotificationAPI.URL.NOTIFICATION + '/last').query({client: clientId}).reply(200, {});
    nock(backendURL).get(ClientAPI.URL.CLIENTS).reply(200, [{id: clientId}]);
  });

  afterEach(async done => {
    if (server && server.server) {
      try {
        await server.stop();
        done();
      } catch(error) {
        console.error(error);
      }
    } else {
      done();
    }
  });

  const createInstance = async data => {
    const port = await server.start();
    const url = baseURL + '/instance';
    data = data || {backend: 'production', email: 'test@example.com', password: 'supersecret'};
    return sendRequest('put', url, data);
  }

  it('can create instances', async done => {
    try {
      const {statusCode, body} = await createInstance();
      expect(statusCode).toBe(200);
      const {instanceId} = JSON.parse(body);
      expect(instanceId).toBeDefined();
      done();
    } catch(error) {
      console.error(error);
    }
  });

  it(`doesn't create an instance without login data`, async done => {
    try {
      const {statusCode, body} = await createInstance({ backend: 'staging' });
      expect(statusCode).toBe(422);
      const {error} = JSON.parse(body);
      expect(error).toContain('Validation error');
      done();
    } catch(error) {
      console.error(error);
    }
  });

  it(`doesn't create an instance without login data`, async done => {
    try {
      const {statusCode, body} = await createInstance({});
      expect(statusCode).toBe(422);
      const {error} = JSON.parse(body);
      expect(error).toContain('Validation error');
      done();
    } catch(error) {
      console.error(error);
    }
  });

  it('can get the instance', async done => {
    try {
      const {statusCode, body} = await createInstance();
      expect(statusCode).toBe(200);
      const {instanceId} = JSON.parse(body);

      const requestUrl = `${baseURL}/instance/${instanceId}`;
      const {body: requestedBody, statusCode: requestedStatusCode} = await sendRequest('get', requestUrl);
      expect(requestedStatusCode).toBe(200);
      const {instanceId: requestedId} = JSON.parse(requestedBody);

      expect(requestedId).toBe(instanceId);
      done();
    } catch(error) {
      console.error(error);
    }
  });

  it('can send a text message', async done => {
    try {
      const {statusCode, body} = await createInstance();
      expect(statusCode).toBe(200);
      const {instanceId} = JSON.parse(body);

      const requestUrl = `${baseURL}/instance/${instanceId}/sendText`;
      const requestData = {conversationId: 'b8258e66-5314-4ca1-a80e-ee0c523a0adb', text: 'Hello from Jasmine'}
      const {body: requestedBody, statusCode: requestedStatusCode} = await sendRequest('post', requestUrl, requestData);
      expect(requestedStatusCode).toBe(200);

      const {instanceId: requestedId} = JSON.parse(requestedBody);
      expect(requestedId).toBe(instanceId);
      done();
    } catch(error) {
      console.error(error);
    }
  });
});
