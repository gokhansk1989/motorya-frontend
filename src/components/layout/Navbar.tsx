'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Bell, Heart, Plus, User, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="font-bold text-xl text-orange-500 shrink-0">Motorya</Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kask, eldiven, bot ara…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto">
          {user ? (
            <>
              <Link href="/bildirimler" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
                <Bell className="w-5 h-5" />
              </Link>
              <Link href="/favoriler" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/ilan-ver" className="ml-1 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> İlan Ver
              </Link>
              <div className="relative group ml-1">
                <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100">
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
                    : <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">{user.displayName[0]}</div>
                  }
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/profilim" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"><User className="w-4 h-4" /> Profilim</Link>
                  <Link href="/ilanlarim" className="block px-4 py-2 text-sm hover:bg-gray-50">İlanlarım</Link>
                  <Link href="/tekliflerim" className="block px-4 py-2 text-sm hover:bg-gray-50">Tekliflerim</Link>
                  <hr className="my-1" />
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">Çıkış Yap</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/giris" className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl">Giriş Yap</Link>
              <Link href="/kayit" className="px-3 py-1.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors">Kayıt Ol</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
