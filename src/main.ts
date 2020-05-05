/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
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

import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import bodyParser from 'body-parser';
import logdown from 'logdown';
import {RootModule} from './RootModule';

const logger = logdown('@wireapp/wire-web-ets/main', {
  logger: console,
  markdown: false,
});

const port = process.env.PORT || 21080;
const {name, version}: {name: string; version: string} = require('../package.json');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(RootModule);
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  // https://docs.nestjs.com/recipes/swagger
  const options = new DocumentBuilder().setTitle(String(name)).setVersion(String(version)).build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger-ui', app, document);

  app.use(bodyParser.json({limit: '101mb'}));
  app.use(bodyParser.urlencoded({extended: true, limit: '101mb'}));

  await app.listen(port);
  logger.info(`Swagger UI running on "http://localhost:${port}/swagger-ui/"`);
}

bootstrap().catch(error => {
  logger.error(`Server crashed: ${error.message}`, error);
});
