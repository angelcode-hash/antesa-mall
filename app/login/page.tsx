'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (res?.error) {
      setError('Email atau password salah');
    } else {
      router.push('/');
      router.refresh();
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
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Selamat Datang Kembali</h2>
            <p className="text-gray-300 text-sm">Masuk untuk melanjutkan belanja di Antesa Mall</p>
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
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#F26522] transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F26522] focus:bg-white/10 transition-all"
                  placeholder="Kata Sandi"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-300">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-[#F26522] focus:ring-[#F26522] focus:ring-offset-gray-900 mr-2" />
                Ingat saya
              </label>
              <a href="#" className="font-medium text-[#F26522] hover:text-[#ff8c00] transition-colors">Lupa sandi?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-4 bg-gradient-to-r from-[#F26522] to-[#FF8C00] hover:from-[#d95a1e] hover:to-[#e67e00] text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-white hover:text-[#F26522] transition-colors">
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
