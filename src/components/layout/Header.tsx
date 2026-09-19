'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu, X, Shield, LogOut, ArrowRight } from 'lucide-react';
import { SuperSnakeLogo } from '../brand/SuperSnakeLogo';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { cartCount, wishlist, openCart, openSearch } = useStore();
  const { user, profile, signOut, isAdmin } = useAuth();

  const isStorefront = !pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and account menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  // Click outside to close desktop account menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            ? 'bg-black/80 backdrop-blur-md py-3.5'
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

            {/* Desktop Account Popover */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="text-neutral-400 hover:text-white transition-colors duration-200 p-1.5 focus:outline-none relative"
                aria-label="Customer Account Menu"
                aria-expanded={accountMenuOpen}
              >
                <User size={18} />
                {user && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-snake-green rounded-full shadow-[0_0_6px_rgba(4,252,33,0.8)]" />
                )}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#0a0a0a] border border-white/10 rounded-sm shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {user ? (
                    <div className="space-y-3">
                      <div className="pb-3 border-b border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-snake-green tracking-widest uppercase">
                            PATRON PORTAL
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-snake-green animate-pulse" />
                        </div>
                        <p className="text-xs font-display font-medium text-white truncate">
                          {profile?.fullName || user.email?.split('@')[0]}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="space-y-1 text-xs font-mono">
                        <Link
                          href="/account"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded hover:bg-white/5 text-neutral-300 hover:text-white transition-colors"
                        >
                          <span>ACCOUNT OVERVIEW</span>
                          <ArrowRight size={12} className="text-neutral-500" />
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded hover:bg-white/5 text-neutral-300 hover:text-white transition-colors"
                        >
                          <span>MY ORDERS</span>
                          <ArrowRight size={12} className="text-neutral-500" />
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded hover:bg-white/5 text-neutral-300 hover:text-white transition-colors"
                        >
                          <span>SAVED PIECES</span>
                          <ArrowRight size={12} className="text-neutral-500" />
                        </Link>
                      </div>

                      {isAdmin && (
                        <div className="pt-2 border-t border-white/10">
                          <Link
                            href="/admin"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center justify-between p-2 rounded bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono font-semibold hover:bg-snake-green hover:text-black transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <Shield size={12} />
                              <span>ADMIN PORTAL</span>
                            </div>
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/10">
                        <button
                          onClick={async () => {
                            setAccountMenuOpen(false);
                            await signOut();
                            router.push('/login');
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded text-xs font-mono text-neutral-400 hover:text-red-400 hover:bg-red-950/20 transition-colors text-left"
                        >
                          <LogOut size={14} />
                          <span>SIGN OUT</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="pb-2 border-b border-white/10">
                        <span className="text-[10px] font-mono text-snake-green tracking-widest uppercase">
                          PATRON ACCESS
                        </span>
                        <p className="text-xs font-mono text-neutral-400 mt-1">
                          Sign in to manage orders, saved pieces, and private drops.
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <Link
                          href="/login"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block w-full py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs font-semibold text-center uppercase tracking-widest transition-colors"
                        >
                          SIGN IN
                        </Link>
                        <Link
                          href="/signup"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block w-full py-2 border border-white/20 hover:border-snake-green hover:text-snake-green text-white font-mono text-xs text-center uppercase tracking-widest transition-colors"
                        >
                          CREATE ACCOUNT
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-white/5 text-center">
                        <Link
                          href="/account"
                          onClick={() => setAccountMenuOpen(false)}
                          className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
                        >
                          View guest patron portal →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

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

            {/* Quick Action Strip: Authentication, Account, Wishlist, Search, Bag */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              {/* Authenticated Patron Card or Sign In/Sign Up CTAs */}
              {user ? (
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-snake-green animate-pulse" />
                      <span className="text-[10px] font-mono text-snake-green uppercase tracking-wider">
                        AUTHENTICATED PATRON
                      </span>
                    </div>
                    <p className="text-xs font-display font-medium text-white truncate mt-0.5">
                      {profile?.fullName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut();
                      router.push('/login');
                    }}
                    className="p-2 text-neutral-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded transition-colors flex items-center gap-1 text-[11px] font-mono shrink-0"
                    title="Sign Out"
                  >
                    <LogOut size={13} />
                    <span>EXIT</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pb-1">
                  <Link
                    href="/login"
                    className="p-3 bg-white hover:bg-snake-green text-black font-mono text-xs font-bold text-center uppercase tracking-wider rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    SIGN IN
                  </Link>
                  <Link
                    href="/signup"
                    className="p-3 bg-white/[0.04] border border-white/20 hover:border-snake-green text-white font-mono text-xs font-semibold text-center uppercase tracking-wider rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    CREATE ACCOUNT
                  </Link>
                </div>
              )}

              {/* Action Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
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

                {user && (
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut();
                      router.push('/login');
                    }}
                    className="col-span-2 p-2.5 bg-red-950/20 border border-red-900/30 rounded hover:border-red-500 text-red-400 hover:text-red-300 flex items-center justify-center gap-2 transition-colors active:scale-95"
                  >
                    <LogOut size={14} />
                    <span>LOG OUT OF ATELIER</span>
                  </button>
                )}
              </div>
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
