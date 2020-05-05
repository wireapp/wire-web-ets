import {Module} from '@nestjs/common';
import {InstanceController, InstancesController, ClientsController, ServerController} from './InstanceController';
import {InstanceService} from './InstanceService';

@Module({
  controllers: [InstanceController, InstancesController, ClientsController, ServerController],
  exports: [InstanceService],
  providers: [InstanceService],
})
export class InstanceModule {}
