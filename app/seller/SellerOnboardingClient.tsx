'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, Loader2 } from 'lucide-react';

export default function SellerOnboardingClient() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, location })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat toko');
      }

      router.push('/seller/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      <div className="p-8 md:p-12 text-center border-b border-gray-100">
        <div className="w-20 h-20 bg-gradient-to-br from-[#F26522] to-[#FF8C00] rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6 rotate-3">
          <Store className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Mulai Berjualan Sekarang!</h1>
        <p className="text-gray-500 max-w-md mx-auto">Buat tokomu secara gratis, jangkau jutaan pembeli, dan tingkatkan pendapatanmu hari ini juga.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-bold text-gray-900 mb-2 block">Nama Toko <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Toko Elektronik Maju"
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] transition-all font-medium"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-900 mb-2 block">Lokasi Toko <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Contoh: Jakarta Selatan"
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] transition-all font-medium"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-900 mb-2 block">Deskripsi Singkat (Opsional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ceritakan sedikit tentang toko dan produk yang Anda jual..."
            rows={4}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] transition-all font-medium resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="mt-4 w-full bg-[#F26522] hover:bg-[#d95a1e] text-white rounded-xl py-4 font-bold transition-all shadow-lg shadow-[#F26522]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Buka Toko Gratis
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
