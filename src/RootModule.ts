import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {CatsModule} from './cats/cats.module';
import {InstanceModule} from './instance/InstanceModule';
import {RootController} from './RootController';
import {InstanceController} from './instance/InstanceController';

@Module({
  controllers: [RootController],
  imports: [CatsModule, InstanceModule],
})
export class RootModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes(InstanceController);
  }
}
