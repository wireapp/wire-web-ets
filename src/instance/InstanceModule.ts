import {Module} from '@nestjs/common';
import {InstanceController, InstancesController, ClientsController} from './InstanceController';
import {InstanceService} from './InstanceService';

@Module({
  controllers: [InstanceController, InstancesController, ClientsController],
  exports: [InstanceService],
  providers: [InstanceService],
})
export class InstanceModule {}
