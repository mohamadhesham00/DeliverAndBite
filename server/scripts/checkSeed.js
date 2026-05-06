(async ()=>{
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  try {
    const r = await p.restaurant.findMany({ take: 5 });
    const m = await p.menuItem.findMany({ take: 5 });
    const o = await p.order.findMany({ take: 5 });
    console.log('restaurants', r.length, 'menuItems', m.length, 'orders', o.length);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await p.$disconnect();
  }
})();
