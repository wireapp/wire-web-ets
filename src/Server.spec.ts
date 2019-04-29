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

import * as request from 'request';
import {config} from './config';
import {Server} from './Server';

const HTTP_CODE_OK = 200;

describe('Server', () => {
  let etsServer: Server;

  beforeEach(() => (etsServer = new Server(config)));

  afterEach(async () => {
    if (etsServer && etsServer['server']) {
      await etsServer.stop();
    }
  });

  it('starts a server on a specified port', async () => {
    const port = await etsServer.start();
    expect(port).toBe(config.PORT_HTTP);
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
