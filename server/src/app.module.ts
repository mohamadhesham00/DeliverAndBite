import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MenuItemsModule } from "./modules/menu-items/menu-items.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MenuItemsModule,
    OrdersModule,
  ],
})
export class AppModule {}
