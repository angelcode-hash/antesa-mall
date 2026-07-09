import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    if (!["PACKED", "SHIPPED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
    }

    // @ts-ignore
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id }
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 403 });
    }

    // @ts-ignore
    const order = await prisma.order.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!order || order.storeId !== store.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // @ts-ignore
    const updatedOrder = await prisma.order.update({
      where: { id: resolvedParams.id },
      data: { status }
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
