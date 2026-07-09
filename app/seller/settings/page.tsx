import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";

export default async function SellerSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/seller/settings');
  }

  // @ts-ignore
  const store = await prisma.store.findUnique({
    where: { userId: session.user.id }
  });

  if (!store) {
    redirect('/seller');
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/seller/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pengaturan Toko</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden p-8 flex flex-col gap-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl text-white font-black text-4xl">
              {store.name.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Nama Toko</label>
            <input type="text" defaultValue={store.name} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-gray-900 outline-none focus:border-[#F26522]" />
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Link Toko Publik</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <span className="px-4 text-gray-500 font-medium bg-gray-100 border-r border-gray-200">/shop/</span>
              <input type="text" defaultValue={store.slug} readOnly className="w-full bg-transparent px-4 py-3 font-medium text-gray-900 outline-none" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Lokasi Toko</label>
            <input type="text" defaultValue={store.location || ''} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-gray-900 outline-none focus:border-[#F26522]" />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Deskripsi Toko</label>
            <textarea defaultValue={store.description || ''} rows={4} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-gray-900 outline-none focus:border-[#F26522] resize-none" />
          </div>

          <button className="w-full py-4 bg-[#F26522] hover:bg-[#d95a1e] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all mt-4">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
