const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dummyEmails = ['seller1@example.com', 'seller2@example.com', 'seller3@example.com'];
  
  const dummyUsers = await prisma.user.findMany({
    where: { email: { in: dummyEmails } }
  });

  const dummyUserIds = dummyUsers.map(u => u.id);

  console.log(`Found ${dummyUserIds.length} dummy users.`);

  // Delete dummy stores (cascades to products)
  const deletedStores = await prisma.store.deleteMany({
    where: { userId: { in: dummyUserIds } }
  });

  console.log(`Deleted ${deletedStores.count} dummy stores (and their products via cascade).`);

  // Optionally delete the dummy users as well
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: dummyUserIds } }
  });

  console.log(`Deleted ${deletedUsers.count} dummy users.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
