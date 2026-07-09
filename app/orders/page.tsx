import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Package, Truck, CheckCircle2, Clock, ChevronRight, ShoppingBag } from "lucide-react";
import Link from 'next/link';
import BuyerOrderAction from './BuyerOrderAction';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.status || 'ALL';

  // @ts-ignore
  const allOrders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  const orders = currentTab === 'ALL' 
    ? allOrders 
    : allOrders.filter((o: any) => o.status === currentTab);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><Clock className="w-3.5 h-3.5"/> Belum Bayar</span>;
      case 'PACKED': return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><Package className="w-3.5 h-3.5"/> Dikemas</span>;
      case 'SHIPPED': return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><Truck className="w-3.5 h-3.5"/> Dikirim</span>;
      case 'DELIVERED': return <span className="bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"><CheckCircle2 className="w-3.5 h-3.5"/> Selesai</span>;
      default: return null;
    }
  };

  const tabs = [
    { id: 'ALL', label: 'Semua' },
    { id: 'PENDING', label: 'Belum Bayar' },
    { id: 'PACKED', label: 'Dikemas' },
    { id: 'SHIPPED', label: 'Dikirim' },
    { id: 'DELIVERED', label: 'Selesai' }
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-8 pb-32">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F26522] to-[#FF8C00] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pesanan Saya</h1>
            <p className="text-gray-500 text-sm">Lacak dan kelola riwayat pesanan Anda</p>
          </div>
        </div>

        {/* Tabs Filter */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-6 overflow-hidden flex flex-nowrap overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const count = tab.id === 'ALL' ? allOrders.length : allOrders.filter((o: any) => o.status === tab.id).length;
            return (
              <Link 
                key={tab.id} 
                href={`/orders${tab.id === 'ALL' ? '' : `?status=${tab.id}`}`}
                className={`flex-1 min-w-[120px] text-center py-4 px-2 font-bold text-sm transition-all border-b-2 relative ${isActive ? 'text-[#F26522] border-[#F26522]' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs ${isActive ? 'text-[#F26522]' : 'text-gray-400'}`}>
                    ({count})
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Belum ada pesanan</h2>
            <p className="text-gray-500 max-w-sm mb-8">Anda belum memiliki pesanan di kategori ini.</p>
            <Link href="/" className="px-8 py-3.5 bg-[#F26522] hover:bg-[#d95a1e] text-white font-bold rounded-xl transition-all shadow-sm">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                {/* Header Order */}
                <div className="bg-gray-50/50 p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-medium block mb-1">NO. PESANAN</span>
                    <span className="font-black text-gray-900 text-lg tracking-tight">{order.orderNumber}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Items */}
                <div className="p-5 flex flex-col gap-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-5 items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.product.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{item.product.name}</h3>
                        <p className="text-sm text-gray-500 font-medium mb-1">{item.quantity} x Rp{item.price.toLocaleString('id-ID')}</p>
                        <p className="text-sm font-black text-[#F26522]">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Order */}
                <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                    <span>{order.paymentMethod}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{order.shippingOpt}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="text-right flex-1 sm:flex-none w-full sm:w-auto flex justify-between sm:block items-center">
                      <span className="text-xs text-gray-500 font-medium block">Total Belanja</span>
                      <span className="font-black text-[#F26522] text-xl leading-none">Rp{order.totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <BuyerOrderAction orderId={order.id} status={order.status} items={order.items} />
                      <Link href={`/orders/${order.id}`} className="px-5 py-2.5 bg-white border border-[#F26522] text-[#F26522] rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                        Detail
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
