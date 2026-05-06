import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();

  const trattoria = await prisma.restaurant.create({
    data: {
      name: "Trattoria Alba",
      slug: "trattoria-alba",
      cuisine: "Italian",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      menuItems: {
        create: [
          {
            name: "Margherita Pizza",
            description: "San Marzano tomato, mozzarella, basil.",
            category: "Pizza",
            price: 14.5,
            imageUrl:
              "https://images.unsplash.com/photo-1513104890138-7c749659a591",
          },
          {
            name: "Pasta Carbonara",
            description: "Guanciale, pecorino, egg yolk, black pepper.",
            category: "Pasta",
            price: 16.25,
            imageUrl:
              "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9",
          },
          {
            name: "Tiramisu",
            description: "Mascarpone cream, espresso, cocoa.",
            category: "Dessert",
            price: 7.0,
            imageUrl:
              "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
          },
        ],
      },
    },
    include: { menuItems: true },
  });

  const wok = await prisma.restaurant.create({
    data: {
      name: "Wok Express",
      slug: "wok-express",
      cuisine: "Asian",
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
      menuItems: {
        create: [
          {
            name: "Chicken Teriyaki Bowl",
            description: "Rice, chicken, broccoli, teriyaki glaze.",
            category: "Bowls",
            price: 13.95,
            imageUrl:
              "https://images.unsplash.com/photo-1512058564366-18510be2db19",
          },
          {
            name: "Veggie Dumplings",
            description: "Steamed dumplings with soy dipping sauce.",
            category: "Starters",
            price: 8.5,
            imageUrl:
              "https://images.unsplash.com/photo-1544025162-d76694265947",
          },
          {
            name: "Mango Sticky Rice",
            description: "Sweet coconut rice with mango slices.",
            category: "Dessert",
            price: 6.75,
            imageUrl:
              "https://images.unsplash.com/photo-1488477181946-6428a0291777",
          },
        ],
      },
    },
    include: { menuItems: true },
  });

  await prisma.order.create({
    data: {
      userId: "demo-user",
      restaurantId: trattoria.id,
      status: "CONFIRMED",
      paymentStatus: "SUCCEEDED",
      subtotal: 28.75,
      deliveryFee: 2.99,
      total: 31.74,
      items: {
        create: [
          {
            menuItemId: trattoria.menuItems[0].id,
            quantity: 1,
            unitPrice: 14.5,
            lineTotal: 14.5,
          },
          {
            menuItemId: trattoria.menuItems[2].id,
            quantity: 2,
            unitPrice: 7.0,
            lineTotal: 14.0,
          },
        ],
      },
    },
  });

  await prisma.restaurant.updateMany({
    where: { id: wok.id },
    data: { isActive: true },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
