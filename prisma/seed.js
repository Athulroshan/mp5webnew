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

  // 2. Create Products focused on Apparel: Caps, Round Neck, Polo, School Uniforms, Industrial Uniforms
  const productsData = [
    {
      name: "Classic Cotton Polo T-Shirt",
      description: "Comfortable cotton pique polo t-shirt with ribbed collar and button placket. Soft, durable fabric suitable for daily wear, office uniforms, and custom logo embroidery.",
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
        { url: "/images/products/polo/polo-white.png", alt: "White Polo T-Shirt" },
        { url: "/images/products/polo/polo-black.png", alt: "Black Polo T-Shirt" },
        { url: "/images/products/polo/polo-red.png", alt: "Red Polo T-Shirt" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "White", hex: "#FFFFFF", available: true, imageIndex: 0 },
        { name: "Black", hex: "#111111", available: true, imageIndex: 1 },
        { name: "Red", hex: "#C81D25", available: true, imageIndex: 2 }
      ]),
      sizes: JSON.stringify([
        { name: "S", available: true, stock: 20 },
        { name: "M", available: true, stock: 35 },
        { name: "L", available: true, stock: 35 }
      ]),
      specifications: JSON.stringify({ material: "100% Pique Cotton", care: "Machine Wash", origin: "India" })
    },
    {
      name: "Classic Cotton Round Neck T-Shirt",
      description: "Soft 100% cotton plain round neck t-shirt. Comfortable regular fit for everyday wear and custom printing.",
      price: 599,
      originalPrice: 1299,
      category: "Round Neck T-Shirts",
      subcategory: "Round Neck",
      brand: "MPSS Basics",
      sku: "RND-HVY-003",
      badge: "Pure Cotton",
      stock: 110,
      ratingsAverage: 0,
      ratingsCount: 0,
      isFeatured: true,
      images: JSON.stringify([
        { url: "/images/products/round-neck/round-neck-black.png", alt: "Black Round Neck T-Shirt" },
        { url: "/images/products/round-neck/round-neck-beige.png", alt: "Beige Round Neck T-Shirt" },
        { url: "/images/products/round-neck/round-neck-maroon.png", alt: "Maroon Round Neck T-Shirt" },
        { url: "/images/products/round-neck/round-neck-white.png", alt: "White Round Neck T-Shirt" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Black", hex: "#111111", available: true, imageIndex: 0 },
        { name: "Beige", hex: "#D4B996", available: true, imageIndex: 1 },
        { name: "Maroon", hex: "#6B1724", available: true, imageIndex: 2 },
        { name: "White", hex: "#FFFFFF", available: true, imageIndex: 3 }
      ]),
      sizes: JSON.stringify([
        { name: "S", available: true, stock: 30 },
        { name: "M", available: true, stock: 40 },
        { name: "L", available: true, stock: 40 }
      ]),
      specifications: JSON.stringify({ material: "100% Cotton", fit: "Regular Fit", origin: "Tirupur, India" })
    },
    {
      name: "Classic Adjustable Cap",
      description: "Comfortable plain cap with breathable mesh and curved visor. Easy back strap adjustment for all head sizes. Ideal for everyday wear and custom embroidery.",
      price: 399,
      originalPrice: 899,
      category: "Caps",
      subcategory: "Baseball Cap",
      brand: "MPSS Headwear",
      sku: "CAP-TWL-004",
      badge: "Adjustable",
      stock: 85,
      ratingsAverage: 0,
      ratingsCount: 0,
      isFeatured: true,
      images: JSON.stringify([
        { url: "/images/products/caps/cap-black-white.png", alt: "Black & White Mesh Cap" },
        { url: "/images/products/caps/cap-navy.png", alt: "Navy Blue Baseball Cap" },
        { url: "/images/products/caps/cap-green-white.png", alt: "Green & White Mesh Cap" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Black & White", hex: "#111111", available: true, imageIndex: 0 },
        { name: "Navy Blue", hex: "#1e3a8a", available: true, imageIndex: 1 },
        { name: "Green & White", hex: "#15803d", available: true, imageIndex: 2 }
      ]),
      sizes: JSON.stringify([
        { name: "Free Size", available: true, stock: 85 }
      ]),
      specifications: JSON.stringify({ material: "Cotton & Breathable Mesh", fit: "Adjustable Strap", origin: "Tirupur, India" })
    },
    {
      name: "Heavy-Duty Industrial Worker Uniform",
      description: "Tough industrial work uniform for factory, site, and maintenance workers. Durable fabric with reinforced stitching for safety, long wear, and all-day comfort.",
      price: 1199,
      originalPrice: 1999,
      category: "Industry & Worker Uniforms",
      subcategory: "Workwear & Coveralls",
      brand: "MPSS Workwear",
      sku: "IND-UNI-006",
      badge: "Heavy Duty",
      stock: 100,
      ratingsAverage: 0,
      ratingsCount: 0,
      isFeatured: true,
      images: JSON.stringify([
        { url: "/images/products/work-uniforms/industrial-coverall.png", alt: "Safety Boiler Suit Coverall with Reflective Tapes" },
        { url: "/images/products/work-uniforms/worker-shirt-pant-set.png", alt: "Industrial Worker Shirt and Trouser Set" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Safety Boiler Suit (Reflective)", hex: "#1e293b", available: true, imageIndex: 0 },
        { name: "Navy Work Shirt & Pant Set", hex: "#172554", available: true, imageIndex: 1 }
      ]),
      sizes: JSON.stringify([
        { name: "S", available: true, stock: 20 },
        { name: "M", available: true, stock: 25 },
        { name: "L", available: true, stock: 25 },
        { name: "XL", available: true, stock: 20 },
        { name: "XXL", available: true, stock: 10 }
      ]),
      specifications: JSON.stringify({ material: "Heavy-Duty Poly-Cotton Twill", fit: "Comfort Work Fit", type: "Industrial Workwear", origin: "Tirupur, India" })
    },
    {
      name: "School Uniform Set",
      description: "Comfortable and durable school uniform sets for boys and girls. Soft, wrinkle-resistant fabric made for daily school wear and sports activities.",
      price: 899,
      originalPrice: 1499,
      category: "School Uniforms",
      subcategory: "School Wear",
      brand: "MPSS Schoolwear",
      sku: "SCH-UNI-007",
      badge: "School Wear",
      stock: 250,
      ratingsAverage: 0,
      ratingsCount: 0,
      isFeatured: true,
      images: JSON.stringify([
        { url: "/images/products/school-uniforms/school-regular-set.jpg", alt: "Classroom Uniform Set - Shirt & Trousers / Salwar & Waistcoat" },
        { url: "/images/products/school-uniforms/school-sports-set.jpg", alt: "House Sports Uniform - Yellow Polo & Track Pants" }
      ]),
      videos: JSON.stringify([]),
      colors: JSON.stringify([
        { name: "Classroom Set (Sky Blue & Navy)", hex: "#38bdf8", available: true, imageIndex: 0 },
        { name: "Sports PT Set (Yellow & Navy)", hex: "#eab308", available: true, imageIndex: 1 }
      ]),
      sizes: JSON.stringify([
        { name: "Age 5-7 (Size 26-28)", available: true, stock: 60 },
        { name: "Age 8-10 (Size 30-32)", available: true, stock: 70 },
        { name: "Age 11-13 (Size 34-36)", available: true, stock: 60 },
        { name: "Age 14+ (Size 38-40)", available: true, stock: 60 }
      ]),
      specifications: JSON.stringify({ material: "Breathable Poly-Cotton", fit: "Comfortable Regular School Fit", type: "School Uniform", origin: "Tirupur, India" })
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
