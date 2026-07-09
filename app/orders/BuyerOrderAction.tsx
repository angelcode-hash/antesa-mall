'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, Package, Truck, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';

interface BuyerOrderActionProps {
  orderId: string;
  status: string;
  items: any[];
}

export default function BuyerOrderAction({ orderId, status, items }: BuyerOrderActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm("Apakah Anda yakin telah menerima pesanan ini dengan baik?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Gagal mengupdate pesanan');
      
      router.refresh();
    } catch (error: any) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {status === 'PAID' && (
          <div className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-yellow-100">
            <Clock className="w-4 h-4" />
            Menunggu Penjual
          </div>
        )}

        {status === 'PACKED' && (
          <div className="bg-orange-50 text-[#F26522] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-orange-100">
            <Package className="w-4 h-4" />
            Sedang Dikemas
          </div>
        )}

        {status === 'SHIPPED' && (
          <button 
            onClick={() => handleUpdateStatus('DELIVERED')}
            disabled={isLoading}
            className="bg-[#F26522] hover:bg-[#d95a1e] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Pesanan Diterima
          </button>
        )}

        {status === 'DELIVERED' && (
          <button 
            onClick={() => setIsReviewOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Beri Penilaian
          </button>
        )}
      </div>

      {isReviewOpen && (
        <ReviewModal 
          isOpen={isReviewOpen} 
          onClose={() => setIsReviewOpen(false)} 
          items={items} 
        />
      )}
    </>
  );
}
