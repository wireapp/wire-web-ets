import {Module} from "@nestjs/common";
import {RootController} from "./RootController";

@Module({
  controllers: [RootController],
})
export class RootModule {
}
