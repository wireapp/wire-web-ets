import {Module, NestModule, MiddlewareConsumer} from '@nestjs/common';
import {RootController} from './RootController';
import {CatsModule} from './cats/cats.module';
import {CatsController} from './cats/cats.controller';

@Module({
  controllers: [RootController],
  imports: [CatsModule],
})
export class RootModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes(CatsController);
  }
}
