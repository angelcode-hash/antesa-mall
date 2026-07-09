import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, fullAddress, phone, lat, lng } = await req.json();

    const newAddress = await prisma.address.create({
      data: {
        // @ts-ignore
        userId: session.user.id,
        title,
        fullAddress,
        phone,
        lat,
        lng
      }
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
