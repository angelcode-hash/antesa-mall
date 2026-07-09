import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Star, User, ShoppingBag, Store } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';

// Menghindari error tipe jika schema diubah
type ProductType = any; 

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // 1. Cari produk di database
  const product = await prisma.product.findUnique({
    where: {
      id: resolvedParams.id
    },
    include: {
      store: true,
      orderItems: {
        where: { order: { status: { in: ['PACKED', 'SHIPPED', 'DELIVERED'] } } }
      },
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  // Hitung jumlah terjual asli
  const realSoldCount = product.orderItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
  
  // Hitung rating asli
  const totalReviews = product.reviews.length;
  const averageRating = totalReviews > 0 
    ? (product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  // Rekomendasi Produk Asli dari Database (Kecuali produk ini)
  const recommendations = await prisma.product.findMany({
    where: { NOT: { id: product.id } },
    include: { store: true },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-24">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-[#F26522] font-medium transition-colors">Beranda</Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col md:flex-row mb-8">
          {/* Bagian Kiri: Gambar (Sticky) */}
          <div className="md:w-[40%] relative bg-[#F8F9FA] border-r border-gray-100">
            <div className="sticky top-28 p-8 md:p-12 flex items-center justify-center min-h-[400px]">
              {/* Background Blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative w-full aspect-square max-w-[400px] mx-auto rounded-2xl overflow-hidden shadow-2xl group">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                    <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                    <span className="font-medium">Belum ada foto</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bagian Kanan: Info Produk (Scrollable) */}
          <div className="p-8 md:p-10 md:w-[60%] flex flex-col relative bg-white">
            <div className="flex gap-2 mb-4">
              <span className="bg-gradient-to-r from-[#F26522] to-[#FF8C00] text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                OFFICIAL MALL
              </span>
              <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-100">
                100% ORIGINAL
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2 tracking-tight">
              {product.name}
            </h1>
            
            {/* Store Link */}
            {product.store && (
              <Link href={`/shop/${product.store.slug}`} className="flex items-center gap-2 mb-4 w-fit px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors">
                <Store className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-bold text-gray-700">{product.store.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            )}

            {/* Statistik Rating & Terjual Asli */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center text-yellow-500 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100">
                <span className="font-bold mr-1.5">{averageRating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(Number(averageRating)) ? 'fill-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <div className="text-gray-500"><span className="font-bold text-gray-900">{totalReviews}</span> Penilaian</div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
              <div className="text-gray-500"><span className="font-bold text-gray-900">{realSoldCount > 0 ? realSoldCount : '0'}</span> Terjual</div>
            </div>

            {/* Harga */}
            <div className="mb-8">
              <div className="flex items-end gap-3">
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F26522] to-[#FF8C00]">
                  Rp{product.price.toLocaleString('id-ID')}
                </div>
                <div className="text-lg text-gray-400 line-through font-medium mb-1.5">
                  Rp{(product.price * 1.5).toLocaleString('id-ID')}
                </div>
                <div className="bg-red-100 text-red-600 text-xs font-black px-2 py-1 rounded-md mb-2">
                  33% OFF
                </div>
              </div>
            </div>

            {/* Client Component: Tombol Add to Cart (Includes Variants & Quantity) */}
            <div className="mb-8 p-6 bg-[#F8F9FA] rounded-2xl border border-gray-100">
              <AddToCartButton product={product as any} />
            </div>

            {/* Garansi & Pengiriman */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-gray-900">Garansi 100% Ori</div>
                  <div className="text-xs text-gray-500 mt-0.5">Atau uang kembali 2x lipat</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100/50">
                <RotateCcw className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-gray-900">Retur 7 Hari</div>
                  <div className="text-xs text-gray-500 mt-0.5">Bebas pengembalian</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100/50 sm:col-span-2">
                <Truck className="w-5 h-5 text-[#F26522] mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-gray-900">Gratis Ongkir</div>
                  <div className="text-xs text-gray-500 mt-0.5">Minimal belanja Rp50.000, pengiriman cepat dan aman.</div>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="mt-4 pt-8 border-t border-gray-100">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                Deskripsi Produk
              </h3>
              <div className="text-gray-600 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                {product.description}
              </div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ulasan Asli dari Database */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-black text-gray-900">
                  Ulasan Pembeli
                </h2>
                <div className="text-sm font-bold text-[#F26522] bg-orange-50 px-4 py-2 rounded-full">
                  {totalReviews} Ulasan
                </div>
              </div>
              
              <div className="flex flex-col gap-6">
                {product.reviews.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-gray-500 font-medium">Jadilah yang pertama mengulas produk ini!</p>
                  </div>
                ) : (
                  product.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{review.user?.name ? review.user.name.charAt(0) + '*****' : 'Anonim'}</div>
                          <div className="flex text-yellow-500 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-500' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="ml-auto text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                          {new Date(review.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm ml-13 pl-13">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Rekomendasi Produk */}
          <div className="lg:col-span-1">
            {recommendations.length > 0 && (
              <div className="sticky top-32">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-gray-900">Pilihan Lainnya</h2>
                  <Link href="/" className="text-[#F26522] text-sm font-bold hover:underline flex items-center group">
                    Lihat <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="flex flex-col gap-4">
                  {recommendations.map((rec: any) => (
                    <Link href={`/product/${rec.id}`} key={rec.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-[#F26522]/30 hover:shadow-lg transition-all group flex h-28">
                      <div className="w-28 h-full bg-gray-50 overflow-hidden flex-shrink-0 relative">
                        {rec.imageUrl ? (
                          <img src={rec.imageUrl} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-gray-300"/></div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-1 justify-center">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-[#F26522] transition-colors">{rec.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5 mb-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded w-fit border border-gray-100">
                           <Store className="w-3 h-3" /> <span className="line-clamp-1">{rec.store?.name}</span>
                        </div>
                        <div className="font-black text-[#F26522]">Rp{rec.price.toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-gray-400 line-through mt-0.5">Rp{(rec.price * 1.5).toLocaleString('id-ID')}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
