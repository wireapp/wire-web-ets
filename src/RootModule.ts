import {Module} from '@nestjs/common';
import {InstanceModule} from './instance/InstanceModule';
import {RootController} from './RootController';

@Module({
  controllers: [RootController],
  imports: [InstanceModule],
})
export class RootModule {}
