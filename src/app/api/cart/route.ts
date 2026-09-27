import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


//get function ------------->view  cart
export async function GET() {
  try {
    // 1. Get logged-in user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Find user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },

      include: {
        cartitem: {
          orderBy: {
            createdAt: "asc",
          },

          include: {
            productvariant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    productimage: {
                      orderBy: {
                        sortOrder: "asc",
                      },
                      take: 1,
                      select: {
                        url: true,
                        altText: true,
                      },
                    },
                  },
                },

                inventory: {
                  select: {
                    quantity: true,
                    reserved: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 3. No cart yet
    if (!cart) {
      return NextResponse.json(
        {
          success: true,
          data: {
            id: null,
            items: [],
            itemCount: 0,
            subtotal: 0,
          },
        },
        { status: 200 }
      );
    }

    // 4. Calculate totals
    const items = cart.cartitem.map((item) => {
      const variant = item.productvariant;

      const price = Number(variant.price);

      const total = price * item.quantity;

      const availableQuantity = variant.inventory
        ? Math.max(
            0,
            variant.inventory.quantity -
              variant.inventory.reserved
          )
        : 0;

      return {
        id: item.id,
        quantity: item.quantity,

        variant: {
          id: variant.id,
          name: variant.name,
          size: variant.size,
          unit: variant.unit,
          sku: variant.sku,
          price,
          comparePrice: variant.comparePrice
            ? Number(variant.comparePrice)
            : null,

          availableQuantity,
        },

        product: variant.product,

        total,
      };
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const itemCount = items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // 5. Return cart
    return NextResponse.json(
      {
        success: true,

        data: {
          id: cart.id,
          items,
          itemCount,
          subtotal,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cart",
      },
      { status: 500 }
    );
  }
}



//post function ------------> add items to cart
export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Read request body
    const body = await request.json();

    const variantId = String(body.variantId || "");
    const quantity = Number(body.quantity || 1);

    // 3. Validate input
    if (!variantId) {
      return NextResponse.json(
        {
          success: false,
          message: "variantId is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a positive integer",
        },
        { status: 400 }
      );
    }

    // 4. Find product variant
    const variant = await prisma.productvariant.findUnique({
      where: {
        id: variantId,
      },

      include: {
        inventory: true,
      },
    });

    if (!variant) {
      return NextResponse.json(
        {
          success: false,
          message: "Product variant not found",
        },
        { status: 404 }
      );
    }

    // 5. Check if variant is active
    if (!variant.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "This product variant is unavailable",
        },
        { status: 400 }
      );
    }

    // 6. Check inventory
    const availableQuantity = variant.inventory
      ? Math.max(
          0,
          variant.inventory.quantity -
            variant.inventory.reserved
        )
      : 0;

    if (availableQuantity < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${availableQuantity} item(s) available`,
        },
        { status: 400 }
      );
    }

    // 7. Find user's cart
    let cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    // 8. Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          updatedAt: new Date(),
        },
      });
    }

    // 9. Check whether item already exists
    const existingItem = await prisma.cartitem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    // 10. Calculate new quantity
    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    // 11. Don't exceed inventory
    if (newQuantity > availableQuantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${availableQuantity} item(s) available`,
        },
        { status: 400 }
      );
    }

    // 12. Update existing item
    if (existingItem) {
      const updatedItem = await prisma.cartitem.update({
        where: {
          id: existingItem.id,
        },

        data: {
          quantity: newQuantity,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Cart updated successfully",
          data: updatedItem,
        },
        { status: 200 }
      );
    }

    // 13. Create new cart item
    const cartItem = await prisma.cartitem.create({
      data: {
        id: crypto.randomUUID(),
        cartId: cart.id,
        variantId,
        quantity,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product added to cart",
        data: cartItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product to cart",
      },
      { status: 500 }
    );
  }
}

// DELETE function ---------------->delete items from cart
export async function DELETE(request: Request) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Read request body
    const body = await request.json();

    const cartItemId = String(body.cartItemId || "");

    if (!cartItemId) {
      return NextResponse.json(
        {
          success: false,
          message: "cartItemId is required",
        },
        { status: 400 }
      );
    }

    // 3. Find user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found",
        },
        { status: 404 }
      );
    }

    // 4. Find cart item
    const cartItem = await prisma.cartitem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // 5. Delete cart item
    await prisma.cartitem.delete({
      where: {
        id: cartItem.id,
      },
    });

    // 6. Return success
    return NextResponse.json(
      {
        success: true,
        message: "Item removed from cart",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove item from cart",
      },
      { status: 500 }
    );
  }
}


//patch request --------------->update items, quantity

export async function PATCH(request: Request) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Read request body
    const body = await request.json();

    const cartItemId = String(body.cartItemId || "");
    const quantity = Number(body.quantity);

    // 3. Validate input
    if (!cartItemId) {
      return NextResponse.json(
        {
          success: false,
          message: "cartItemId is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity must be a positive integer",
        },
        { status: 400 }
      );
    }

    // 4. Find user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart not found",
        },
        { status: 404 }
      );
    }

    // 5. Find cart item belonging to this cart
    const cartItem = await prisma.cartitem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },

      include: {
        productvariant: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // 6. Check inventory
    const inventory = cartItem.productvariant.inventory;

    const availableQuantity = inventory
      ? Math.max(
          0,
          inventory.quantity - inventory.reserved
        )
      : 0;

    if (quantity > availableQuantity) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${availableQuantity} item(s) available`,
        },
        { status: 400 }
      );
    }

    // 7. Update quantity
    const updatedItem = await prisma.cartitem.update({
      where: {
        id: cartItem.id,
      },

      data: {
        quantity,
        updatedAt: new Date(),
      },
    });

    // 8. Return updated item
    return NextResponse.json(
      {
        success: true,
        message: "Cart quantity updated",
        data: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update cart quantity",
      },
      { status: 500 }
    );
  }
}