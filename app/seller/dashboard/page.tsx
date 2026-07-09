import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Package, ShoppingBag, Store, TrendingUp, Settings } from "lucide-react";

export default async function SellerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/seller');
  }

  // @ts-ignore
  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { products: true, orders: true }
      },
      orders: {
        select: { totalAmount: true }
      }
    }
  });

  const totalIncome = store?.orders.reduce((acc: number, order: any) => acc + order.totalAmount, 0) || 0;

  if (!store) {
    redirect('/seller');
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-2xl">
              {store.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{store.name}</h1>
              <p className="text-gray-500 font-medium text-sm flex items-center gap-1.5 mt-0.5">
                <Store className="w-4 h-4" /> Seller Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href={`/shop/${store.slug}`} target="_blank" className="flex-1 md:flex-none px-6 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-center text-sm">
              Lihat Toko Publik
            </Link>
            <Link href="/seller/settings" className="p-3 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">Total Produk</p>
            <h3 className="text-3xl font-black text-gray-900">{store._count.products}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-[#F26522]" />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">Pesanan Masuk</p>
            <h3 className="text-3xl font-black text-gray-900">{store._count.orders}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">Total Pendapatan</p>
            <h3 className="text-3xl font-black text-gray-900">Rp{totalIncome.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kelola Produk */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Package className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Produk Saya</h2>
            <p className="text-gray-500 text-sm mb-8 flex-1">Tambah, edit, atau hapus produk yang dijual di toko Anda.</p>
            <Link href="/seller/products" className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-center transition-colors shadow-sm">
              Kelola Produk
            </Link>
          </div>

          {/* Kelola Pesanan */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
            <div className="w-14 h-14 bg-[#fff0e6] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-7 h-7 text-[#F26522]" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Pesanan Pelanggan</h2>
            <p className="text-gray-500 text-sm mb-8 flex-1">Proses pesanan yang masuk dan perbarui status pengiriman.</p>
            <Link href="/seller/orders" className="w-full py-3.5 bg-[#F26522] hover:bg-[#d95a1e] text-white font-bold rounded-xl text-center transition-colors shadow-sm shadow-[#F26522]/20">
              Kelola Pesanan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
