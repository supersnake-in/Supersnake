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
  const { user, profile, signOut, isAdmin } = useAuth();
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

  // Dedicated invoice page must NOT render account portal chrome or background
  if (pathname?.includes('/invoice')) {
    return <>{children}</>;
  }

  return (
    <div className="bg-black text-white min-h-screen pt-28 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 font-sans print:bg-white print:text-black print:p-0 print:m-0 print:min-h-0">
      <div className="max-w-7xl mx-auto space-y-10 print:m-0 print:p-0 print:max-w-none print:space-y-0">
        {/* Account Header */}
        <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
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

        {/* Guest Patron Prompt Banner */}
        {!user && (
          <div className="p-4 sm:p-5 bg-white/[0.02] border border-snake-green/30 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-snake-green animate-pulse" />
                <span className="text-[10px] font-mono text-snake-green font-semibold uppercase tracking-wider">
                  GUEST PATRON MODE
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-300">
                Sign in or enroll to sync orders across devices, store delivery addresses, and access private drops.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/login"
                className="px-4 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs font-semibold uppercase tracking-widest transition-colors"
              >
                SIGN IN
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2.5 border border-white/20 hover:border-snake-green hover:text-snake-green text-white font-mono text-xs uppercase tracking-widest transition-colors"
              >
                CREATE ACCOUNT
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Navigation Tab Bar (< lg) */}
        <div className="lg:hidden border-b border-white/10 pb-2 print:hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
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
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-sm text-xs font-mono tracking-wider whitespace-nowrap min-h-[44px] transition-all shrink-0 ${
                    isActive
                      ? 'bg-snake-green/10 text-snake-green font-semibold border border-snake-green/40 shadow-[0_0_10px_rgba(4,252,33,0.15)]'
                      : 'text-neutral-400 hover:text-white bg-[#0a0a0a] border border-white/10'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                  {badge !== null && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
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

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-sm text-xs font-mono tracking-wider whitespace-nowrap min-h-[44px] text-snake-green bg-snake-green/10 border border-snake-green/30 shrink-0 font-semibold"
              >
                <Shield size={14} />
                <span>ADMIN</span>
              </Link>
            )}

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-sm text-xs font-mono tracking-wider whitespace-nowrap min-h-[44px] text-neutral-400 hover:text-red-400 bg-[#0a0a0a] border border-white/10 shrink-0 transition-colors"
              >
                <LogOut size={14} />
                <span>SIGN OUT</span>
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-sm text-xs font-mono tracking-wider whitespace-nowrap min-h-[44px] text-black bg-white hover:bg-snake-green shrink-0 font-semibold transition-colors"
                >
                  <span>SIGN IN</span>
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-sm text-xs font-mono tracking-wider whitespace-nowrap min-h-[44px] text-white border border-white/20 hover:border-snake-green shrink-0 font-semibold transition-colors"
                >
                  <span>SIGN UP</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Account Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start print:block print:m-0 print:p-0">
          {/* Sidebar Navigation (Desktop Locked) */}
          <aside className="hidden lg:block lg:col-span-1 bg-[#0a0a0a] border border-white/10 p-3 rounded-sm space-y-1 print:hidden">
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

            {isAdmin && (
              <div className="pt-2 mt-2 border-t border-white/10">
                <Link
                  href="/admin"
                  className="flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono tracking-wider text-snake-green bg-snake-green/10 border border-snake-green/30 hover:bg-snake-green hover:text-black transition-all font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield size={15} />
                    <span>ADMIN PORTAL</span>
                  </div>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}

            <div className="pt-2 mt-2 border-t border-white/5">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-mono tracking-wider text-neutral-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                >
                  <LogOut size={15} />
                  <span>SIGN OUT</span>
                </button>
              ) : (
                <div className="space-y-2 pt-1">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-snake-green text-black rounded text-xs font-mono tracking-wider font-semibold transition-colors"
                  >
                    <span>SIGN IN</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-white/20 hover:border-snake-green hover:text-snake-green text-white rounded text-xs font-mono tracking-wider transition-colors"
                  >
                    <span>CREATE ACCOUNT</span>
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* Subroute Active Content */}
          <main className="lg:col-span-3 min-h-[500px] print:w-full print:min-h-0 print:m-0 print:p-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
