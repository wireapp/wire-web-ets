import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {ValidationPipe} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {RootModule} from './RootModule';

const port = process.env.PORT || 3000;

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
  const options = new DocumentBuilder()
    .setTitle(String(process.env.npm_package_name))
    .setVersion(String(process.env.npm_package_version))
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('documentation', app, document);

  await app.listen(port);
  console.info(`Swagger UI running on "http://localhost:${port}/documentation/"`);
}

bootstrap().catch(error => {
  console.error(`Server crashed: ${error.message}`, error);
});
