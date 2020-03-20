import {Module} from '@nestjs/common';
import {InstanceController} from './InstanceController';
import {InstanceService} from './InstanceService';

@Module({
  controllers: [InstanceController],
  exports: [InstanceService],
  providers: [InstanceService],
})
export class InstanceModule {}
