import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ProductImageInput = {
  url: string;
  altText?: string | null;
  sortOrder?: number;
};

type ProductVariantInput = {
  name: string;
  size?: string | null;
  sku: string;
  price: number;
  comparePrice?: number | null;
  unit?: string | null;

  // Inventory
  isActive?: boolean;
  quantity?: number;
  lowStockAt?: number;
};

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        category: true,

        productimage: {
          orderBy: {
            sortOrder: "asc",
          },
        },

        productvariant: {
          orderBy: {
            createdAt: "asc",
          },

          include: {
            inventory: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      categoryId,
      status,
      images,
      variants,
    } = body;

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "name, slug and categoryId are required",
        },
        { status: 400 }
      );
    }

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one product variant is required",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Check category
    // --------------------------------------------------

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // Check duplicate slug
    // --------------------------------------------------

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product slug already exists",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // Create product
    // --------------------------------------------------

    const product = await prisma.product.create({
      data: {
        id: crypto.randomUUID(),

        name,
        slug,
        description: description || null,

        categoryId,

        status: status || "DRAFT",

        updatedAt: new Date(),

        productimage: {
          create: Array.isArray(images)
            ? images.map((image: ProductImageInput, index: number) => ({
                id: crypto.randomUUID(),
                url: image.url,
                altText: image.altText || null,
                sortOrder: image.sortOrder ?? index,
              }))
            : [],
        },

        productvariant: {
          create: variants.map((variant: ProductVariantInput) => ({
            id: crypto.randomUUID(),

            name: variant.name,
            size: variant.size || null,
            unit: variant.unit || null,

            sku: variant.sku,

            price: variant.price,
            comparePrice: variant.comparePrice ?? null,

            isActive: variant.isActive ?? true,

            updatedAt: new Date(),

            inventory: {
              create: {
                id: crypto.randomUUID(),

                quantity: variant.quantity ?? 0,
                reserved: 0,

                lowStockAt: variant.lowStockAt ?? 10,

                updatedAt: new Date(),
              },
            },
          })),
        },
      },

      include: {
        category: true,

        productimage: true,

        productvariant: {
          include: {
            inventory: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}
