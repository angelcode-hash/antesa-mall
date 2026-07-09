'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, Plus, X } from 'lucide-react';
import { use } from 'react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [options, setOptions] = useState<{ name: string; values: string[] }[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/seller/products/${resolvedParams.id}`);
        if (!res.ok) throw new Error('Produk tidak ditemukan');
        const product = await res.json();
        
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price.toString());
        setImageUrl(product.imageUrl || '');
        
        if (product.options) {
          try {
            setOptions(JSON.parse(product.options));
          } catch (e) {
            console.error("Error parsing options", e);
          }
        }
      } catch (error) {
        console.error(error);
        alert('Gagal mengambil data produk');
        router.push('/seller/products');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchProduct();
  }, [resolvedParams.id, router]);

  const addOption = () => {
    setOptions([...options, { name: '', values: [] }]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };

  const updateOptionValues = (index: number, valuesStr: string) => {
    const newOptions = [...options];
    newOptions[index].values = valuesStr.split(',').map(v => v.trim()).filter(v => v !== '');
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validOptions = options.filter(opt => opt.name.trim() !== '' && opt.values.length > 0);

      const res = await fetch(`/api/seller/products/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          description, 
          price, 
          imageUrl,
          options: validOptions.length > 0 ? validOptions : null
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Gagal menyimpan produk');
      }

      router.push('/seller/products');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F26522] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/seller/products" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Produk</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden p-8 flex flex-col gap-6">
          
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Foto Produk (URL)</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-gray-900 outline-none focus:border-[#F26522]" 
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Nama Produk</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-gray-900 outline-none focus:border-[#F26522]" 
            />
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Harga (Rp)</label>
            <input 
              type="number" 
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-gray-900 outline-none focus:border-[#F26522]" 
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Deskripsi Produk</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8} 
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl font-medium text-gray-900 outline-none focus:border-[#F26522] resize-none" 
            />
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-gray-700">Varian Produk (Opsional)</label>
              <button 
                type="button" 
                onClick={addOption}
                className="text-xs font-bold text-[#F26522] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Varian
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {options.map((opt, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                  <button 
                    type="button" 
                    onClick={() => removeOption(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-full sm:w-1/3">
                    <input 
                      type="text" 
                      placeholder="Nama Varian (Cth: Warna)"
                      value={opt.name}
                      onChange={(e) => updateOptionName(index, e.target.value)}
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-900 outline-none focus:border-[#F26522]" 
                    />
                  </div>
                  <div className="w-full sm:w-2/3">
                    <input 
                      type="text" 
                      placeholder="Pilihan (pisahkan dengan koma)"
                      value={opt.values.join(', ')}
                      onChange={(e) => updateOptionValues(index, e.target.value)}
                      className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-900 outline-none focus:border-[#F26522]" 
                    />
                  </div>
                </div>
              ))}
              {options.length === 0 && (
                <p className="text-xs text-gray-500 italic">Tidak ada varian. Klik "Tambah Varian" jika pembeli harus memilih ukuran, warna, dll.</p>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#F26522] hover:bg-[#d95a1e] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
