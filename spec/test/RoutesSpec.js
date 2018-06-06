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
console.log('backendURL', backendURL)
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

  const createInstance = async () => {
    const port = await server.start();
    const url = baseURL + '/instance';
    const data = {backend: 'production', email: 'test@example.com', password: 'supersecret'}
    const response = await sendRequest('put', url, data);
    expect(response.statusCode).toBe(200);
    console.log('response', response.body)
    const {instanceId} = JSON.parse(response.body);
    return instanceId;
  }

  it('can create instances', async done => {
    try {
      const instanceId = await createInstance();
      expect(instanceId).toBeDefined();
      done();
    } catch(error) {
      console.error(error);
    }
  });

  it('can get the instance', async done => {
    try {
      const instanceId = await createInstance();
      const url = `${baseURL}/instance/${instanceId}`;
      const response = await sendRequest('get', url);
      const body = JSON.parse(response.body);
      expect(body.instanceId).toBe(instanceId);
      done();
    } catch(error) {
      console.error(error);
    }
  });

  it('can send a text message', async done => {
    try {
      const instanceId = await createInstance();
      const url = `${baseURL}/instance/${instanceId}/sendText`;
      const data = {conversationId: 'b8258e66-5314-4ca1-a80e-ee0c523a0adb', text: 'Hello from Jasmine'}
      const response = await sendRequest('post', url, data);
      console.log('response.body', response.body)
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.instanceId).toBeDefined()
      done();
    } catch(error) {
      console.error(error);
    }
  });
});
