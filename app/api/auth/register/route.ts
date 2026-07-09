import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone
      }
    });

    return NextResponse.json({ message: "Registrasi berhasil", user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
