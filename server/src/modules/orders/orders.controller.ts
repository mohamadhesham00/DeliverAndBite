import { Controller, Get, Param, Post, Body, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  placeOrder(
    @CurrentUser() currentUser: { sub?: string } | null,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.placeOrder(currentUser?.sub ?? "anonymous", dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  listOrders(@CurrentUser() currentUser: { sub?: string } | null) {
    return this.ordersService.listOrders(currentUser?.sub ?? "anonymous");
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(":id")
  getOrderStatus(
    @CurrentUser() currentUser: { sub?: string } | null,
    @Param("id") id: string,
  ) {
    return this.ordersService.getOrderStatus(
      currentUser?.sub ?? "anonymous",
      id,
    );
  }
}
