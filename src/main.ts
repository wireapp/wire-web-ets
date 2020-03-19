import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {RootModule} from './RootModule';
import {ValidationPipe} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

const port = process.env.PORT || 3000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(RootModule);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    })
  );

  // https://docs.nestjs.com/recipes/swagger
  const options = new DocumentBuilder()
    .setTitle(String(process.env.npm_package_name))
    .setVersion(String(process.env.npm_package_version))
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('documentation', app, document);

  const host = '127.0.0.1';
  await app.listen(port, host, () => {
    console.info(`Server running on "http://${host}:${port}".`);
  });
}

bootstrap().catch(error => {
  console.error(`Server crashed: ${error.message}`, error);
});
