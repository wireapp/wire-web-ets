import {Module} from "@nestjs/common";
import {RootController} from "./RootController";
import {InstanceModule} from "./instance/InstanceModule";

@Module({
  controllers: [RootController],
  imports: [
    InstanceModule
  ],
})
export class RootModule {
}
