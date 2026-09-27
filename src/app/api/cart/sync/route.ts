import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


type GuestCartItem = {
  variantId: string;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    // ---------------------------------------------
    // 1. Check logged-in user
    // ---------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // ---------------------------------------------
    // 2. Read guest cart
    // ---------------------------------------------

    const body = await request.json();

    const guestItems: GuestCartItem[] =
      body.items || [];

    if (!Array.isArray(guestItems)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cart data",
        },
        { status: 400 }
      );
    }

    // Nothing to sync
    if (guestItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nothing to sync",
      });
    }

    // ---------------------------------------------
    // 3. Find/create user's cart
    // ---------------------------------------------

    let cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          updatedAt: new Date(),
        },
      });
    }

    // ---------------------------------------------
    // 4. Sync every guest item
    // ---------------------------------------------

    for (const guestItem of guestItems) {
      if (
        !guestItem.variantId ||
        !Number.isInteger(guestItem.quantity) ||
        guestItem.quantity <= 0
      ) {
        continue;
      }

      // Make sure variant exists and is active
      const variant =
        await prisma.productvariant.findFirst({
          where: {
            id: guestItem.variantId,
            isActive: true,
          },
          select: {
            id: true,
          },
        });

      if (!variant) {
        continue;
      }

      // Check whether variant already exists
      // in user's database cart
      const existingItem =
        await prisma.cartitem.findUnique({
          where: {
            cartId_variantId: {
              cartId: cart.id,
              variantId: guestItem.variantId,
            },
          },
        });

      if (existingItem) {
        // Merge quantities
        await prisma.cartitem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity:
              existingItem.quantity +
              guestItem.quantity,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new cart item
        await prisma.cartitem.create({
          data: {
            id: crypto.randomUUID(),
            cartId: cart.id,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
            updatedAt: new Date(),
          },
        });
      }
    }

    // ---------------------------------------------
    // 5. Return success
    // ---------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Guest cart synced successfully",
      data: {
        cartId: cart.id,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/cart/sync error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to sync cart",
      },
      { status: 500 }
    );
  }
}