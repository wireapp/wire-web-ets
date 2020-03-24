import {Module} from '@nestjs/common';
import {InstanceModule} from './instance/InstanceModule';

@Module({
  imports: [InstanceModule],
})
export class RootModule {}
