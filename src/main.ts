import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import bodyParser from 'body-parser';
import {RootModule} from './RootModule';
import logdown from 'logdown';

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
