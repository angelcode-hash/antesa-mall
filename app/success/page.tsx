'use client';

import Link from 'next/link';
import { CheckCircle2, Package, MapPin } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const [mounted, setMounted] = useState(false);
  const [orderData, setOrderData] = useState<{addressName: string, addressPhone: string, addressDetail: string} | null>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  // Fake order number generator for display if actual order number isn't passed yet
  const orderNumber = `ANT${Math.floor(Math.random() * 1000000000)}`;

  useEffect(() => {
    setMounted(true);
    const storedOrder = localStorage.getItem('lastOrder');
    if (storedOrder) {
      setOrderData(JSON.parse(storedOrder));
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transform transition-all">
        {/* Header Success */}
        <div className="bg-[#F26522] pt-10 pb-6 px-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 relative z-10 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-[#F26522]" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2 relative z-10">Pesanan Berhasil!</h1>
          <p className="text-orange-50 text-sm relative z-10">
            Terima kasih telah berbelanja di Antesa Mall
          </p>
        </div>

        {/* Order Info */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col items-center border-b border-gray-100 pb-6">
            <span className="text-sm text-gray-500 mb-1">Nomor Pesanan</span>
            <span className="text-xl font-bold text-gray-900 tracking-wide">{orderNumber}</span>
          </div>

          <div className="bg-gray-50/50 rounded-lg p-4 flex gap-3 items-start border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Status Pengiriman</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pesanan sedang dikemas oleh penjual dan akan segera diserahkan ke kurir pengiriman.
              </p>
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-lg p-4 flex gap-3 items-start border border-gray-100">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <MapPin className="w-5 h-5 text-[#F26522]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Alamat Tujuan</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {orderData ? (
                  <>
                    <span className="font-semibold">{orderData.addressName} ({orderData.addressPhone})</span><br/>
                    {orderData.addressDetail}
                  </>
                ) : (
                  <>
                    Gibran (081234567890)<br/>
                    Jl. Jendral Sudirman No. 123, Komplek Bumi Indah Blok C2, Jakarta Selatan
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Link 
              href={orderId ? `/orders/${orderId}` : '/orders'}
              className="w-full py-3 bg-[#F26522] hover:bg-[#d95a1e] text-white rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Lacak Pesanan
            </Link>
            <Link 
              href="/"
              className="w-full py-3 bg-white border border-gray-200 hover:border-[#F26522] hover:text-[#F26522] text-gray-600 rounded-lg font-bold transition-all flex items-center justify-center text-center"
            >
              Kembali Berbelanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#F26522] border-t-transparent rounded-full animate-spin"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
