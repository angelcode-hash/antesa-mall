import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, price, category, imageUrl, options } = await req.json();

    if (!name || !price) {
      return NextResponse.json({ error: "Nama dan Harga wajib diisi" }, { status: 400 });
    }

    // @ts-ignore
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id }
    });

    if (!store) {
      return NextResponse.json({ error: "Anda belum membuka toko" }, { status: 403 });
    }

    // @ts-ignore
    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        name,
        description: `Kategori: ${category || "Lainnya"}\n\n${description}`,
        price: Number(price),
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        options: options ? JSON.stringify(options) : null,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
