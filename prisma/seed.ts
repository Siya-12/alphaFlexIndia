import { randomUUID } from "crypto";
import { prisma } from "../src/lib/prisma";

// Sizes must match the dropdown in the Meesho page EXACTLY.
// price = GST-inclusive total per piece, so the amount charged
// matches the total shown on the product page.
const sizes = [
  { size: "6.5 × 8", total: 0.99 },
  { size: "8 × 10", total: 1.49 },
  { size: "8 × 12", total: 1.68 },
  { size: "9 × 12", total: 1.88 },
  { size: "10 × 12", total: 2.11 },
  { size: "10 × 13", total: 2.26 },
  { size: "10 × 14", total: 2.39 },
  { size: "12 × 14", total: 3.02 },
  { size: "12.5 × 16", total: 3.42 },
  { size: "14 × 18", total: 4.36 },
  { size: "16 × 20", total: 5.59 },
  { size: "20 × 23", total: 8.31 },
  { size: "22 × 24", total: 8.18 },
  { size: "24 × 26", total: 10.69 },
];

async function main() {
  const now = new Date();

  const category = await prisma.category.upsert({
    where: { slug: "poly-bags" },
    update: {},
    create: {
      id: randomUUID(),
      name: "Poly Bags",
      slug: "poly-bags",
      updatedAt: now,
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: "meesho-poly-transparent" },
    update: { status: "ACTIVE" },
    create: {
      id: randomUUID(),
      name: "Meesho Poly Transparent without POD (52 microns)",
      slug: "meesho-poly-transparent",
      status: "ACTIVE",
      categoryId: category.id,
      updatedAt: now,
    },
  });

  const imageCount = await prisma.productimage.count({
    where: { productId: product.id },
  });

  if (imageCount === 0) {
    await prisma.productimage.create({
      data: {
        id: randomUUID(),
        productId: product.id,
        url: "/images/meesho-product.png",
        altText: "Meesho Poly Transparent Courier Bags",
        sortOrder: 0,
      },
    });
  }

  for (const item of sizes) {
    const sku = `MEESHO-52M-${item.size.replace(/[^0-9.]+/g, "-")}`;

    const variant = await prisma.productvariant.upsert({
      where: { sku },
      update: { price: item.total, isActive: true, updatedAt: now },
      create: {
        id: randomUUID(),
        productId: product.id,
        name: item.size,
        size: item.size,
        unit: "pcs",
        sku,
        price: item.total,
        isActive: true,
        updatedAt: now,
      },
    });

    await prisma.inventory.upsert({
      where: { variantId: variant.id },
      update: { quantity: 1000000, updatedAt: now },
      create: {
        id: randomUUID(),
        variantId: variant.id,
        quantity: 1000000,
        updatedAt: now,
      },
    });
  }

  console.log("Seeded Meesho product with", sizes.length, "variants");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());