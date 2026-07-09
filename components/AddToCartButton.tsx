'use client';

import { useCartStore } from '@/lib/store';
import { ShoppingCart, Plus, Minus, Zap, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    storeId: string;
    options?: string | null;
    store?: {
      name: string;
    };
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, setIsOpen } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  // Parse options
  const options = useMemo<{name: string, values: string[]}[]>(() => {
    if (!product.options) return [];
    try {
      return JSON.parse(product.options);
    } catch (e) {
      return [];
    }
  }, [product.options]);

  // State to hold selected values: { "Warna": "Merah", "Ukuran": "L" }
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    options.forEach(opt => {
      if (opt.values.length > 0) {
        initial[opt.name] = opt.values[0]; // Select first by default
      }
    });
    return initial;
  });

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  const getVariantString = () => {
    if (Object.keys(selectedOptions).length === 0) return '';
    return Object.entries(selectedOptions)
      .map(([key, value]) => `${value}`)
      .join(', ');
  };

  const handleAdd = () => {
    const variantStr = getVariantString();
    addItem({
      id: `${product.id}-${variantStr}`, // Unique ID for variant
      productId: product.id,
      name: variantStr ? `${product.name} - ${variantStr}` : product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: quantity,
      variant: variantStr,
      storeId: product.storeId,
      storeName: product.store?.name || 'Unknown Store'
    });
    
    setIsAdded(true);
    setIsOpen(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const variantStr = getVariantString();
    addItem({
      id: `${product.id}-${variantStr}`,
      productId: product.id,
      name: variantStr ? `${product.name} - ${variantStr}` : product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: quantity,
      variant: variantStr,
      storeId: product.storeId,
      storeName: product.store?.name || 'Unknown Store'
    });
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Varian Dinamis */}
      {options.map((opt) => (
        <div key={opt.name}>
          <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">Pilih {opt.name}</h4>
          <div className="flex gap-2 flex-wrap">
            {opt.values.map((val) => {
              const isSelected = selectedOptions[opt.name] === val;
              return (
                <button
                  key={val}
                  onClick={() => handleOptionSelect(opt.name, val)}
                  className={`relative px-4 py-2 border rounded-xl text-sm font-bold transition-all duration-300 ${
                    isSelected 
                      ? 'border-[#F26522] text-[#F26522] bg-orange-50 shadow-sm' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#F26522] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  {val}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Kuantitas */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm">Kuantitas</h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="w-14 text-center font-bold text-gray-900 text-sm">
              {quantity}
            </div>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500 font-medium ml-2">Tersedia &gt; 100 stok</span>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button 
          onClick={handleAdd}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm border-2 ${
            isAdded 
              ? 'border-green-500 bg-green-50 text-green-600' 
              : 'border-[#F26522] text-[#F26522] hover:bg-orange-50 bg-white'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5" />
              Ditambahkan!
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Masukkan Keranjang
            </>
          )}
        </button>
        
        <button 
          onClick={handleBuyNow}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#F26522] to-[#FF8C00] hover:from-[#d95a1e] hover:to-[#e67e00] shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Zap className="w-5 h-5" />
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
