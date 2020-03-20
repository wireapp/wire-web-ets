import { Module } from "@nestjs/common";
import {InstanceController} from "./InstanceController";
import {InstanceService} from "./InstanceService";

@Module({
  controllers: [InstanceController],
  providers: [InstanceService],
  exports: [InstanceService]
})
export class InstanceModule {}
