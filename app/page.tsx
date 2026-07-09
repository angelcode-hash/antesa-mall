import prisma from "@/lib/prisma";
import Link from 'next/link';
import { Tag, Sparkles, Percent, Truck, SearchX, ShoppingBag, ChevronRight, Zap, Store } from 'lucide-react';

export default async function Home({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params?.q || '';

  const products = await prisma.product.findMany({
    where: query ? {
      name: {
        contains: query,
      }
    } : undefined,
    include: { store: true }
  });

  return (
    <main className="min-h-screen bg-[#F4F6F8] pb-16 flex flex-col items-center">
      {/* Premium Hero Section */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#111827] pt-12 pb-24 px-4 shadow-2xl">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F26522]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-orange-400 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4 fill-orange-400" />
              <span>Promo Spesial Hari Ini</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400 mb-6 tracking-tight leading-tight">
              Belanja Cerdas,<br/>Gaya Tanpa Batas.
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl mb-8 leading-relaxed">
              Temukan koleksi premium dengan harga terbaik. Nikmati kemudahan berbelanja dengan Gratis Ongkir ke seluruh Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link href="#rekomendasi" className="px-8 py-3.5 bg-gradient-to-r from-[#F26522] to-[#FF7A00] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all w-full sm:w-auto text-center">
                Mulai Belanja
              </Link>
              <button className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl backdrop-blur-md transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                Lihat Promo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Right Side Illustration/Image - We can use a nice composition */}
          <div className="flex-1 relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1000" alt="Hero" className="w-full h-[400px] object-cover rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700" />
            <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl z-20 shadow-xl flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">🎉</div>
              <div>
                <p className="text-white font-bold text-sm">Diskon hingga 90%</p>
                <p className="text-gray-300 text-xs">Untuk pengguna baru</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories - Sleek glassmorphism */}
      {!query && (
        <div className="w-full max-w-6xl px-4 -mt-12 relative z-20 mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Sparkles, label: 'Paling Laris', color: 'text-purple-600', bg: 'bg-purple-100' },
              { icon: Tag, label: 'Flash Sale', color: 'text-orange-600', bg: 'bg-orange-100' },
              { icon: Percent, label: 'Cashback', color: 'text-green-600', bg: 'bg-green-100' },
              { icon: Truck, label: 'Gratis Ongkir', color: 'text-blue-600', bg: 'bg-blue-100' }
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <cat.icon className={`w-7 h-7 ${cat.color}`} />
                </div>
                <span className="text-sm font-bold text-gray-700">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Section Header */}
      <div id="rekomendasi" className="w-full max-w-6xl px-4 mb-8 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {query ? `Hasil Pencarian: "${query}"` : 'Rekomendasi Terbaik'}
            <div className="w-12 h-1.5 bg-gradient-to-r from-[#F26522] to-orange-300 mt-2 rounded-full"></div>
          </h2>
        </div>
      </div>

      {/* Product Grid */}
      <div className="w-full max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col group overflow-hidden border border-gray-100 relative">
            
            {/* Discount Badge */}
            <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
              SALE
            </div>

            {/* Image Container with overlay */}
            <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-gray-300" />
                </div>
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300"></div>
            </div>
            
            {/* Content Container */}
            <div className="p-4 flex flex-col flex-1 bg-white relative z-10">
              <h2 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[40px] mb-3 group-hover:text-[#F26522] transition-colors">
                {product.name}
              </h2>
              
              <div className="mt-auto flex flex-col gap-1.5">
                <div className="flex items-end gap-2">
                  <span className="text-[#F26522] font-black text-lg">
                    Rp{product.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-gray-400 line-through mb-1">
                    Rp{(product.price * 1.5).toLocaleString("id-ID")}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                    <Store className="w-3 h-3" />
                    {/* @ts-ignore */}
                    <span className="line-clamp-1">{product.store?.name || 'Antesa Store'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                    <span className="text-yellow-400">★</span> 4.9
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-10 p-12 bg-white/50 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm w-full max-w-2xl text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <SearchX className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Oops! Kosong nih.</h3>
          <p className="text-gray-500 text-base max-w-md">
            Maaf, kami tidak dapat menemukan produk yang sesuai dengan pencarian Anda. Coba kata kunci lain?
          </p>
          {query && (
            <Link href="/" className="mt-6 px-8 py-3 bg-[#F26522] text-white rounded-xl font-bold hover:bg-[#d95a1e] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Jelajahi Semua Produk
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
