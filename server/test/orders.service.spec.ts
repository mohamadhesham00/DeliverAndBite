import { BadRequestException, NotFoundException } from "@nestjs/common";
import { OrdersService } from "../src/modules/orders/orders.service";

describe("OrdersService", () => {
  it("is available for unit tests", () => {
    expect(OrdersService).toBeDefined();
    expect(BadRequestException).toBeDefined();
    expect(NotFoundException).toBeDefined();
  });
});
