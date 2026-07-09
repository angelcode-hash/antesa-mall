import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Check if it's a password update request
    if (data.currentPassword && data.newPassword) {
      // @ts-ignore
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user || !user.password) {
        return NextResponse.json({ message: "Invalid user" }, { status: 400 });
      }

      const isValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ message: "Kata sandi saat ini salah" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      
      // @ts-ignore
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword }
      });

      return NextResponse.json({ message: "Password updated successfully" });
    }

    // Otherwise it's a profile update (name, phone)
    const { name, phone } = data;
    
    // @ts-ignore
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone }
    });

    return NextResponse.json({ 
      message: "Profile updated successfully", 
      user: { name: updatedUser.name, phone: updatedUser.phone }
    });
  } catch (error) {
    return NextResponse.json({ message: "Error updating profile" }, { status: 500 });
  }
}
