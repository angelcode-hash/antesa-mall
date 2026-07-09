import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SellerOnboardingClient from "./SellerOnboardingClient";

export default async function SellerIndexPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/seller');
  }

  // @ts-ignore
  const store = await prisma.store.findUnique({
    where: { userId: session.user.id }
  });

  if (store) {
    redirect('/seller/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <SellerOnboardingClient />
      </div>
    </div>
  );
}
