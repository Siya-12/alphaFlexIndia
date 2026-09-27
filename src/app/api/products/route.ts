import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",

        ...(categorySlug
          ? {
              category: {
                slug: categorySlug,
                isActive: true,
              },
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  description: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
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
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        data: products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}