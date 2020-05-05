import {Module} from '@nestjs/common';
import {InstanceController, InstancesController} from './InstanceController';
import {InstanceService} from './InstanceService';

@Module({
  controllers: [InstanceController, InstancesController],
  exports: [InstanceService],
  providers: [InstanceService],
})
export class InstanceModule {}
