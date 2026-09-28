import { randomUUID } from "crypto";
import { prisma } from "../src/lib/prisma";

const GST_RATE = 0.18;

// Prices are per pack, BEFORE GST, exactly as in the PACKS array on the Valmo page.
// Variant names/sizes are written so that findVariant() on the page matches them:
//   - combos: name contains "Combo 1" / "Combo 2"
//   - packs:  name/size contains "10x14" or "16x18" plus the piece count
const packs = [
  // ---------- COMBO ----------
  { sku: "VALMO-COMBO-1", name: "Valmo Branded Combo 1", size: "Combo 1", price: 273.99 },
  { sku: "VALMO-COMBO-2", name: "Valmo Branded Combo 2", size: "Combo 2", price: 944.99 },

  // ---------- SMALL (10×14) ----------
  { sku: "VALMO-10X14-200", name: "Valmo 10x14 Pack Of - 200", size: "10x14", price: 599.99 },
  { sku: "VALMO-10X14-500", name: "Valmo 10x14 Pack Of - 500", size: "10x14", price: 1149.99 },
  { sku: "VALMO-10X14-1000", name: "Valmo 10x14 Pack Of - 1000", size: "10x14", price: 2299.99 },
  { sku: "VALMO-10X14-2000", name: "Valmo 10x14 Pack Of - 2000", size: "10x14", price: 4599.99 },
  { sku: "VALMO-10X14-5000", name: "Valmo 10x14 Pack Of - 5000", size: "10x14", price: 11499.99 },

  // ---------- LARGE (16×18) ----------
  { sku: "VALMO-16X18-200", name: "Valmo 16x18 Pack Of - 200", size: "16x18", price: 895.99 },
  { sku: "VALMO-16X18-500", name: "Valmo 16x18 Pack Of - 500", size: "16x18", price: 2239.99 },
  { sku: "VALMO-16X18-1000", name: "Valmo 16x18 Pack Of - 1000", size: "16x18", price: 4479.99 },
  { sku: "VALMO-16X18-2000", name: "Valmo 16x18 Pack Of - 2000", size: "16x18", price: 8959.99 },
  { sku: "VALMO-16X18-5000", name: "Valmo 16x18 Pack Of - 5000", size: "16x18", price: 22399.99 },
];

// price stored in DB = GST-inclusive total per pack,
// so the amount charged matches the total shown on the product page.
const withGst = (price: number) =>
  Math.round(price * (1 + GST_RATE) * 100) / 100;

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

  // Product name MUST contain "Valmo" — the page searches /api/products?search=Valmo
  const product = await prisma.product.upsert({
    where: { slug: "valmo-branded-courier-bags" },
    update: { status: "ACTIVE" },
    create: {
      id: randomUUID(),
      name: "Valmo Branded Courier Bags",
      slug: "valmo-branded-courier-bags",
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
        url: "/images/valmo-combo.png",
        altText: "Valmo Branded Courier Bags",
        sortOrder: 0,
      },
    });
  }

  for (const item of packs) {
    const price = withGst(item.price);

    const variant = await prisma.productvariant.upsert({
      where: { sku: item.sku },
      update: {
        name: item.name,
        size: item.size,
        price,
        isActive: true,
        updatedAt: now,
      },
      create: {
        id: randomUUID(),
        productId: product.id,
        name: item.name,
        size: item.size,
        unit: "pack",
        sku: item.sku,
        price,
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

  console.log("Seeded Valmo product with", packs.length, "variants");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());