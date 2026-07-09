'use client';

import { useCartStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapPin, Truck, CreditCard, ChevronRight, CheckCircle2, Plus, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isNewAddressMode, setIsNewAddressMode] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState({ id: 'reguler', price: 15000, name: 'Reguler (2-3 Hari)' });
  const [selectedPayment, setSelectedPayment] = useState('transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  // New Address Form State
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrFull, setNewAddrFull] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLat, setNewAddrLat] = useState<number | null>(null);
  const [newAddrLng, setNewAddrLng] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (items.length === 0 && !isProcessing) {
      router.push('/');
    }
  }, [items, router, isProcessing, status]);

  useEffect(() => {
    if (session) {
      fetch('/api/user/addresses')
        .then(res => res.json())
        .then(data => {
          setAddresses(data);
          if (data.length > 0) {
            setSelectedAddress(data[0]);
          }
        });
    }
  }, [session]);

  if (!mounted || status === 'loading' || (items.length === 0 && !isProcessing)) return null;

  const uniqueStoreIds = new Set(items.map(item => item.storeId)).size || 1;
  const subtotal = getTotalPrice();
  const adminFee = (selectedPayment === 'cod' ? 5000 : 2500) * uniqueStoreIds;
  const totalShipping = selectedShipping.price * uniqueStoreIds;
  const total = subtotal + totalShipping + adminFee;

  const shippingOptions = [
    { id: 'reguler', price: 15000, name: 'Reguler (2-3 Hari)' },
    { id: 'kargo', price: 35000, name: 'Kargo (5-7 Hari)' },
    { id: 'instan', price: 50000, name: 'Instan (2-3 Jam)' },
  ];

  const paymentMethods = [
    { id: 'transfer', name: 'Transfer Bank (BCA, Mandiri, BNI)' },
    { id: 'ewallet', name: 'E-Wallet (GoPay, OVO, Dana)' },
    { id: 'cc', name: 'Kartu Kredit / Debit' },
    { id: 'cod', name: 'COD (Bayar di Tempat)' },
  ];

  const handleSaveNewAddress = async () => {
    if (!newAddrTitle || !newAddrFull || !newAddrPhone || !newAddrLat || !newAddrLng) {
      alert("Harap lengkapi semua data dan pin lokasi di peta");
      return;
    }
    const res = await fetch('/api/user/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newAddrTitle,
        fullAddress: newAddrFull,
        phone: newAddrPhone,
        lat: newAddrLat,
        lng: newAddrLng
      })
    });
    if (res.ok) {
      const saved = await res.json();
      setAddresses([...addresses, saved]);
      setSelectedAddress(saved);
      setIsNewAddressMode(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Pilih alamat pengiriman terlebih dahulu!");
      return;
    }
    setIsProcessing(true);

    const addressData = {
      addressName: session?.user?.name,
      addressPhone: selectedAddress.phone,
      addressDetail: `${selectedAddress.title} - ${selectedAddress.fullAddress}`
    };

    localStorage.setItem('lastOrder', JSON.stringify(addressData));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        totalAmount: total,
        shippingCost: selectedShipping.price, // We pass base shipping price, backend handles per-store logic
        adminFee: selectedPayment === 'cod' ? 5000 : 2500, // Pass base admin fee, backend handles per-store logic
        shippingOpt: selectedShipping.name,
        paymentMethod: paymentMethods.find(p => p.id === selectedPayment)?.name,
        addressData
      })
    });

    if (res.ok) {
      const savedOrder = await res.json();
      clearCart();
      router.push(`/success?orderId=${savedOrder.id}`);
    } else {
      alert("Gagal membuat pesanan");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-32">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Checkout Pesanan</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Alamat Pengiriman */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500"></div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-[#F26522] font-black">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl text-gray-900">Alamat Pengiriman</h2>
            </div>
            <button 
              onClick={() => setIsAddressModalOpen(true)}
              className="text-[#F26522] font-bold text-sm bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              Ubah Alamat
            </button>
          </div>
          
          <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100">
            {selectedAddress ? (
              <div>
                <p className="font-bold text-gray-900 text-lg mb-2">{session?.user?.name} <span className="font-medium text-gray-500 text-sm ml-2">({selectedAddress.phone})</span></p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  <span className="bg-white border border-gray-200 shadow-sm text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold mr-2">{selectedAddress.title}</span>
                  {selectedAddress.fullAddress}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <MapPin className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-gray-500 font-medium">Belum ada alamat pengiriman. Silakan tambah alamat.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Alamat */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-black text-xl text-gray-900">{isNewAddressMode ? 'Tambah Alamat Baru' : 'Pilih Alamat'}</h3>
                <button onClick={() => { setIsAddressModalOpen(false); setIsNewAddressMode(false); }} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors font-bold">&times;</button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                {isNewAddressMode ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Label Alamat</label>
                      <input type="text" placeholder="Rumah / Kantor" value={newAddrTitle} onChange={e => setNewAddrTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 focus:bg-white focus:border-[#F26522] rounded-xl outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nomor Telepon</label>
                      <input type="tel" placeholder="081234567890" value={newAddrPhone} onChange={e => setNewAddrPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 focus:bg-white focus:border-[#F26522] rounded-xl outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Alamat Lengkap</label>
                      <textarea placeholder="Nama Jalan, Gedung, RT/RW..." value={newAddrFull} onChange={e => setNewAddrFull(e.target.value)} className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 focus:bg-white focus:border-[#F26522] rounded-xl outline-none transition-colors h-28 resize-none" />
                    </div>
                    <div className="z-0 mb-4">
                      <p className="text-sm font-bold text-gray-700 mb-1.5">Pin Lokasi (Peta)</p>
                      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <MapPicker onLocationSelect={(lat, lng) => { setNewAddrLat(lat); setNewAddrLng(lng); }} />
                      </div>
                    </div>
                    <button onClick={handleSaveNewAddress} className="w-full py-3.5 bg-gradient-to-r from-[#F26522] to-[#FF8C00] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">Simpan Alamat</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} onClick={() => { setSelectedAddress(addr); setIsAddressModalOpen(false); }} className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-[#F26522] bg-orange-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-white border border-gray-200 shadow-sm text-gray-700 px-3 py-1 rounded-md text-xs font-bold inline-block">{addr.title}</span>
                          {selectedAddress?.id === addr.id && <CheckCircle2 className="w-5 h-5 text-[#F26522]" />}
                        </div>
                        <p className="font-bold text-gray-900 mb-1">{session?.user?.name} <span className="font-medium text-gray-500">({addr.phone})</span></p>
                        <p className="text-sm text-gray-600 leading-relaxed">{addr.fullAddress}</p>
                      </div>
                    ))}
                    <button onClick={() => setIsNewAddressMode(true)} className="w-full p-5 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 flex justify-center items-center gap-2 hover:bg-gray-50 hover:text-[#F26522] hover:border-[#F26522] transition-colors font-bold mt-2">
                      <Plus className="w-5 h-5" /> Tambah Alamat Baru
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Produk */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="font-black text-xl text-gray-900">Produk Dipesan</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-2 text-sm mb-1">{item.name}</h3>
                  {item.variant && (
                    <span className="inline-block text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm font-medium mb-1">
                      {item.variant}
                    </span>
                  )}
                  <p className="text-sm text-gray-500 font-medium">{item.quantity} barang x Rp{item.price.toLocaleString('id-ID')}</p>
                </div>
                <div className="font-black text-gray-900 whitespace-nowrap ml-2">
                  Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opsi Pengiriman */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-green-500" />
            </div>
            <h2 className="font-black text-xl text-gray-900">Opsi Pengiriman</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shippingOptions.map(opt => (
              <div 
                key={opt.id}
                onClick={() => setSelectedShipping(opt)}
                className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all ${selectedShipping.id === opt.id ? 'border-[#F26522] bg-orange-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
              >
                {selectedShipping.id === opt.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#F26522] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="font-bold text-gray-900 mb-1">{opt.name}</div>
                <div className="text-[#F26522] font-black">Rp{opt.price.toLocaleString('id-ID')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="font-black text-xl text-gray-900">Metode Pembayaran</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentMethods.map(opt => (
              <div 
                key={opt.id}
                onClick={() => setSelectedPayment(opt.id)}
                className={`p-5 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${selectedPayment === opt.id ? 'border-[#F26522] bg-orange-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
              >
                <span className="font-bold text-sm text-gray-800">{opt.name}</span>
                {selectedPayment === opt.id && <CheckCircle2 className="w-5 h-5 text-[#F26522]" />}
              </div>
            ))}
          </div>
        </div>

        {/* Rincian Pembayaran */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8">
          <h2 className="font-black text-xl text-gray-900 mb-6">Rincian Pembayaran</h2>
          <div className="flex flex-col gap-3 text-gray-600">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal Produk</span>
              <span className="font-bold text-gray-900">Rp{subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Ongkos Kirim ({uniqueStoreIds} Toko)</span>
              <span className="font-bold text-gray-900">Rp{totalShipping.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Biaya Layanan {selectedPayment === 'cod' ? '(COD)' : ''}</span>
              <span className="font-bold text-gray-900">Rp{adminFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t-2 border-dashed border-gray-200 mt-4 pt-6 flex justify-between items-center">
              <span className="font-black text-gray-900 text-lg">Total Pembayaran</span>
              <span className="font-black text-3xl text-[#F26522]">Rp{total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Sticky Checkout */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-40 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <span className="text-sm text-gray-500 font-bold block mb-0.5">Total Pembayaran</span>
            <span className="font-black text-3xl text-[#F26522] leading-none">Rp{total.toLocaleString('id-ID')}</span>
          </div>
          <button 
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className={`flex-1 sm:flex-none sm:w-72 py-4 bg-gradient-to-r from-[#F26522] to-[#FF8C00] hover:from-[#d95a1e] hover:to-[#e67e00] text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 group ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Buat Pesanan
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
