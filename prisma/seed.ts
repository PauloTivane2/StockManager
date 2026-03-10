import { PrismaClient, MovementType, OrderType, OrderStatus, ProductStatus, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Clean previous data (in specific order to avoid FK errors)
  console.log('🧹 Cleaning existing data...')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.warehouse.deleteMany()

  // 2. Create Admin User
  // You might want to use argon2 or similar instead of bcryptjs in production, this is a placeholder
  // using bcryptjs implementation (make sure to `bun add -d bcryptjs @types/bcryptjs` if using this pattern)
  // For simplicity here, we'll store a plain password if bcryptjs is not installed, but you should install it.
  
  // Note: For real world use a better hash. As we don't have bcryptjs installed yet,
  // we'll install it later or you can replace it with a dummy string for now.
  let adminPassword = 'admin' 
  try {
    const bcrypt = require('bcryptjs')
    adminPassword = bcrypt.hashSync('admin123', 10)
  } catch(e) {
     console.log(' bcryptjs not found, storing plain password for seed (NOT FOR PRODUCTION)')
  }

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Manager',
      email: 'admin@stockmanager.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })
  console.log(`✅ Created Admin User: ${admin.email}`)

  // 3. Create Categories
  const categoriesData = [
    { name: 'Electrónicos', slug: 'electronicos', description: 'Dispositivos eletrônicos e gadgets' },
    { name: 'Roupas', slug: 'roupas', description: 'Vestuário e acessórios' },
    { name: 'Alimentos', slug: 'alimentos', description: 'Produtos alimentícios não-perecíveis' },
    { name: 'Ferramentas', slug: 'ferramentas', description: 'Ferramentas manuais e elétricas' },
    { name: 'Informática', slug: 'informatica', description: 'Componentes e periféricos de TI' }
  ]
  const categories = await Promise.all(
    categoriesData.map(data => prisma.category.create({ data }))
  )
  console.log(`✅ Created ${categories.length} Categories`)

  // 4. Create Suppliers
  const suppliersData = [
    { name: 'TechDistrib Lda', email: 'contato@techdistrib.com', phone: '+258840000001', address: 'Av 24 de Julho' },
    { name: 'MegaRoupas SA', email: 'vendas@megaroupas.com', phone: '+258850000002', address: 'Baixa de Maputo' },
    { name: 'ConstruTudo', email: 'info@construtudo.co.mz', phone: '+258860000003', address: 'Matola' }
  ]
  const suppliers = await Promise.all(
    suppliersData.map(data => prisma.supplier.create({ data }))
  )
  console.log(`✅ Created ${suppliers.length} Suppliers`)

  // 5. Create Warehouse
  const warehouse = await prisma.warehouse.create({
    data: {
      name: 'Armazém Central',
      location: 'Matola Gare',
      description: 'Principal centro de distribuição'
    }
  })
  console.log(`✅ Created Warehouse`)

  // 6. Create Products
  const productsData = [
    {
      name: 'Laptop X1 Carbon',
      sku: 'LPT-X1-001',
      price: 95000,
      costPrice: 75000,
      quantity: 50,
      minStock: 10,
      status: ProductStatus.ACTIVE,
      categoryId: categories.find(c => c.slug === 'informatica')!.id,
      supplierId: suppliers[0].id
    },
    {
      name: 'iPhone 15 Pro',
      sku: 'IPH-15P-002',
      price: 85000,
      costPrice: 70000,
      quantity: 30,
      minStock: 5,
      status: ProductStatus.ACTIVE,
      categoryId: categories.find(c => c.slug === 'electronicos')!.id,
      supplierId: suppliers[0].id
    },
    {
      name: 'Camisa Polo Básica',
      sku: 'CLO-POL-003',
      price: 1500,
      costPrice: 800,
      quantity: 200,
      minStock: 50,
      status: ProductStatus.ACTIVE,
      categoryId: categories.find(c => c.slug === 'roupas')!.id,
      supplierId: suppliers[1].id
    },
    {
      name: 'Martelo Demolidor Makita',
      sku: 'TOL-MAK-004',
      price: 25000,
      costPrice: 18000,
      quantity: 15,
      minStock: 3,
      status: ProductStatus.ACTIVE,
      categoryId: categories.find(c => c.slug === 'ferramentas')!.id,
      supplierId: suppliers[2].id
    },
    {
      name: 'Monitor Dell 27"',
      sku: 'LPT-MON-005',
      price: 18000,
      costPrice: 12000,
      quantity: 8, // Low stock on purpose
      minStock: 10,
      status: ProductStatus.ACTIVE,
      categoryId: categories.find(c => c.slug === 'informatica')!.id,
      supplierId: suppliers[0].id
    }
  ]
  
  const products = await Promise.all(
    productsData.map(data => prisma.product.create({ data }))
  )
  console.log(`✅ Created ${products.length} Products`)

  // 7. Create Initial Stock Movements (Entries)
  for (const product of products) {
    await prisma.stockMovement.create({
      data: {
        type: MovementType.ENTRY,
        quantity: product.quantity,
        previousQuantity: 0,
        newQuantity: product.quantity,
        reason: 'Inventário Inicial',
        productId: product.id,
        userId: admin.id
      }
    })
  }
  console.log(`✅ Created initial Stock Movements`)

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
