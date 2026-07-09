import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ensure the address belongs to the user
    // @ts-ignore
    const address = await prisma.address.findUnique({
      where: { id: resolvedParams.id }
    });

    // @ts-ignore
    if (!address || address.userId !== session.user.id) {
      return NextResponse.json({ message: "Address not found or unauthorized" }, { status: 404 });
    }

    // @ts-ignore
    await prisma.address.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting address" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { isPrimary } = await req.json();

    if (isPrimary) {
      // Set all other addresses to not primary
      // @ts-ignore
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false }
      });
    }

    // Update this address
    // @ts-ignore
    const updatedAddress = await prisma.address.update({
      where: { id: resolvedParams.id },
      data: { isPrimary }
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    return NextResponse.json({ message: "Error updating address" }, { status: 500 });
  }
}
