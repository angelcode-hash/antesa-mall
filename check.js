const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany({
    include: {
      user: true,
      _count: { select: { products: true } }
    }
  });

  console.log("Stores in DB:");
  stores.forEach(s => {
    console.log(`- ${s.name} (ID: ${s.id}) | User: ${s.user?.email || s.user?.name} | Products: ${s._count.products}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
