const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

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

  // 2. Create Products focused on Apparel: Sportswear, Caps, Round Neck, Polo, Normal T-Shirts
  const productsData = [
    {
      name: "Pro Dry-Fit Athletic Sportswear Set",
      description: "Moisture-wicking breathable dry-fit performance sportswear set including athletic compression t-shirt and track pants. Engineered for intense gym workouts and outdoor sports.",
      price: 1299,
      originalPrice: 2999,
      category: "Sportswear",
      subcategory: "Tracksuit",
      brand: "MPSS Athletics",
      sku: "SPT-DRY-001",
      badge: "Best Seller",
      stock: 65,
      ratingsAverage: 4.9,
      ratingsCount: 184,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800", alt: "Black Gym Sportswear" },
        { url: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=800", alt: "Red Performance Tracksuit" },
        { url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800", alt: "Blue Athletic Fit" }
      ]),
      videos: JSON.stringify([
        { url: "https://assets.mixkit.co/videos/preview/mixkit-athlete-tying-running-shoes-41557-large.mp4", title: "Flex & Stretch Test", thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400" }
      ]),
      colors: JSON.stringify([
        { name: "Stealth Black", hex: "#18181b", available: true, imageIndex: 0 },
        { name: "Crimson Red", hex: "#dc2626", available: true, imageIndex: 1 },
        { name: "Royal Blue", hex: "#2563eb", available: true, imageIndex: 2 }
      ]),
      sizes: JSON.stringify([
        { name: "S", available: true, stock: 15 },
        { name: "M", available: true, stock: 25 },
        { name: "L", available: true, stock: 25 }
      ]),
      specifications: JSON.stringify({ material: "Polyester Spandex Blend", care: "Machine Wash Cold", origin: "India" })
    },
    {
      name: "Classic Pique Cotton Polo T-Shirt",
      description: "100% Combed Pique Cotton polo t-shirt with ribbed collar, 2-button placket, and side slits. Smart casual staple for work or weekend outings.",
      price: 799,
      originalPrice: 1799,
      category: "Polo T-Shirts",
      subcategory: "Polo",
      brand: "MPSS Apparel",
      sku: "POL-PIQ-002",
      badge: "Popular",
      stock: 90,
      ratingsAverage: 4.7,
      ratingsCount: 142,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1625910513413-fe01f114c000?w=800", alt: "Navy Polo T-Shirt" },
        { url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800", alt: "White Polo T-Shirt" },
        { url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800", alt: "Black Polo T-Shirt" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Navy Blue", hex: "#1e3a8a", available: true, imageIndex: 0 },
        { name: "Crisp White", hex: "#f8fafc", available: true, imageIndex: 1 },
        { name: "Charcoal Black", hex: "#0f172a", available: true, imageIndex: 2 }
      ]),
      sizes: JSON.stringify([
        { name: "S", available: true, stock: 20 },
        { name: "M", available: true, stock: 35 },
        { name: "L", available: true, stock: 35 }
      ]),
      specifications: JSON.stringify({ material: "100% Pique Cotton", care: "Machine Wash", origin: "India" })
    },
    {
      name: "Premium Heavyweight Cotton Round Neck T-Shirt",
      description: "240 GSM bio-washed 100% organic cotton round neck t-shirt. Features reinforced crew neck collar and drop shoulder relaxed fit.",
      price: 599,
      originalPrice: 1299,
      category: "Round Neck T-Shirts",
      subcategory: "Round Neck",
      brand: "MPSS Basics",
      sku: "RND-HVY-003",
      badge: "Trending",
      stock: 110,
      ratingsAverage: 4.8,
      ratingsCount: 230,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", alt: "White Crew Neck T-Shirt" },
        { url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800", alt: "Grey Round Neck T-Shirt" },
        { url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800", alt: "Black Round Neck T-Shirt" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Pure White", hex: "#ffffff", available: true, imageIndex: 0 },
        { name: "Heather Grey", hex: "#94a3b8", available: true, imageIndex: 1 },
        { name: "Jet Black", hex: "#000000", available: true, imageIndex: 2 }
      ]),
      sizes: JSON.stringify([
        { name: "S", available: true, stock: 30 },
        { name: "M", available: true, stock: 40 },
        { name: "L", available: true, stock: 40 }
      ]),
      specifications: JSON.stringify({ material: "100% Bio-Washed Cotton", GSM: 240, origin: "India" })
    },
    {
      name: "Classic Embroidered Adjustable Sport Cap",
      description: "6-panel cotton twill cap with embroidered logo, pre-curved visor, and adjustable brass buckle closure. Breathable eyelets for ventilation.",
      price: 399,
      originalPrice: 899,
      category: "Caps",
      subcategory: "Baseball Cap",
      brand: "MPSS Headwear",
      sku: "CAP-TWL-004",
      badge: "Under ₹399",
      stock: 85,
      ratingsAverage: 4.6,
      ratingsCount: 96,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800", alt: "Black Embroidered Cap" },
        { url: "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800", alt: "Navy Blue Sport Cap" },
        { url: "https://images.unsplash.com/photo-1521369984125-a4de2c6be3a0?w=800", alt: "White Minimalist Cap" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Pitch Black", hex: "#18181b", available: true, imageIndex: 0 },
        { name: "Deep Navy", hex: "#172554", available: true, imageIndex: 1 },
        { name: "White Snow", hex: "#f8fafc", available: true, imageIndex: 2 }
      ]),
      sizes: JSON.stringify([
        { name: "Free Size", available: true, stock: 85 }
      ]),
      specifications: JSON.stringify({ material: "100% Cotton Twill", closure: "Adjustable Strap", origin: "India" })
    },
    {
      name: "Everyday Essential Normal T-Shirt",
      description: "Super soft 180 GSM combed cotton regular fit normal t-shirt. Lightweight, breathable, and pre-shrunk for maximum everyday comfort.",
      price: 499,
      originalPrice: 999,
      category: "Normal T-Shirts",
      subcategory: "Casual T-Shirt",
      brand: "MPSS Everyday",
      sku: "NOR-TSH-005",
      badge: "Essential",
      stock: 120,
      ratingsAverage: 4.7,
      ratingsCount: 310,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800", alt: "White Normal T-Shirt" },
        { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800", alt: "Black Normal T-Shirt" },
        { url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800", alt: "Olive Green Normal T-Shirt" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Clean White", hex: "#ffffff", available: true, imageIndex: 0 },
        { name: "Classic Black", hex: "#000000", available: true, imageIndex: 1 },
        { name: "Olive Green", hex: "#3f6212", available: true, imageIndex: 2 }
      ]),
      sizes: JSON.stringify([
        { name: "S", available: true, stock: 30 },
        { name: "M", available: true, stock: 45 },
        { name: "L", available: true, stock: 45 }
      ]),
      specifications: JSON.stringify({ material: "100% Cotton", GSM: 180, origin: "India" })
    },
    {
      name: "Fleece Heavyweight Pullover Hoodie",
      description: "320 GSM brushed fleece lined pullover hoodie with kangaroo pouch pocket, double-lined hood, and matching drawstrings.",
      price: 1199,
      originalPrice: 2499,
      category: "Hoodies",
      subcategory: "Pullover Hoodie",
      brand: "MPSS Winter",
      sku: "HD-FLC-006",
      badge: "Cozy Warmth",
      stock: 50,
      ratingsAverage: 4.9,
      ratingsCount: 77,
      isFeatured: true,
      images: JSON.stringify([
        { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800", alt: "Black Pullover Hoodie" },
        { url: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800", alt: "Grey Fleece Hoodie" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Obsidian Black", hex: "#0f172a", available: true, imageIndex: 0 },
        { name: "Melange Grey", hex: "#64748b", available: true, imageIndex: 1 }
      ]),
      sizes: JSON.stringify([
        { name: "M", available: true, stock: 25 },
        { name: "L", available: true, stock: 25 }
      ]),
      specifications: JSON.stringify({ material: "Cotton Fleece", GSM: 320, origin: "India" })
    }
  ];

  for (const item of productsData) {
    await prisma.product.create({ data: item });
  }

  console.log(`🛍️ Created ${productsData.length} Apparel Products with color photo mappings.`);

  // 3. Create Reviews for Products
  const createdProducts = await prisma.product.findMany();
  const prod1 = createdProducts[0];

  await prisma.review.create({
    data: {
      productId: prod1.id,
      userId: customer.id,
      rating: 5,
      comment: "The dry-fit fabric quality is top notch. Wore it during high-intensity workout and running, very comfortable and light!",
    }
  });

  // 4. Create Sample Orders with Real-time Delivery Status Tracking Steps
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-9001",
      userId: customer.id,
      status: "in_transit",
      paymentStatus: "paid",
      paymentMethod: "razorpay_test",
      subtotal: 2098,
      tax: 200,
      shipping: 0,
      total: 2298,
      shippingAddress: JSON.stringify({ name: "Rahul Sharma", street: "123 MG Road", city: "Bengaluru", state: "Karnataka", zipCode: "560001", phone: "+91 9123456789" }),
      items: {
        create: [
          { productId: prod1.id, quantity: 1, price: prod1.price, size: "M", color: "Stealth Black" },
          { productId: createdProducts[1].id, quantity: 1, price: createdProducts[1].price, size: "L", color: "Navy Blue" }
        ]
      }
    }
  });

  console.log(`📦 Created Sample Orders (${order1.orderNumber}) for Tracking & Analytics.`);
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
