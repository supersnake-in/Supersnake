'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  Shield,
  Bell,
  Sliders,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store';

const ACCOUNT_NAV = [
  { href: '/account', label: 'OVERVIEW', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'ORDERS', icon: Package },
  { href: '/account/wishlist', label: 'WISHLIST', icon: Heart },
  { href: '/account/addresses', label: 'ADDRESSES', icon: MapPin },
  { href: '/account/profile', label: 'PROFILE', icon: User },
  { href: '/account/security', label: 'SECURITY', icon: Shield },
  { href: '/account/notifications', label: 'NOTIFICATIONS', icon: Bell },
  { href: '/account/preferences', label: 'PREFERENCES', icon: Sliders },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { orders, wishlist } = useStore();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Patron';
  const displayEmail = profile?.email || user?.email || 'patron@supersnake.in';
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const tierStatus =
    orders.length > 0
      ? totalSpent >= 5000
        ? 'VIP INSTINCT MEMBER'
        : 'ATELIER MEMBER'
      : 'GUEST PATRON';

  return (
    <div className="bg-black text-white min-h-screen pt-28 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Account Header */}
        <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
                PATRON PORTAL
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-white/10 text-neutral-300 rounded border border-white/10 tracking-widest">
                {tierStatus}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
              MY ACCOUNT
            </h1>
            <p className="text-xs font-mono text-neutral-400 flex items-center gap-2">
              <span className="text-white font-medium">{displayName}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400">{displayEmail}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="text-xs font-mono text-neutral-400 hover:text-snake-green transition-colors uppercase flex items-center gap-1.5"
            >
              <span>CONTINUE SHOPPING</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Account Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 bg-[#0a0a0a] border border-white/10 p-3 rounded-sm space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-neutral-500 uppercase border-b border-white/5 mb-1">
              NAVIGATION
            </div>
            {ACCOUNT_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              let badge = null;
              if (item.href === '/account/orders' && orders.length > 0) {
                badge = orders.length;
              } else if (item.href === '/account/wishlist' && wishlist.length > 0) {
                badge = wishlist.length;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-neutral-900 text-snake-green font-semibold border-l-2 border-snake-green shadow-[0_0_12px_rgba(4,252,33,0.15)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </div>
                  {badge !== null && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-snake-green text-black font-bold'
                          : 'bg-white/10 text-neutral-400'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-white/5">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-mono tracking-wider text-neutral-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
              >
                <LogOut size={15} />
                <span>SIGN OUT</span>
              </button>
            </div>
          </aside>

          {/* Subroute Active Content */}
          <main className="lg:col-span-3 min-h-[500px]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
