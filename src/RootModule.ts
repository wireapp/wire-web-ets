import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {CatsController} from './cats/cats.controller';
import {CatsModule} from './cats/cats.module';
import {RootController} from './RootController';

@Module({
  controllers: [RootController],
  imports: [CatsModule],
})
export class RootModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes(CatsController);
  }
}
