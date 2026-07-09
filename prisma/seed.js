const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding database for Marketplace...');
  
  // Create 3 dummy users who will act as sellers
  const sellers = [];
  for (let i = 1; i <= 3; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const seller = await prisma.user.create({
      data: {
        name: `Seller ${i}`,
        email: `seller${i}@example.com`,
        password: hashedPassword,
        phone: `0812345678${i}`,
      }
    });
    sellers.push(seller);
    console.log(`Created Seller ${i}`);
  }

  // Create 3 Stores for these users
  const stores = [];
  const storeNames = ['Toko Elektronik Maju', 'Fashion Hitz', 'Gudang Gadget'];
  for (let i = 0; i < 3; i++) {
    const store = await prisma.store.create({
      data: {
        userId: sellers[i].id,
        name: storeNames[i],
        slug: storeNames[i].toLowerCase().replace(/ /g, '-'),
        description: `Selamat datang di ${storeNames[i]}. Kami menyediakan produk berkualitas terbaik untuk Anda.`,
      }
    });
    stores.push(store);
    console.log(`Created Store: ${storeNames[i]}`);
  }

  // Generate 50 products and assign them to stores
  const imageMap = {
    'Tas Ransel': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    'Smartwatch': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    'Sepatu Sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    'Kemeja Flannel': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    'Speaker Bluetooth': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    'Powerbank': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
    'Botol Minum Thermos': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    'Koper Kabin': 'https://images.unsplash.com/photo-1565026057447-bc90a3dce841?auto=format&fit=crop&w=800&q=80',
    'Headphone Wireless': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
    'Kacamata Hitam': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
  };

  const categories = Object.keys(imageMap);
  const specs = ['Pro', 'Ultra', 'Max', 'Premium', 'Classic', 'Lite', 'Edition', 'Sport', 'Vintage', 'Modern'];

  for (let i = 1; i <= 50; i++) {
    const category = categories[i % categories.length];
    const spec = specs[i % specs.length];
    const price = 50000 + ((i * 12345) % 1950000); 
    const store = stores[i % stores.length]; // Distribute evenly among 3 stores

    await prisma.product.create({
      data: {
        storeId: store.id,
        name: `${category} ${spec} Series ${i}`,
        description: `Ini adalah deskripsi eksklusif untuk produk ${category} ${spec} Series ${i}. Dibuat menggunakan material pilihan berkualitas tinggi. Dijual resmi oleh ${store.name}.`,
        price: price,
        imageUrl: imageMap[category],
      }
    });
  }

  console.log('Seeded 50 marketplace products!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
