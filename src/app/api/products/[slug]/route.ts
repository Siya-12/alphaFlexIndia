import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Product slug is required",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: "ACTIVE",
      },

      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true,

        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },

        productimage: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            url: true,
            altText: true,
            sortOrder: true,
          },
        },

       productvariant: {
  where: {
    isActive: true,
  },

  orderBy: {
    price: "asc",
  },

  select: {
    id: true,
    name: true,
    size: true,
    unit: true,
    sku: true,
    price: true,
    comparePrice: true,

    inventory: {
      select: {
        quantity: true,
        reserved: true,
        lowStockAt: true,
      },
    },
  },
},
},
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}