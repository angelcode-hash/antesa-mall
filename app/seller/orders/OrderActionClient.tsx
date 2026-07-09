'use client';

import { useState } from 'react';
import { Loader2, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderActionProps {
  orderId: string;
  status: string;
}

export default function OrderActionClient({ orderId, status }: OrderActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Gagal memproses pesanan');
      
      router.refresh();
    } catch (error: any) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  if (status === 'PAID' || status === 'PENDING') {
    return (
      <button 
        onClick={() => handleUpdateStatus('PACKED')}
        disabled={isLoading}
        className="bg-[#F26522] hover:bg-[#d95a1e] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
        Kemasi Pesanan
      </button>
    );
  }

  if (status === 'PACKED') {
    return (
      <button 
        onClick={() => handleUpdateStatus('SHIPPED')}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
        Kirim Pesanan
      </button>
    );
  }

  if (status === 'SHIPPED') {
    return (
      <div className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-not-allowed border border-gray-200">
        <Clock className="w-4 h-4" />
        Menunggu Pembeli
      </div>
    );
  }

  if (status === 'DELIVERED') {
    return (
      <div className="bg-green-50 text-green-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-not-allowed border border-green-100">
        <CheckCircle2 className="w-4 h-4" />
        Selesai
      </div>
    );
  }

  return null;
}
