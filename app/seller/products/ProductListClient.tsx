'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductListClient({ products }: { products: any[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="p-4 font-bold text-gray-600 text-sm">Produk</th>
            <th className="p-4 font-bold text-gray-600 text-sm">Harga</th>
            <th className="p-4 font-bold text-gray-600 text-sm text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: any) => (
            <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">{product.description}</div>
                  </div>
                </div>
              </td>
              <td className="p-4 font-bold text-[#F26522] text-sm">
                Rp{product.price.toLocaleString('id-ID')}
              </td>
              <td className="p-4 flex items-center justify-end gap-2">
                <Link href={`/seller/products/edit/${product.id}`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => handleDelete(product.id)}
                  disabled={isDeleting === product.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {isDeleting === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
