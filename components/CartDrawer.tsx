'use client';

import { useCartStore } from '@/lib/store';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <>
      {/* Overlay Gelap with Glassmorphism */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100 z-10 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#F26522]" />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Keranjang Anda</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Isi Keranjang */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 border border-gray-100">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">Keranjang Kosong</p>
              <p className="text-sm text-gray-500 max-w-[250px]">
                Temukan berbagai produk menarik dan tambahkan ke keranjang Anda.
              </p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-8 px-8 py-3 bg-white border border-gray-200 hover:border-[#F26522] hover:text-[#F26522] text-gray-700 font-bold rounded-xl transition-all shadow-sm"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(
                items.reduce((acc, item) => {
                  const storeName = item.storeName || 'Antesa Store';
                  if (!acc[storeName]) acc[storeName] = [];
                  acc[storeName].push(item);
                  return acc;
                }, {} as Record<string, typeof items>)
              ).map(([storeName, storeItems]) => (
                <div key={storeName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-sm">{storeName}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-4">
                    {storeItems.map((item) => (
                      <div key={item.id} className="flex gap-4 relative group">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight pr-6">{item.name}</h3>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors absolute top-0 right-0 bg-white/80 backdrop-blur-sm rounded-full p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {item.variant && (
                            <div className="mt-1">
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm font-medium">
                                {item.variant}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-auto pt-2">
                            <p className="text-[#F26522] font-black text-sm">
                              Rp{item.price.toLocaleString("id-ID")}
                            </p>
                            {/* Counter Quantity */}
                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                              <button 
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-gray-900 h-7 flex items-center justify-center bg-white">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-white shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)] relative z-20">
            <div className="flex justify-between items-end mb-4">
              <span className="text-gray-500 font-medium text-sm">Total Belanja</span>
              <div className="text-right">
                <span className="text-2xl font-black text-[#F26522] leading-none">
                  Rp{getTotalPrice().toLocaleString("id-ID")}
                </span>
                <div className="text-[10px] text-gray-400 mt-1">Belum termasuk ongkos kirim</div>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-gradient-to-r from-[#F26522] to-[#FF8C00] hover:from-[#d95a1e] hover:to-[#e67e00] text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 group"
            >
              Checkout Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
