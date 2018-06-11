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
const request = require('request');
const {default: Server} = require('../../dist/Server');

const HTTP_CODE_OK = 200;

describe('Server', () => {
  let etsServer;

  beforeEach(() => (etsServer = new Server(config)));

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

  it('starts a server on a specified port', async done => {
    try {
      const port = await etsServer.start();
      expect(port).toBe(config.PORT_HTTP);
      done();
    } catch (error) {
      console.error(error);
    }
  });

  it('responds to requests', async done => {
    const port = await etsServer.start();

    const url = `http://localhost:${port}/`;
    request.get(url, (error, response) => {
      if (error) {
        done.fail(error);
      } else {
        expect(response.statusCode).toBe(HTTP_CODE_OK);
        const {message} = JSON.parse(response.body);
        expect(message).toContain('ready');
        done();
      }
    });
  });
});
