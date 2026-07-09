import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import OrderActionClient from "./OrderActionClient";

export default async function SellerOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/seller/orders');
  }

  // @ts-ignore
  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: { product: true }
          }
        }
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kelola Pesanan</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {store.orders.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Belum ada pesanan</h2>
              <p className="text-gray-500 max-w-sm mb-6">Pesanan yang masuk dari pembeli akan muncul di sini.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {store.orders.map((order: any) => (
                <div key={order.id} className="p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{order.orderNumber}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        order.status === 'PAID' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        order.status === 'PACKED' ? 'bg-orange-50 text-[#F26522] border-orange-100' :
                        order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-gray-100">
                          {item.product?.imageUrl && <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-gray-900 line-clamp-1">{item.product?.name || 'Produk dihapus'}</div>
                          <div className="text-xs text-gray-500">{item.quantity} x Rp{item.price.toLocaleString('id-ID')}</div>
                        </div>
                        <div className="font-black text-gray-900 text-sm">
                          Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-sm font-bold text-gray-900">Total Pendapatan: <span className="text-[#F26522] text-lg">Rp{order.totalAmount.toLocaleString('id-ID')}</span></div>
                    
                    <OrderActionClient orderId={order.id} status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
