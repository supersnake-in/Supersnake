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
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-neutral-300 hover:text-white p-1.5 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Center Brand Logo */}
          <div className="flex items-center justify-center">
            <SuperSnakeLogo size="md" showText={true} />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 md:gap-6">
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
              className="text-neutral-400 hover:text-white transition-colors duration-200 p-1.5 hidden sm:inline-block focus:outline-none"
              aria-label="Customer Account"
            >
              <User size={18} />
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-snake-green border border-snake-green/30 bg-snake-green/10 hover:bg-snake-green hover:text-black px-2.5 py-1 rounded transition-all font-semibold"
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
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/95 backdrop-blur-xl lg:hidden pt-24 px-8 flex flex-col justify-between pb-12 animate-in fade-in duration-300">
          <div className="flex flex-col space-y-6">
            <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Navigation</p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-2xl font-display font-medium tracking-wider text-white hover:text-snake-green transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 border-t border-white/10 flex flex-col space-y-4">
              <Link
                href="/account"
                className="text-sm font-mono tracking-wider text-neutral-300 hover:text-white flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={16} /> ACCOUNT & ORDERS
              </Link>
              <Link
                href="/wishlist"
                className="text-sm font-mono tracking-wider text-neutral-300 hover:text-white flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={16} /> SAVED FOR LATER ({wishlist.length})
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs font-mono tracking-wider text-snake-green hover:underline flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield size={14} />
                  ADMIN PORTAL →
                </Link>
              )}
            </div>
          </div>

          <div className="text-xs font-mono text-neutral-600 tracking-wider">
            SUPERSNAKE.IN © 2026. WEAR YOUR INSTINCT.
          </div>
        </div>
      )}
    </>
  );
}
