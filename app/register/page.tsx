'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, User, Zap, Phone } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
      }),
    });

    setIsLoading(false);

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.message || 'Terjadi kesalahan saat mendaftar');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden p-4">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#F26522]/30 to-orange-500/20 blur-[100px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-blue-500/20 to-purple-500/20 blur-[120px] mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 md:p-10 rounded-[2rem] shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F26522] to-[#FF8C00] shadow-lg shadow-orange-500/30 mb-4 transform -rotate-3">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Buat Akun Baru</h2>
            <p className="text-gray-300 text-sm">Bergabunglah dan nikmati pengalaman belanja terbaik</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm font-medium flex items-center justify-center">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#F26522] transition-colors" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F26522] focus:bg-white/10 transition-all"
                  placeholder="Nama Lengkap"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#F26522] transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F26522] focus:bg-white/10 transition-all"
                  placeholder="Alamat Email"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[#F26522] transition-colors" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F26522] focus:bg-white/10 transition-all"
                  placeholder="Nomor Telepon (WhatsApp)"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#F26522] transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F26522] focus:bg-white/10 transition-all"
                  placeholder="Kata Sandi (Min 6 Karakter)"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-4 bg-gradient-to-r from-[#F26522] to-[#FF8C00] hover:from-[#d95a1e] hover:to-[#e67e00] text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 group mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-white hover:text-[#F26522] transition-colors">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
