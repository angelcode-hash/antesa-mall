import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from 'next/link';
import { Package, Truck, CheckCircle2, Clock, ChevronLeft, MapPin, Search } from "lucide-react";

export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  // @ts-ignore
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  // Parse addressData safely
  let addressData = null;
  try {
    addressData = JSON.parse(order.addressData);
  } catch (e) {
    // Ignore error
  }

  const statuses = [
    { key: 'PENDING', label: 'Menunggu Pembayaran', desc: 'Selesaikan pembayaran agar pesanan diproses', icon: Clock },
    { key: 'PACKED', label: 'Pesanan Dikemas', desc: 'Penjual sedang menyiapkan pesanan Anda', icon: Package },
    { key: 'SHIPPED', label: 'Pesanan Dikirim', desc: 'Pesanan dalam perjalanan menuju alamat tujuan', icon: Truck },
    { key: 'DELIVERED', label: 'Pesanan Selesai', desc: 'Pesanan telah berhasil diterima', icon: CheckCircle2 }
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/orders" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#F26522] mb-6 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Kembali ke Daftar Pesanan
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F26522] to-[#FF8C00] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Detail Lacak Pesanan</h1>
            <p className="text-gray-500 text-sm">Status terbaru dari pengiriman Anda</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden mb-8 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-[#F26522] to-purple-500"></div>
          <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs text-gray-500 font-medium block mb-1">NO. PESANAN</span>
              <span className="font-black text-gray-900 text-lg">{order.orderNumber}</span>
            </div>
            <div className="text-right w-full sm:w-auto bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              <span className="text-xs text-gray-500 font-medium block">Total Belanja</span>
              <span className="font-black text-[#F26522] text-xl leading-none">Rp{order.totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="relative">
              {/* Timeline Items */}
              <div className="flex flex-col gap-10 relative z-10">
                {statuses.map((status, idx) => {
                  const isCompleted = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  const Icon = status.icon;

                  return (
                    <div key={status.key} className="flex gap-6 group">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 relative ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-[#F26522] to-[#FF8C00] text-white shadow-lg shadow-orange-500/30' 
                            : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'scale-110 ring-4 ring-orange-100' : ''}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {idx !== statuses.length - 1 && (
                          <div className={`w-1 h-full absolute top-14 -bottom-10 rounded-full transition-colors duration-500 ${
                            idx < currentStatusIndex ? 'bg-[#F26522]' : 'bg-gray-100'
                          }`}></div>
                        )}
                      </div>
                      <div className="pt-3">
                        <h3 className={`font-black tracking-tight transition-colors duration-300 ${isCurrent ? 'text-[#F26522] text-xl' : isCompleted ? 'text-gray-900 text-lg' : 'text-gray-400 text-lg'}`}>
                          {status.label}
                        </h3>
                        <p className={`text-sm mt-1.5 transition-colors duration-300 ${isCurrent ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                          {status.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {addressData && (
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#F26522]" /> 
              </div>
              <h2 className="font-black text-lg text-gray-900">Alamat Pengiriman</h2>
            </div>
            <div className="p-6">
              <p className="font-black text-gray-900 text-lg mb-1">{addressData.addressName} <span className="font-medium text-gray-500 text-sm ml-2">({addressData.addressPhone})</span></p>
              <p className="text-gray-600 leading-relaxed">{addressData.addressDetail}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="font-black text-lg text-gray-900">Rincian Barang</h2>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex gap-5 items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{item.product.name}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-1">{item.quantity} x Rp{item.price.toLocaleString('id-ID')}</p>
                  <p className="font-black text-[#F26522]">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
