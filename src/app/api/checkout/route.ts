import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const addressLine1 = String(body.address || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const pincode = String(body.pincode || "").trim();

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: "All delivery details are required" },
        { status: 400 }
      );
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, message: "Invalid pincode" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        cartitem: {
          include: {
            productvariant: {
              include: {
                product: { select: { id: true, name: true } },
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.cartitem.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // Re-validate stock server-side, never trust client totals
    for (const item of cart.cartitem) {
      const variant = item.productvariant;

      if (!variant.isActive) {
        return NextResponse.json(
          { success: false, message: `${variant.name} is no longer available` },
          { status: 400 }
        );
      }

      const availableQuantity = variant.inventory
        ? Math.max(0, variant.inventory.quantity - variant.inventory.reserved)
        : 0;

      if (item.quantity > availableQuantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${availableQuantity} of ${variant.name} available`,
          },
          { status: 400 }
        );
      }
    }

    const subtotal = cart.cartitem.reduce(
      (sum, item) => sum + Number(item.productvariant.price) * item.quantity,
      0
    );

    const shippingFee = 0;
    const tax = 0;
    const discount = 0;
    const total = subtotal + shippingFee + tax - discount;

    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || null;

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          type: "HOME",
          phone,
          addressLine1,
          city,
          state,
          postalCode: pincode,
          firstName,
          lastName,
          updatedAt: now,
        },
      });

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      const order = await tx.order.create({
        data: {
          id: crypto.randomUUID(),
          orderNumber,
          userId,
          addressId: address.id,
          status: "PENDING",
          subtotal,
          shippingFee,
          tax,
          discount,
          total,
          updatedAt: now,
        },
      });

      await tx.orderitem.createMany({
        data: cart.cartitem.map((item) => ({
          id: crypto.randomUUID(),
          orderId: order.id,
          variantId: item.variantId,
          productName: item.productvariant.product.name,
          variantName: item.productvariant.name,
          sku: item.productvariant.sku,
          unitPrice: item.productvariant.price,
          quantity: item.quantity,
          totalPrice: Number(item.productvariant.price) * item.quantity,
        })),
      });

      await tx.orderstatushistory.create({
        data: {
          id: crypto.randomUUID(),
          orderId: order.id,
          status: "PENDING",
        },
      });

      const payment = await tx.payment.create({
        data: {
          id: crypto.randomUUID(),
          orderId: order.id,
          method: "RAZORPAY",
          status: "CREATED",
          amount: total,
          updatedAt: now,
        },
      });

      return { order, payment };
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: result.order.orderNumber,
      notes: { orderId: result.order.id },
    });

    await prisma.payment.update({
      where: { id: result.payment.id },
      data: { razorpayOrderId: razorpayOrder.id, updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: result.order.id,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/checkout error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}