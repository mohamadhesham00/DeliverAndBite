import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
      },
    });
  }

  async placeOrder(userId: string, dto: CreateOrderDto) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: dto.restaurantId, isActive: true },
      include: { menuItems: true },
    });

    if (!restaurant) {
      throw new NotFoundException("Restaurant not found");
    }

    const selectedItems = dto.items.map((item) => {
      const menuItem = restaurant.menuItems.find(
        (entry: { id: string }) => entry.id === item.menuItemId,
      );
      if (!menuItem) {
        throw new BadRequestException(
          `Menu item ${item.menuItemId} is not available`,
        );
      }

      const unitPrice = Number(menuItem.price);
      const lineTotal = unitPrice * item.quantity;
      return {
        menuItemId: menuItem.id,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );
    const deliveryFee = subtotal >= 30 ? 0 : 2.99;
    const total = subtotal + deliveryFee;

    return this.prisma.order.create({
      data: {
        userId,
        restaurantId: restaurant.id,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.SUCCEEDED,
        subtotal,
        deliveryFee,
        total,
        notes: dto.notes,
        items: {
          create: selectedItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true, restaurant: true },
    });
  }

  async getOrderStatus(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: { include: { menuItem: true } }, restaurant: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }
}
