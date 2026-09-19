'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu, X, Shield } from 'lucide-react';
import { SuperSnakeLogo } from '../brand/SuperSnakeLogo';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, wishlist, openCart, openSearch } = useStore();
  const { isAdmin } = useAuth();

  const isStorefront = !pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!isStorefront) return null;

  const navLinks = [
    { label: 'SHOP', href: '/shop' },
    { label: 'MEN', href: '/men' },
    { label: 'WOMEN', href: '/women' },
    { label: 'NEW DROPS', href: '/new-drops' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-3.5'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
          {/* ============================================================
              DESKTOP HEADER (LOCKED & UNTOUCHED FOR lg: AND ABOVE)
              ============================================================ */}
          {/* Desktop Left Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-mono tracking-[0.2em] transition-all duration-300 relative py-1 ${
                    isActive
                      ? 'text-snake-green font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-snake-green shadow-[0_0_8px_rgba(4,252,33,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Center Brand Logo */}
          <div className="hidden lg:flex items-center justify-center">
            <SuperSnakeLogo size="md" showText={true} />
          </div>

          {/* Desktop Right Action Icons */}
          <div className="hidden lg:flex items-center gap-4 md:gap-6">
            <button
              onClick={openSearch}
              className="text-neutral-400 hover:text-white transition-colors duration-200 p-1.5 focus:outline-none"
              aria-label="Search Collection"
            >
              <Search size={18} />
            </button>

            <Link
              href="/wishlist"
              className="text-neutral-400 hover:text-white transition-colors duration-200 p-1.5 relative focus:outline-none"
              aria-label="Wishlist"
            >
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-snake-green text-black font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              className="text-neutral-400 hover:text-white transition-colors duration-200 p-1.5 focus:outline-none"
              aria-label="Customer Account"
            >
              <User size={18} />
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-snake-green border border-snake-green/30 bg-snake-green/10 hover:bg-snake-green hover:text-black px-2.5 py-1 rounded transition-all font-semibold"
                title="SuperSnake Admin Atelier"
              >
                <Shield size={12} />
                ADMIN
              </Link>
            )}

            <button
              onClick={openCart}
              className="text-neutral-300 hover:text-white transition-colors duration-200 p-1.5 relative focus:outline-none group flex items-center gap-2"
              aria-label="Open Bag"
            >
              <ShoppingBag size={18} className="group-hover:text-snake-green transition-colors" />
              {cartCount > 0 && (
                <span className="w-4 h-4 bg-snake-green text-black font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* ============================================================
              MOBILE & TABLET HEADER (< lg)
              Structure:
              LEFT: SuperSnake logo
              RIGHT: Search, Bag, Menu
              ============================================================ */}
          <div className="lg:hidden flex items-center">
            <SuperSnakeLogo size="sm" showText={true} />
          </div>

          <div className="lg:hidden flex items-center gap-1 sm:gap-2">
            <button
              onClick={openSearch}
              className="text-neutral-300 hover:text-white p-2.5 focus:outline-none active:scale-95 transition-transform"
              aria-label="Search Collection"
            >
              <Search size={20} />
            </button>

            <button
              onClick={openCart}
              className="text-neutral-300 hover:text-white p-2.5 relative focus:outline-none active:scale-95 transition-transform"
              aria-label="Open Bag"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-snake-green text-black font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-neutral-300 hover:text-white p-2.5 focus:outline-none active:scale-95 transition-transform"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={22} className="text-snake-green" /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================
          MOBILE & TABLET FULL-SCREEN NAVIGATION EXPERIENCE
          ============================================================ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#050505]/98 backdrop-blur-2xl lg:hidden flex flex-col justify-between pt-[max(5.5rem,calc(env(safe-area-inset-top,0px)+4rem))] pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] px-6 sm:px-10 overflow-y-auto animate-in fade-in duration-300">
          <div className="flex flex-col space-y-8 max-w-md mx-auto w-full">
            {/* Top Close / Branding Strip */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
                ATELIER DIRECTORY
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-neutral-400 hover:text-white font-mono text-xs flex items-center gap-1.5"
                aria-label="Close Navigation"
              >
                <span>CLOSE</span>
                <X size={16} />
              </button>
            </div>

            {/* Main Navigation Links */}
            <nav className="flex flex-col space-y-4">
              {[
                { label: 'SHOP', href: '/shop' },
                { label: 'MEN', href: '/men' },
                { label: 'WOMEN', href: '/women' },
                { label: 'NEW DROPS', href: '/new-drops' },
                { label: 'BESTSELLERS', href: '/bestsellers' },
                { label: 'ABOUT', href: '/about' },
                { label: 'SIZE GUIDE', href: '/size-guide' },
                { label: 'CONTACT', href: '/contact' },
              ].map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-white hover:text-snake-green transition-all flex items-center justify-between group active:scale-[0.99]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  <span className="text-xs font-mono text-neutral-600 group-hover:text-snake-green group-hover:translate-x-1 transition-all">
                    0{idx + 1} →
                  </span>
                </Link>
              ))}
            </nav>

            {/* Quick Action Strip: Account, Wishlist, Search, Bag */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-3 text-xs font-mono">
              <Link
                href="/account"
                className="p-3 bg-white/[0.03] border border-white/10 rounded hover:border-snake-green text-neutral-300 hover:text-white flex items-center gap-2.5 transition-colors active:scale-95"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={16} className="text-snake-green" />
                <span>ACCOUNT</span>
              </Link>

              <Link
                href="/wishlist"
                className="p-3 bg-white/[0.03] border border-white/10 rounded hover:border-snake-green text-neutral-300 hover:text-white flex items-center gap-2.5 transition-colors active:scale-95"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={16} className="text-snake-green" />
                <span>SAVED ({wishlist.length})</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSearch();
                }}
                className="p-3 bg-white/[0.03] border border-white/10 rounded hover:border-snake-green text-neutral-300 hover:text-white flex items-center gap-2.5 transition-colors active:scale-95 text-left"
              >
                <Search size={16} className="text-snake-green" />
                <span>SEARCH</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCart();
                }}
                className="p-3 bg-white/[0.03] border border-white/10 rounded hover:border-snake-green text-neutral-300 hover:text-white flex items-center gap-2.5 transition-colors active:scale-95 text-left"
              >
                <ShoppingBag size={16} className="text-snake-green" />
                <span>BAG ({cartCount})</span>
              </button>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="col-span-2 p-3 bg-snake-green/10 border border-snake-green/30 rounded text-snake-green hover:bg-snake-green hover:text-black font-semibold flex items-center justify-between transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield size={16} />
                    <span>ADMIN PORTAL</span>
                  </div>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>

          <div className="max-w-md mx-auto w-full pt-8 text-[11px] font-mono text-neutral-600 tracking-wider flex justify-between items-center">
            <span>SUPERSNAKE.IN © 2026</span>
            <span className="text-neutral-400">WEAR YOUR INSTINCT.</span>
          </div>
        </div>
      )}
    </>
  );
}
