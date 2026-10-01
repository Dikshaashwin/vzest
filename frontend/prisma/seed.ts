import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@zestchocolates.example" },
    update: {},
    create: {
      email: "admin@zestchocolates.example",
      name: "Zest Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  const darkChoc = await prisma.category.upsert({
    where: { slug: "dark-chocolate" },
    update: {},
    create: { name: "Dark Chocolate", slug: "dark-chocolate" },
  });

  const truffles = await prisma.category.upsert({
    where: { slug: "truffles" },
    update: {},
    create: { name: "Truffles", slug: "truffles" },
  });

  const singleOrigin = await prisma.collection.upsert({
    where: { slug: "single-origin" },
    update: {},
    create: { name: "Single Origin", slug: "single-origin", isFeatured: true },
  });

  const infusions = await prisma.collection.upsert({
    where: { slug: "infusions-citrus" },
    update: {},
    create: { name: "Infusions & Citrus", slug: "infusions-citrus", isFeatured: true },
  });

  const atelierTruffles = await prisma.collection.upsert({
    where: { slug: "atelier-truffles" },
    update: {},
    create: { name: "The Atelier Truffles", slug: "atelier-truffles", isFeatured: true },
  });

  const giftBoxes = await prisma.collection.upsert({
    where: { slug: "gift-boxes" },
    update: {},
    create: { name: "Gift Boxes", slug: "gift-boxes", isFeatured: false },
  });

  const products = [
    {
      slug: "madagascar-72-blood-orange",
      name: "Madagascar 72% with Candied Blood Orange",
      shortDescription: "Single-origin, 72% cocoa with candied citrus",
      description: "A vibrant contrast of high-strength Sambirano cocoa and organic candied blood orange peel. Hand-tempered and custom packaged in our stone mill atelier.",
      categoryId: darkChoc.id,
      cocoaPercent: 72,
      ingredients: "Cocoa mass, sugar, cocoa butter, candied blood orange peel",
      allergens: "May contain traces of nuts and milk",
      shelfLife: "6 months",
      storageInfo: "Store in a cool, dry place",
      isFeatured: true,
      isBestseller: true,
      image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60",
      variants: [
        { sku: "Z-MD72-50", label: "50g", weightGrams: 50, price: 14, comparePrice: 16, stock: 40 },
        { sku: "Z-MD72-100", label: "100g", weightGrams: 100, price: 24, stock: 25 },
      ],
      collections: [singleOrigin.id, atelierTruffles.id],
    },
    {
      slug: "ecuador-85-single-farm-criollo",
      name: "Ecuador 85% Single-Farm Criollo",
      shortDescription: "Intense single-farm Criollo, 85% cocoa",
      description: "A bold, single-origin dark chocolate bar sourced from a heritage Criollo estate.",
      categoryId: darkChoc.id,
      cocoaPercent: 85,
      ingredients: "Cocoa mass, sugar, cocoa butter",
      shelfLife: "6 months",
      isFeatured: true,
      isBestseller: true,
      image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52",
      variants: [{ sku: "Z-EC85-100", label: "100g", weightGrams: 100, price: 16, stock: 94 }],
      collections: [singleOrigin.id],
    },
    {
      slug: "velvet-lavender-thyme-infusion",
      name: "Velvet Lavender & Thyme Infusion",
      shortDescription: "75% dark chocolate infused with botanical herbs",
      description: "Our signature dark block paired with organic lavender and thyme botanicals.",
      categoryId: darkChoc.id,
      cocoaPercent: 75,
      shelfLife: "6 months",
      image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9",
      variants: [{ sku: "Z-LV75-100", label: "100g", weightGrams: 100, price: 15, stock: 60 }],
      collections: [infusions.id],
    },
    {
      slug: "atelier-truffle-selection",
      name: "Atelier Truffle Selection (Box of 12)",
      shortDescription: "Hand-rolled ganache truffles, assorted",
      description: "Hand-rolled ganache covered in dusty roasted cocoa powder, delicate shell, creamy heart.",
      categoryId: truffles.id,
      shelfLife: "3 months",
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1607920591413-4ec007e70023",
      variants: [{ sku: "Z-BOX-TR12", label: "12 pieces", price: 38, stock: 34, lowStockAt: 10 }],
      collections: [atelierTruffles.id, giftBoxes.id],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        categoryId: p.categoryId,
        cocoaPercent: p.cocoaPercent,
        ingredients: p.ingredients,
        allergens: p.allergens,
        shelfLife: p.shelfLife,
        storageInfo: p.storageInfo,
        isFeatured: p.isFeatured ?? false,
        isBestseller: p.isBestseller ?? false,
        images: { create: [{ url: p.image, position: 0 }] },
        variants: { create: p.variants },
        collections: { create: p.collections.map((collectionId) => ({ collectionId })) },
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "ZESTWELCOME" },
    update: {},
    create: { code: "ZESTWELCOME", type: "PERCENTAGE", value: 10, minOrderValue: 20, usageLimit: 500, perUserLimit: 1 },
  });

  console.log("Seed complete. Admin login: admin@zestchocolates.example / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
