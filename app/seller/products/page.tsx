import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import ProductListClient from "./ProductListClient";

export default async function SellerProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/seller/products');
  }

  // @ts-ignore
  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!store) {
    redirect('/seller');
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/seller/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kelola Produk</h1>
          <Link href="/seller/products/new" className="ml-auto flex items-center gap-2 bg-[#F26522] hover:bg-[#d95a1e] text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm">
            <PackagePlus className="w-4 h-4" /> Tambah Produk
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {store.products.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <PackagePlus className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Belum ada produk</h2>
              <p className="text-gray-500 max-w-sm mb-6">Mulai berjualan dengan menambahkan produk pertama ke toko Anda.</p>
            </div>
          ) : (
            <ProductListClient products={store.products} />
          )}
        </div>
      </div>
    </div>
  );
}
