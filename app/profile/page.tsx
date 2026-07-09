'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, MapPin, Lock, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Profile State
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ title: '', fullAddress: '', phone: '', lat: null as number | null, lng: null as number | null });

  // Security State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (status === 'authenticated') {
      fetchProfileData();
      fetchAddresses();
    }
  }, [status, router]);

  const fetchProfileData = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      if (res.ok) {
        setAddresses(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, phone: profile.phone })
      });
      
      if (res.ok) {
        showMessage('Profil berhasil diperbarui', 'success');
      } else {
        showMessage('Gagal memperbarui profil', 'error');
      }
    } catch (e) {
      showMessage('Terjadi kesalahan server', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showMessage('Konfirmasi sandi tidak cocok', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      });
      
      const data = await res.json();
      if (res.ok) {
        showMessage('Kata sandi berhasil diubah', 'success');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        showMessage(data.message || 'Gagal mengubah kata sandi', 'error');
      }
    } catch (e) {
      showMessage('Terjadi kesalahan server', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.title || !newAddr.fullAddress || !newAddr.phone || !newAddr.lat || !newAddr.lng) {
      showMessage('Lengkapi semua data & pin lokasi', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddr)
      });
      
      if (res.ok) {
        showMessage('Alamat berhasil ditambahkan', 'success');
        setIsAddingAddress(false);
        setNewAddr({ title: '', fullAddress: '', phone: '', lat: null, lng: null });
        fetchAddresses();
      } else {
        showMessage('Gagal menambahkan alamat', 'error');
      }
    } catch (e) {
      showMessage('Terjadi kesalahan server', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Hapus alamat ini?')) return;
    
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('Alamat dihapus', 'success');
        fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true })
      });
      if (res.ok) {
        showMessage('Alamat utama diubah', 'success');
        fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#F26522]/30 border-t-[#F26522] rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-8 pb-32">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Pengaturan Akun</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-[#F26522]/10 to-[#FF8C00]/5 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F26522] to-[#FF8C00] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/30">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h2 className="font-black text-gray-900 truncate">{profile.name || 'Pengguna'}</h2>
                  <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex flex-col p-2">
                <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 w-full p-4 rounded-2xl text-left font-bold transition-all ${activeTab === 'profile' ? 'bg-orange-50 text-[#F26522]' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <User className="w-5 h-5" /> Profil Saya
                </button>
                <button onClick={() => setActiveTab('address')} className={`flex items-center gap-3 w-full p-4 rounded-2xl text-left font-bold transition-all ${activeTab === 'address' ? 'bg-orange-50 text-[#F26522]' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <MapPin className="w-5 h-5" /> Daftar Alamat
                </button>
                <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 w-full p-4 rounded-2xl text-left font-bold transition-all ${activeTab === 'security' ? 'bg-orange-50 text-[#F26522]' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Lock className="w-5 h-5" /> Keamanan
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {message.text && (
              <div className={`p-4 rounded-2xl mb-6 font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-600 text-white text-xs">!</div>}
                {message.text}
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-[#F26522] to-purple-500"></div>
              
              {activeTab === 'profile' && (
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-black text-gray-900 mb-6">Ubah Profil</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-lg">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Email</label>
                      <input type="email" value={profile.email} disabled className="w-full px-4 py-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed" />
                      <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah.</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nama Lengkap</label>
                      <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 focus:bg-white focus:border-[#F26522] rounded-xl outline-none transition-colors" required />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nomor WhatsApp</label>
                      <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 focus:bg-white focus:border-[#F26522] rounded-xl outline-none transition-colors" required />
                    </div>
                    <button type="submit" disabled={isSaving} className="mt-4 px-6 py-3 bg-[#F26522] hover:bg-[#d95a1e] text-white font-bold rounded-xl shadow-sm flex items-center gap-2">
                      <Save className="w-4 h-4" /> Simpan Perubahan
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'address' && (
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-gray-900">Daftar Alamat</h2>
                    {!isAddingAddress && (
                      <button onClick={() => setIsAddingAddress(true)} className="px-4 py-2 bg-orange-50 text-[#F26522] hover:bg-orange-100 font-bold rounded-xl text-sm flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> Tambah Alamat
                      </button>
                    )}
                  </div>

                  {isAddingAddress ? (
                    <form onSubmit={handleAddAddress} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-900">Alamat Baru</h3>
                        <button type="button" onClick={() => setIsAddingAddress(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1.5 block">Label (Cth: Rumah)</label>
                          <input type="text" value={newAddr.title} onChange={e => setNewAddr({ ...newAddr, title: e.target.value })} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 focus:border-[#F26522] rounded-xl outline-none transition-colors" required />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nomor Telepon</label>
                          <input type="tel" value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 focus:border-[#F26522] rounded-xl outline-none transition-colors" required />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Alamat Lengkap</label>
                        <textarea value={newAddr.fullAddress} onChange={e => setNewAddr({ ...newAddr, fullAddress: e.target.value })} className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 focus:border-[#F26522] rounded-xl outline-none transition-colors h-24 resize-none" required />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-1.5 block">Pin Lokasi</label>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <MapPicker onLocationSelect={(lat, lng) => setNewAddr({ ...newAddr, lat, lng })} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsAddingAddress(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-[#F26522] hover:bg-[#d95a1e] text-white font-bold rounded-xl shadow-sm">Simpan Alamat</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {addresses.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">Anda belum menyimpan alamat.</p>
                        </div>
                      ) : (
                        addresses.map((addr) => (
                          <div key={addr.id} className={`p-5 rounded-2xl border-2 transition-all flex flex-col md:flex-row gap-4 justify-between ${addr.isPrimary ? 'border-[#F26522] bg-orange-50/30' : 'border-gray-100 bg-white'}`}>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-black text-gray-900">{addr.title}</span>
                                {addr.isPrimary && <span className="bg-[#F26522] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">Utama</span>}
                              </div>
                              <p className="font-bold text-gray-800 text-sm mb-1">{profile.name} <span className="text-gray-500 font-normal">({addr.phone})</span></p>
                              <p className="text-sm text-gray-600 leading-relaxed max-w-lg">{addr.fullAddress}</p>
                            </div>
                            <div className="flex flex-row md:flex-col items-end gap-2 justify-end">
                              {!addr.isPrimary && (
                                <button onClick={() => handleSetPrimary(addr.id)} className="text-sm font-bold text-[#F26522] hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors border border-orange-100">Jadikan Utama</button>
                              )}
                              <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"><Trash2 className="w-4 h-4"/> Hapus</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-black text-gray-900 mb-6">Ubah Kata Sandi</h2>
                  <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-lg">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Kata Sandi Saat Ini</label>
                      <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 focus:bg-white focus:border-[#F26522] rounded-xl outline-none transition-colors" required />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Kata Sandi Baru</label>
                      <input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 focus:bg-white focus:border-[#F26522] rounded-xl outline-none transition-colors" required minLength={6} />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1.5 block">Konfirmasi Kata Sandi Baru</label>
                      <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 focus:bg-white focus:border-[#F26522] rounded-xl outline-none transition-colors" required minLength={6} />
                    </div>
                    <button type="submit" disabled={isSaving} className="mt-4 px-6 py-3 bg-[#F26522] hover:bg-[#d95a1e] text-white font-bold rounded-xl shadow-sm flex items-center gap-2">
                      <Save className="w-4 h-4" /> Simpan Kata Sandi
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
