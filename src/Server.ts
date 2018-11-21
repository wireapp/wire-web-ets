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

import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as helmet from 'helmet';
import * as http from 'http';

import {ServerConfig} from './config';
import InstanceService from './InstanceService';
import healthCheckRoute from './routes/_health/healthCheckRoute';
import {initSwaggerRoute} from './routes/api-docs/swaggerRoute';
import {internalErrorRoute, notFoundRoute} from './routes/error/errorRoutes';
import InstanceRoutes from './routes/instance/';
import logRoute from './routes/log/logRoute';
import mainRoute from './routes/mainRoute';

class Server {
  private app: express.Express;
  private server?: http.Server;
  private instanceService: InstanceService;

  constructor(private config: ServerConfig) {
    this.app = express();
    this.instanceService = new InstanceService();
    this.init();
  }

  init() {
    // The order is important here, please don't sort!
    this.app.use((req, res, next) => {
      bodyParser.json({limit: '200mb'})(req, res, error => {
        if (error) {
          return res.status(400).json({error: 'Payload is not valid JSON data.'});
        }
        return next();
      });
    });
    this.initSecurityHeaders();
    this.app.use(
      compression({
        level: this.config.COMPRESS_LEVEL,
        threshold: this.config.COMPRESS_MIN_SIZE,
      })
    );
    this.initAPIRoutes();
    this.app.use(logRoute());
    this.app.use(healthCheckRoute());
    this.app.use(mainRoute(this.config));
    initSwaggerRoute(this.app);
    this.app.use(notFoundRoute());
    this.app.use(internalErrorRoute());
  }

  initAPIRoutes() {
    this.app.use(InstanceRoutes(this.instanceService));
  }

  initCaching() {
    if (this.config.DEVELOPMENT) {
      this.app.use(helmet.noCache());
    } else {
      this.app.use((req, res, next) => {
        const milliSeconds = 1000;
        res.header('Cache-Control', `public, max-age=${this.config.CACHE_DURATION_SECONDS}`);
        res.header('Expires', new Date(Date.now() + this.config.CACHE_DURATION_SECONDS * milliSeconds).toUTCString());
        next();
      });
    }
  }

  initForceSSL() {
    const STATUS_CODE_MOVED = 301;

    const SSLMiddleware: express.RequestHandler = (req, res, next) => {
      // Redirect to HTTPS
      if (!req.secure || req.get('X-Forwarded-Proto') !== 'https') {
        if (this.config.DEVELOPMENT || req.url.match(/_health\/?/)) {
          return next();
        }
        return res.redirect(STATUS_CODE_MOVED, `https://${req.headers.host}${req.url}`);
      }
      next();
    };

    this.app.enable('trust proxy');
    this.app.use(SSLMiddleware);
  }

  initSecurityHeaders() {
    this.app.disable('x-powered-by');
    this.app.use(
      helmet({
        frameguard: {action: 'deny'},
      })
    );
    this.app.use(helmet.noSniff());
    this.app.use(helmet.xssFilter());
  }

  start(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        reject('Server is already running.');
      } else if (this.config.PORT_HTTP) {
        this.server = this.app.listen(this.config.PORT_HTTP, () => resolve(this.config.PORT_HTTP));
      } else {
        reject('Server port not specified.');
      }
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
      this.server = undefined;
    } else {
      throw new Error('Server is not running.');
    }
  }
}

export default Server;
