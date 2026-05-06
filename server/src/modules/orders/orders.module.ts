import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { CurrentUserMiddleware } from "../../common/middleware/current-user.middleware";

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, CurrentUserMiddleware],
})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(OrdersController);
  }
}
