import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SearchX, ShoppingBag, Store, MapPin, Star } from "lucide-react";

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // @ts-ignore
  const store = await prisma.store.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      products: {
        orderBy: { createdAt: 'desc' }
      },
      user: {
        select: { name: true }
      }
    }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-16">
      {/* Store Header Banner */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 relative">
        <div className="h-48 w-full bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
          {/* Abstract blobs for banner */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px]"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row gap-6 -mt-12 md:-mt-16 pb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-2 shadow-xl border-2 border-white relative z-10 flex-shrink-0 mx-auto md:mx-0">
              <div className="w-full h-full bg-gradient-to-br from-[#F26522] to-[#FF8C00] rounded-full flex items-center justify-center text-white font-black text-4xl shadow-inner">
                {store.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left mt-2 md:mt-16 flex flex-col justify-center">
              <h1 className="text-3xl font-black text-gray-900">{store.name}</h1>
              <p className="text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-1.5">
                <Store className="w-4 h-4" /> Official Store
              </p>
            </div>
            
            <div className="flex items-end justify-center md:justify-end gap-6 mt-4 md:mt-16 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
              <div className="text-center md:text-right">
                <div className="text-2xl font-black text-gray-900">{store.products.length}</div>
                <div className="text-xs font-bold text-gray-500">Produk</div>
              </div>
              <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
              <div className="text-center md:text-right">
                <div className="text-2xl font-black text-gray-900 flex items-center justify-center md:justify-end gap-1">4.9 <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /></div>
                <div className="text-xs font-bold text-gray-500">Penilaian</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Description & Products */}
      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Info */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Tentang Toko</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {store.description || "Toko ini belum menambahkan deskripsi."}
            </p>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Jakarta Pusat</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Store className="w-4 h-4 text-gray-400" />
                <span>Bergabung sejak {new Date(store.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100">
            <h2 className="font-black text-xl text-gray-900">Etalase Toko</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {store.products.map((product: any) => (
              <Link href={`/product/${product.id}`} key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group border border-gray-100 overflow-hidden">
                <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-gray-300" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[40px] mb-2 group-hover:text-[#F26522] transition-colors">{product.name}</h3>
                  <div className="mt-auto flex items-end gap-2">
                    <span className="text-[#F26522] font-black text-base">Rp{product.price.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {store.products.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-4 p-12 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <SearchX className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Toko ini masih kosong</h3>
              <p className="text-gray-500 text-sm">Penjual belum menambahkan produk apa pun ke tokonya.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
