import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { success: false, message: "Missing payment details" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { payment: true },
    });

    if (!order || !order.payment) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.payment.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        { success: false, message: "Order mismatch" },
        { status: 400 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: "FAILED", updatedAt: new Date() },
      });

      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: {
          status: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paidAt: now,
          updatedAt: now,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED", updatedAt: now },
      });

      await tx.orderstatushistory.create({
        data: {
          id: crypto.randomUUID(),
          orderId: order.id,
          status: "CONFIRMED",
          note: "Payment received",
        },
      });

      await tx.shipment.create({
        data: {
          id: crypto.randomUUID(),
          orderId: order.id,
          status: "NOT_SHIPPED",
          updatedAt: now,
        },
      });

      const cart = await tx.cart.findUnique({ where: { userId } });

      if (cart) {
        await tx.cartitem.deleteMany({ where: { cartId: cart.id } });
      }
    });

    return NextResponse.json(
      { success: true, data: { orderId: order.id } },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/checkout/verify error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}