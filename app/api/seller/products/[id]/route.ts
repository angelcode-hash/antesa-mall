import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    // @ts-ignore
    const product = await prisma.product.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, price, imageUrl, options } = await req.json();

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

    // Verify product belongs to store
    // @ts-ignore
    const existingProduct = await prisma.product.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingProduct || existingProduct.storeId !== store.id) {
      return NextResponse.json({ error: "Produk tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    // @ts-ignore
    const product = await prisma.product.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        description,
        price: Number(price),
        imageUrl: imageUrl || existingProduct.imageUrl,
        options: options ? JSON.stringify(options) : null,
      }
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id }
    });

    if (!store) {
      return NextResponse.json({ error: "Anda belum membuka toko" }, { status: 403 });
    }

    // Verify product belongs to store
    // @ts-ignore
    const existingProduct = await prisma.product.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existingProduct || existingProduct.storeId !== store.id) {
      return NextResponse.json({ error: "Produk tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    // @ts-ignore
    await prisma.product.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
