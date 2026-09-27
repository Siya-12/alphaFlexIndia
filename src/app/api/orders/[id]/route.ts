import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { id, userId: session.user.id },
      include: {
        orderitem: true,
        payment: true,
        address: true,
        orderstatushistory: { orderBy: { createdAt: "asc" } },
        shipment: {
          include: {
            trackingevent: { orderBy: { eventTime: "asc" } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}