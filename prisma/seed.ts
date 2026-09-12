import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed...");

  // Clean existing data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const hashedAdminPassword = await bcrypt.hash("admin123", 12);
  const hashedUserPassword = await bcrypt.hash("user123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@mpss.com",
      password: hashedAdminPassword,
      role: "admin",
      phone: "+91 9876543210",
      emailVerified: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "user@mpss.com",
      password: hashedUserPassword,
      role: "user",
      phone: "+91 9123456789",
      emailVerified: true,
    },
  });

  console.log(`👤 Created Users: Admin (${admin.email}), Customer (${customer.email})`);

  // 2. Create Products with multiple images and video attachments
  const productsData = [
    {
      name: "Classic Embroidered Anarkali Kurta Set",
      description: "Premium silk blend handcrafted Anarkali kurta set with intricate Zari embroidery and Dupatta. Ideal for festive and wedding celebrations.",
      price: 1999,
      originalPrice: 4999,
      category: "Ethnic Wear",
      subcategory: "Kurta Sets",
      brand: "Sangria",
      sku: "ETH-ANK-001",
      badge: "60% OFF",
      stock: 45,
      ratingsAverage: 4.8,
      ratingsCount: 124,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800", alt: "Anarkali Front View" },
        { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800", alt: "Embroidery Detail" },
        { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800", alt: "Full Outfit Styling" }
      ]),
      videos: JSON.stringify([
        { url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-an-outfit-41549-large.mp4", title: "Runway Showcase", thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400" },
        { url: "https://assets.mixkit.co/videos/preview/mixkit-woman-turning-around-wearing-a-dress-41551-large.mp4", title: "360 Spin View", thumbnail: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400" }
      ]),
      colors: JSON.stringify([
        { name: "Royal Magenta", hex: "#8B0046", available: true },
        { name: "Emerald Green", hex: "#004B23", available: true }
      ]),
      sizes: JSON.stringify([
        { name: "S", available: true, stock: 10 },
        { name: "M", available: true, stock: 15 },
        { name: "L", available: true, stock: 20 }
      ]),
      specifications: JSON.stringify({ material: "Silk Blend", care: "Dry Clean Only", origin: "India" })
    },
    {
      name: "Men Slim Fit Printed Casual Shirt",
      description: "100% Breathable Cotton slim-fit printed casual shirt. Features classic spread collar and single patch pocket.",
      price: 699,
      originalPrice: 1799,
      category: "Western Wear",
      subcategory: "Casual Shirts",
      brand: "Roadster",
      sku: "WES-SHI-002",
      badge: "Flat 50% OFF",
      stock: 80,
      ratingsAverage: 4.5,
      ratingsCount: 89,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800", alt: "Casual Shirt Front" },
        { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800", alt: "Shirt Pattern Detail" }
      ]),
      videos: JSON.stringify([
        { url: "https://assets.mixkit.co/videos/preview/mixkit-young-man-wearing-casual-clothes-41553-large.mp4", title: "Casual Wear Styling", thumbnail: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400" }
      ]),
      colors: JSON.stringify([
        { name: "Olive Green", hex: "#556B2F", available: true },
        { name: "Navy Blue", hex: "#000080", available: true }
      ]),
      sizes: JSON.stringify([
        { name: "M", available: true, stock: 40 },
        { name: "L", available: true, stock: 40 }
      ]),
      specifications: JSON.stringify({ material: "100% Cotton", care: "Machine Wash", origin: "India" })
    },
    {
      name: "Pro Performance Athletic Running Shoes",
      description: "Lightweight mesh upper with cushioned responsive foam midsole for long-distance running and fitness workouts.",
      price: 1499,
      originalPrice: 3999,
      category: "Footwear",
      subcategory: "Sports Shoes",
      brand: "HRX",
      sku: "FTW-RUN-003",
      badge: "Best Seller",
      stock: 60,
      ratingsAverage: 4.7,
      ratingsCount: 210,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", alt: "Red Running Shoes" },
        { url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800", alt: "Shoe Sole Sole Tech" }
      ]),
      videos: JSON.stringify([
        { url: "https://assets.mixkit.co/videos/preview/mixkit-athlete-tying-running-shoes-41557-large.mp4", title: "Cushion & Impact Test", thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" }
      ]),
      colors: JSON.stringify([
        { name: "Crimson Red", hex: "#D32F2F", available: true },
        { name: "Stealth Black", hex: "#212121", available: true }
      ]),
      sizes: JSON.stringify([
        { name: "UK 7", available: true, stock: 20 },
        { name: "UK 8", available: true, stock: 20 },
        { name: "UK 9", available: true, stock: 20 }
      ]),
      specifications: JSON.stringify({ material: "Mesh & EVA", care: "Wipe with clean cloth", origin: "India" })
    },
    {
      name: "Luxury Rose Gold Analog Watch",
      description: "Stainless steel mesh strap chronograph analog watch with water resistance up to 30m. Scratch resistant glass.",
      price: 1299,
      originalPrice: 2999,
      category: "Accessories",
      subcategory: "Watches",
      brand: "DressBerry",
      sku: "ACC-WTC-004",
      badge: "Under ₹1499",
      stock: 35,
      ratingsAverage: 4.6,
      ratingsCount: 78,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800", alt: "Luxury Watch Dial" },
        { url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800", alt: "Wrist Close-up" }
      ]),
      videos: JSON.stringify([
        { url: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-wrist-watch-41560-large.mp4", title: "Watch Dial Movement", thumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400" }
      ]),
      colors: JSON.stringify([
        { name: "Rose Gold", hex: "#B76E79", available: true }
      ]),
      sizes: JSON.stringify([
        { name: "One Size", available: true, stock: 35 }
      ]),
      specifications: JSON.stringify({ material: "Stainless Steel", waterResistant: "30m", warranty: "1 Year" })
    },
    {
      name: "Women Floral Printed Wrap Midi Dress",
      description: "Flowy chiffon floral wrap midi dress with V-neckline and tie-up waist belt. Perfect for brunch dates and vacations.",
      price: 899,
      originalPrice: 2499,
      category: "Western Wear",
      subcategory: "Dresses",
      brand: "Tokyo Talkies",
      sku: "WES-DRS-005",
      badge: "Min 60% OFF",
      stock: 50,
      ratingsAverage: 4.4,
      ratingsCount: 95,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800", alt: "Floral Dress Front" },
        { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800", alt: "Outdoor Pose" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Pastel Yellow", hex: "#FFFDD0", available: true }
      ]),
      sizes: JSON.stringify([
        { name: "S", available: true, stock: 15 },
        { name: "M", available: true, stock: 20 }
      ]),
      specifications: JSON.stringify({ material: "Chiffon Polyester", care: "Hand Wash", origin: "India" })
    },
    {
      name: "Genuine Leather Multi-Slot Bi-Fold Wallet",
      description: "100% handcrafted genuine leather wallet with RFID blocking technology, 8 card slots, and dual currency compartments.",
      price: 499,
      originalPrice: 1299,
      category: "Accessories",
      subcategory: "Wallets",
      brand: "WildHorn",
      sku: "ACC-WAL-006",
      badge: "Under ₹499",
      stock: 100,
      ratingsAverage: 4.9,
      ratingsCount: 340,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800", alt: "Leather Wallet Open" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Tan Brown", hex: "#7B3F00", available: true },
        { name: "Classic Black", hex: "#000000", available: true }
      ]),
      sizes: JSON.stringify([
        { name: "Standard", available: true, stock: 100 }
      ]),
      specifications: JSON.stringify({ material: "Genuine Leather", rfid: "Yes", warranty: "6 Months" })
    },
    {
      name: "Kids Organic Cotton Graphic T-Shirt Set",
      description: "Pack of 3 ultra-soft 100% organic cotton graphic printed t-shirts for kids. Non-toxic dyes and skin friendly.",
      price: 599,
      originalPrice: 1499,
      category: "Kids Wear",
      subcategory: "T-Shirts",
      brand: "Max Kids",
      sku: "KID-TSH-007",
      badge: "Min 50% OFF",
      stock: 75,
      ratingsAverage: 4.7,
      ratingsCount: 52,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800", alt: "Kids T-Shirts Pack" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Multi-Pack", hex: "#FF8C00", available: true }
      ]),
      sizes: JSON.stringify([
        { name: "4-5Y", available: true, stock: 25 },
        { name: "6-7Y", available: true, stock: 25 }
      ]),
      specifications: JSON.stringify({ material: "100% Organic Cotton", care: "Machine Wash" })
    },
    {
      name: "Handwoven Boho Fringe Cushion Covers",
      description: "Set of 2 bohemian style hand-tufted cotton cushion covers with tassel detailing. Add warmth to your living room.",
      price: 399,
      originalPrice: 999,
      category: "Home & Living",
      subcategory: "Cushions",
      brand: "Home Centre",
      sku: "HOM-CSH-008",
      badge: "Under ₹399",
      stock: 90,
      ratingsAverage: 4.8,
      ratingsCount: 110,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800", alt: "Boho Cushion Covers" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Beige Cream", hex: "#F5F5DC", available: true }
      ]),
      sizes: JSON.stringify([
        { name: "16x16 inch", available: true, stock: 90 }
      ]),
      specifications: JSON.stringify({ material: "100% Cotton", dimensions: "40x40 cm" })
    }
  ];

  for (const item of productsData) {
    await prisma.product.create({ data: item });
  }

  console.log(`🛍️ Created ${productsData.length} Products with images & videos.`);

  // 3. Create Sample Orders for Analytics
  const createdProducts = await prisma.product.findMany();
  const prod1 = createdProducts[0];
  const prod2 = createdProducts[1];

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-8801",
      userId: customer.id,
      status: "delivered",
      paymentStatus: "paid",
      paymentMethod: "credit_card",
      subtotal: 2698,
      tax: 200,
      shipping: 0,
      total: 2898,
      shippingAddress: JSON.stringify({ street: "123 MG Road", city: "Bengaluru", state: "Karnataka", zipCode: "560001" }),
      deliveredAt: new Date(),
      items: {
        create: [
          { productId: prod1.id, quantity: 1, price: prod1.price, size: "M", color: "Royal Magenta" },
          { productId: prod2.id, quantity: 1, price: prod2.price, size: "L", color: "Navy Blue" }
        ]
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-8802",
      userId: customer.id,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "cash_on_delivery",
      subtotal: 1499,
      tax: 100,
      shipping: 50,
      total: 1649,
      shippingAddress: JSON.stringify({ street: "45 Park Street", city: "Kolkata", state: "West Bengal", zipCode: "700016" }),
      items: {
        create: [
          { productId: createdProducts[2].id, quantity: 1, price: createdProducts[2].price, size: "UK 8", color: "Crimson Red" }
        ]
      }
    }
  });

  console.log(`📦 Created Sample Orders (${order1.orderNumber}, ${order2.orderNumber}) for Analytics.`);
  console.log("✅ Database Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
