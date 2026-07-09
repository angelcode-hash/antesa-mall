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

    const { reviews } = await req.json();

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // @ts-ignore
    const userId = session.user.id;

    // Create reviews in transaction
    await prisma.$transaction(
      reviews.map((review: any) => 
        // @ts-ignore
        prisma.review.create({
          data: {
            userId,
            productId: review.productId,
            rating: review.rating,
            comment: review.comment || null
          }
        })
      )
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
