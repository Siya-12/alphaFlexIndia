import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { product_status } from "@/generated/prisma/enums";

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


export async function POST(request: NextRequest) {
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
    }: {
      name?: string;
      slug?: string;
      description?: string | null;
      categoryId?: string;
      status?: product_status;
      images?: ProductImageInput[];
      variants?: ProductVariantInput[];
    } = body;

    // --------------------------------------------------
    // 1. Validate required fields
    // --------------------------------------------------

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required",
        },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Product slug is required",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one product variant is required",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 2. Validate category
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

    if (!category.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is inactive",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Check duplicate product slug
    // --------------------------------------------------

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug: slug.trim(),
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with this slug already exists",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // 4. Validate variants
    // --------------------------------------------------

    for (const variant of variants) {
      if (!variant.name?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Every variant must have a name",
          },
          { status: 400 }
        );
      }

      if (!variant.sku?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Every variant must have a SKU",
          },
          { status: 400 }
        );
      }

      if (
        typeof variant.price !== "number" ||
        variant.price < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid price for variant ${variant.name}`,
          },
          { status: 400 }
        );
      }

      if (
        variant.quantity !== undefined &&
        (!Number.isInteger(variant.quantity) ||
          variant.quantity < 0)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid inventory quantity for variant ${variant.name}`,
          },
          { status: 400 }
        );
      }
    }

    // --------------------------------------------------
    // 5. Check duplicate SKUs inside request
    // --------------------------------------------------

    const skus = variants.map((variant) =>
      variant.sku.trim()
    );

    const uniqueSkus = new Set(skus);

    if (uniqueSkus.size !== skus.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate SKU found in variants",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Check SKUs already present in database
    // --------------------------------------------------

    const existingVariants =
      await prisma.productvariant.findMany({
        where: {
          sku: {
            in: skus,
          },
        },
        select: {
          sku: true,
        },
      });

    if (existingVariants.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `SKU already exists: ${existingVariants
            .map((variant) => variant.sku)
            .join(", ")}`,
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // 7. Create everything inside one transaction
    // --------------------------------------------------

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          id: crypto.randomUUID(),

          name: name.trim(),

          slug: slug.trim(),

          description: description?.trim() || null,

       status: status ?? product_status.DRAFT,

          categoryId,

          updatedAt: new Date(),

          productimage: {
            create: Array.isArray(images)
              ? images.map(
                  (
                    image: ProductImageInput,
                    index: number
                  ) => ({
                    id: crypto.randomUUID(),

                    url: image.url,

                    altText:
                      image.altText?.trim() || null,

                    sortOrder:
                      image.sortOrder ?? index,

                    createdAt: new Date(),
                  })
                )
              : [],
          },

          productvariant: {
            create: variants.map(
              (variant: ProductVariantInput) => ({
                id: crypto.randomUUID(),

                name: variant.name.trim(),

                size: variant.size?.trim() || null,

                unit: variant.unit?.trim() || null,

                sku: variant.sku.trim(),

                price: variant.price,

                comparePrice:
                  variant.comparePrice ?? null,

                isActive:
                  variant.isActive ?? true,

                updatedAt: new Date(),

                inventory: {
                  create: {
                    id: crypto.randomUUID(),

                    quantity:
                      variant.quantity ?? 0,

                    reserved: 0,

                    lowStockAt:
                      variant.lowStockAt ?? 10,

                    updatedAt: new Date(),
                  },
                },
              })
            ),
          },
        },

        include: {
          category: true,

          productimage: {
            orderBy: {
              sortOrder: "asc",
            },
          },

          productvariant: {
            include: {
              inventory: true,
            },
            orderBy: {
              price: "asc",
            },
          },
        },
      });

      return createdProduct;
    });

    // --------------------------------------------------
    // 8. Success response
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/products error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 }
    );
  }
}