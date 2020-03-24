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

import {isCelebrate} from 'celebrate';
import * as express from 'express';
import * as HTTP_STATUS_CODE from 'http-status-codes';
import logdown from 'logdown';

import {ErrorMessage, ServerErrorMessage} from '../../config';
import {formatDate} from '../../utils';

const router = express.Router();

const logger = logdown('@wireapp/wire-web-ets/errorRoutes', {
  logger: console,
  markdown: false,
});

export function celebrateErrorRoute(): express.ErrorRequestHandler {
  return (err, req, res, next) => {
    if (isCelebrate(err)) {
      const message = err.joi ? err.joi.message : err.message;
      const errorMessage: ErrorMessage = {
        code: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
        error: `Validation error: ${message}`,
      };
      return res.status(errorMessage.code).json(errorMessage);
    }
    return next();
  };
}

export function internalErrorRoute(): express.ErrorRequestHandler {
  return (error, req, res, next) => {
    logger.error(`[${formatDate()}] ${error.stack}`);
    const errorMessage: ServerErrorMessage = {
      code: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      error: 'Internal server error',
      stack: error.stack,
    };
    return res.status(errorMessage.code).json(error);
  };
}

export function notFoundRoute(): express.Router {
  return router.get('*', (req, res) => {
    const errorMessage: ErrorMessage = {
      code: HTTP_STATUS_CODE.NOT_FOUND,
      error: 'Not found',
    };
    return res.status(errorMessage.code).json(errorMessage);
  });
}
