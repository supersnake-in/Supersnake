'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  Star,
  BarChart3,
  Home,
  Settings,
  ArrowUpRight,
  Bell,
  Search,
  Share2,
  Mail,
  ShieldAlert,
  ShoppingCart,
} from 'lucide-react';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, isLoading, isAdmin } = useAuth();
  const { defectReports, abandonedCarts } = useStore();

  const pendingDefectsCount = defectReports.filter(
    (d) => d.status === 'Pending Review'
  ).length;

  const openCartsCount = abandonedCarts.filter(
    (c) => c.status === 'Active' || c.status === 'Abandoned'
  ).length;

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Shirt },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    {
      label: 'Defects Reported',
      href: '/admin/defects',
      icon: ShieldAlert,
      badge: pendingDefectsCount,
    },
    {
      label: 'Abandoned Carts',
      href: '/admin/carts',
      icon: ShoppingCart,
      badge: openCartsCount,
    },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Homepage', href: '/admin/homepage', icon: Home },
    { label: 'Social Media', href: '/admin/social', icon: Share2 },
    { label: 'Membership', href: '/admin/membership', icon: Mail },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // While checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 font-mono text-center">
        <div className="w-8 h-8 border-2 border-snake-green border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-neutral-400 tracking-widest uppercase">
          AUTHENTICATING ATELIER ACCESS...
        </span>
      </div>
    );
  }

  // Strict unauthorized access block
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans text-center">
        <div className="max-w-md space-y-6">
          <div className="flex justify-center mb-2">
            <SuperSnakeLogo size="md" showText={false} withLink={false} />
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-red-500 uppercase block">
            403 // ATELIER ACCESS RESTRICTED
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-medium uppercase tracking-tight text-white">
            UNAUTHORIZED PERSONNEL
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400 leading-relaxed">
            This administration portal is strictly restricted to authorized SuperSnake personnel. Access is limited to authenticated administrative email accounts.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              SIGN IN TO ATELIER
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest transition-colors"
            >
              RETURN TO STOREFRONT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-200 flex font-sans antialiased">
      {/* SaaS Sidebar */}
      <aside className="w-64 bg-[#0d0d0d] border-r border-neutral-800/80 flex flex-col justify-between p-4 hidden md:flex flex-shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="px-2 pt-2 flex items-center">
            <SuperSnakeLogo size="sm" showText={true} withLink={false} />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-mono">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                    isActive
                      ? 'bg-neutral-800/80 text-white font-semibold border-l-2 border-snake-green'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-snake-green' : 'text-neutral-500'} />
                  <span>{item.label}</span>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-mono font-bold bg-snake-green text-black rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Return to Storefront */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-2 text-xs font-mono">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 text-neutral-400 hover:text-white bg-neutral-900/60 hover:bg-neutral-900 rounded transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-snake-green" />
              Storefront Live
            </span>
            <ArrowUpRight size={14} />
          </Link>

          <div className="px-3 py-2 text-[11px] text-neutral-500 truncate">
            Logged in as <strong className="text-snake-green">{user?.email || profile?.email || 'admin'}</strong>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#0d0d0d] border-b border-neutral-800/80 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase hidden sm:inline">
              ATELIER MANAGEMENT SYSTEM
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search orders, SKU, customers..."
                className="bg-neutral-900 border border-neutral-800 text-xs font-mono px-3 py-1.5 pl-8 rounded text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green w-64"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            </div>

            <button className="p-2 text-neutral-400 hover:text-white relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-snake-green" />
            </button>

            <div className="w-7 h-7 rounded-full bg-snake-green text-black font-mono font-bold text-xs flex items-center justify-center">
              SS
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
