import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {ValidationPipe} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {RootModule} from './RootModule';
import bodyParser from 'body-parser';

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
  console.info(`Swagger UI running on "http://localhost:${port}/swagger-ui/"`);
}

bootstrap().catch(error => {
  console.error(`Server crashed: ${error.message}`, error);
});
