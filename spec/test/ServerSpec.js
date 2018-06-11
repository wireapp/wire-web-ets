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

require('dotenv').config({path: 'spec/test/.env'});
const {default: config} = require('../../dist/config');
const request = require('request');
const {default: Server} = require('../../dist/Server');

const HTTP_CODE_OK = 200;

describe('Server', () => {
  let server;

  beforeEach(() => (server = new Server(config)));

  afterEach(async done => {
    if (server && server.server) {
      try {
        await server.stop();
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
      const port = await server.start();
      console.log('process.env.PORT', process.env.PORT);
      expect(port).toBe(Number(process.env.PORT));
      done();
    } catch (error) {
      console.error(error);
    }
  });

  it('responds to requests', async done => {
    const port = await server.start();

    const url = `http://localhost:${port}/`;
    request.get(url, (error, response) => {
      if (error) {
        done.fail(error);
      } else {
        expect(response.statusCode).toBe(HTTP_CODE_OK);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('ready');
        done();
      }
    });
  });
});
