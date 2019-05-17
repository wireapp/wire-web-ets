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

import * as express from 'express';

import {InstanceService} from '../../InstanceService';

import {assetRoutes} from './assetRoutes';
import {clientRoutes} from './clientRoutes';
import {confirmationRoutes} from './confirmationRoutes';
import {conversationRoutes} from './conversationRoutes';
import {mainRoutes} from './mainRoutes';
import {sessionRoutes} from './sessionRoutes';
import {typingRoutes} from './typingRoutes';
import {userRoutes} from './userRoutes';

export const routes = (instanceService: InstanceService): express.Router => {
  const router = express.Router();

  router.use(assetRoutes(instanceService));
  router.use(clientRoutes(instanceService));
  router.use(confirmationRoutes(instanceService));
  router.use(conversationRoutes(instanceService));
  router.use(mainRoutes(instanceService));
  router.use(sessionRoutes(instanceService));
  router.use(typingRoutes(instanceService));
  router.use(userRoutes(instanceService));

  return router;
};
