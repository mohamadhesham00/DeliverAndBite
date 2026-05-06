import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class MenuItemsService {
  constructor(private readonly prisma: PrismaService) {}

  listMenuItems() {
    return this.prisma.restaurant.findMany({
      where: { isActive: true },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: [{ category: "asc" }, { name: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });
  }
}
