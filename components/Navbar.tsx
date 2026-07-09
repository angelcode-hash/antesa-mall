'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { items, setIsOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    } else {
      router.push(`/`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Mobile Menu Button */}
          <button 
            className="sm:hidden p-2 text-gray-600 hover:text-[#F26522] transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F26522] to-[#FF8C00] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              A
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Antesa Mall
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="flex-1 max-w-2xl hidden sm:flex">
            <form onSubmit={handleSearch} className="relative w-full flex items-center group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk impianmu..." 
                className="w-full h-11 pl-5 pr-12 bg-gray-50 hover:bg-gray-100/80 border border-transparent rounded-xl outline-none text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#F26522]/30 focus:ring-4 focus:ring-[#F26522]/10 transition-all duration-300"
              />
              <button type="submit" className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-[#F26522] hover:shadow-sm text-gray-500 transition-all">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="hidden sm:flex items-center gap-3 mr-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Link href="/seller" className="flex items-center gap-2 group mr-2 px-2 border-r border-gray-200">
                  <span className="text-sm font-bold text-gray-600 group-hover:text-[#F26522] transition-colors">Toko Saya</span>
                </Link>
                <Link href="/orders" className="flex items-center gap-2 group mr-2 px-2 border-r border-gray-200">
                  <span className="text-sm font-bold text-gray-600 group-hover:text-[#F26522] transition-colors">Pesanan</span>
                </Link>
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:shadow-md transition-shadow">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#F26522] transition-colors">{session.user?.name?.split(' ')[0]}</span>
                </Link>
                <div className="w-px h-4 bg-gray-200"></div>
                <button onClick={() => signOut()} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">Keluar</button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#F26522] bg-orange-50 hover:bg-orange-100 px-5 py-2 rounded-xl transition-colors mr-2">
                Masuk
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-xl hover:bg-orange-50 text-gray-600 hover:text-[#F26522] transition-all flex items-center gap-2 group flex-shrink-0"
            >
              <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white transform group-hover:scale-110 transition-transform">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 sm:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-50 transform transition-transform duration-300 ease-out shadow-2xl sm:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-[#F26522] to-[#FF8C00] text-white rounded-lg flex items-center justify-center font-black text-lg">
              A
            </div>
            <span className="font-extrabold text-lg text-gray-900">Antesa Mall</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <form onSubmit={handleSearch} className="relative w-full flex items-center">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..." 
              className="w-full h-11 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-[#F26522] focus:ring-2 focus:ring-[#F26522]/20"
            />
            <button type="submit" className="absolute right-2 p-2 text-gray-500">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-2">
            {session ? (
              <>
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3 px-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 font-medium hover:bg-orange-50 hover:text-[#F26522] rounded-xl transition-colors">
                  Profil Saya
                </Link>
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 font-medium hover:bg-orange-50 hover:text-[#F26522] rounded-xl transition-colors">
                  Pesanan Saya
                </Link>
                <Link href="/seller" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 font-medium hover:bg-orange-50 hover:text-[#F26522] rounded-xl transition-colors">
                  Toko Saya
                </Link>
              </>
            ) : (
              <div className="pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-3 px-4 bg-[#F26522] text-white font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-transform">
                  Masuk / Daftar
                </Link>
              </div>
            )}
          </div>
        </div>

        {session && (
          <div className="p-4 border-t border-gray-100">
            <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full py-3 px-4 flex justify-center text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              Keluar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

