import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/store -> Get current user's store
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { products: true, orders: true }
        }
      }
    });

    return NextResponse.json(store || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/store -> Create a new store
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, location } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Nama toko wajib diisi" }, { status: 400 });
    }

    // Ensure user exists in database (since DB might have been reset)
    // @ts-ignore
    let user = await prisma.user.findUnique({ where: { id: session.user.id } });
    
    if (!user) {
      // Recreate user if they were deleted during DB reset but still have JWT session
      // @ts-ignore
      user = await prisma.user.create({
        data: {
          // @ts-ignore
          id: session.user.id,
          name: session.user?.name || 'User',
          email: session.user?.email || `temp-${Date.now()}@example.com`,
          password: 'resetpassword123', // Dummy password
          // @ts-ignore
          phone: session.user?.phone || '08000000000',
        }
      });
    }

    // Generate unique slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // @ts-ignore
    const existingStore = await prisma.store.findUnique({ where: { slug } });
    if (existingStore) {
      slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }

    // @ts-ignore
    const store = await prisma.store.create({
      data: {
        userId: user.id,
        name,
        slug,
        description,
        location: location || "Jakarta", // Default if not provided
      }
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error: any) {
    // If unique constraint fails (e.g. user already has a store)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Anda sudah memiliki toko" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
