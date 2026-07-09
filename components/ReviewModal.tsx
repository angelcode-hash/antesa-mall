'use client';

import { useState } from 'react';
import { Star, X, Loader2, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
}

export default function ReviewModal({ isOpen, onClose, items }: ReviewModalProps) {
  const [ratings, setRatings] = useState<Record<string, { rating: number, comment: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleRatingChange = (productId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const reviewsData = items.map(item => ({
        productId: item.productId,
        rating: ratings[item.productId]?.rating || 5, // default to 5 stars if not selected
        comment: ratings[item.productId]?.comment || ''
      }));

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviewsData })
      });

      if (!res.ok) throw new Error('Gagal mengirim ulasan');

      alert('Terima kasih atas ulasan Anda!');
      onClose();
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Beri Penilaian
          </h3>
          <button onClick={onClose} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors font-bold">&times;</button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6">
            {items.map(item => {
              const currentRating = ratings[item.productId]?.rating || 0;
              const currentComment = ratings[item.productId]?.comment || '';
              
              return (
                <div key={item.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div className="flex gap-4 items-center mb-4">
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-100">
                      {item.product.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.product.name}</h4>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(item.productId, star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star 
                            className={`w-8 h-8 ${star <= currentRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} 
                          />
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative mt-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <textarea 
                        placeholder="Tulis ulasan Anda tentang produk ini (opsional)"
                        value={currentComment}
                        onChange={(e) => handleCommentChange(item.productId, e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] transition-all shadow-sm resize-none h-20"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-[#F26522] to-[#FF8C00] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kirim Penilaian'}
          </button>
        </div>
      </div>
    </div>
  );
}
