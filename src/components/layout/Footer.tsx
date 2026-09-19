'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Truck,
  Package,
  ShieldCheck,
  Heart,
  Instagram,
  Youtube,
} from 'lucide-react';
import { SuperSnakeLogo } from '../brand/SuperSnakeLogo';

// Custom SVG Icons for X (Twitter) and Pinterest
function XIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PinterestIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.372-12-12-12z" />
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#000000] text-neutral-400 border-t border-white/[0.08] font-sans relative overflow-hidden">
      {/* Background Snake Artwork (Right Side) */}
      <div className="absolute right-0 top-0 bottom-24 w-1/3 max-w-[420px] pointer-events-none hidden lg:block select-none overflow-hidden opacity-90">
        <div className="relative w-full h-full">
          <Image
            src="/footer-snake.png"
            alt=""
            fill
            className="object-contain object-right"
            priority={false}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-20">
        {/* ========================================================= */}
        {/* TOP SECTION: MEMBERSHIP + 4 NAV COLUMNS + WEAR YOUR INSTINCT */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 relative z-10">
          {/* Left Column: Membership / Newsletter */}
          <div className="lg:col-span-4 space-y-4 pr-0 lg:pr-6">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#04fc21] uppercase font-semibold block">
              MEMBERSHIP
            </span>

            <h3 className="text-3xl md:text-[40px] font-serif font-normal text-white tracking-tight leading-[1.15]">
              ENTER<br />THE SNAKE PIT.
            </h3>

            <p className="text-xs md:text-[13px] text-neutral-400 font-sans leading-relaxed max-w-sm">
              Be the first to know about new drops, private releases, exclusive offers, and stories from inside SuperSnake.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-mono text-[#04fc21] py-3.5 px-4 bg-[#0a0a0a] border border-[#04fc21]/30 rounded-sm">
                <Check size={16} /> YOU ARE ON THE PRIVATE ROSTER.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2 pt-2 max-w-md">
                <div className="flex items-center bg-[#070707] border border-white/15 focus-within:border-[#04fc21] transition-colors rounded-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-transparent px-4 py-3 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-3 text-xs font-mono font-semibold uppercase text-white hover:text-[#04fc21] transition-colors tracking-wider shrink-0"
                    aria-label="Join Snake Pit"
                  >
                    <span>JOIN</span>
                    <ArrowRight size={14} className="text-[#04fc21]" />
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 font-sans">
                  By subscribing, you agree to our{' '}
                  <Link href="/privacy" className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>

          {/* Middle Nav Columns: SHOP, ABOUT, SUPPORT, CONNECT */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs font-sans">
            {/* 1. SHOP */}
            <div className="space-y-4">
              <p className="text-xs font-mono tracking-widest text-white uppercase font-bold">
                SHOP
              </p>
              <ul className="space-y-2.5 text-neutral-400 text-xs font-sans">
                <li>
                  <Link href="/shop" className="hover:text-white transition-colors">
                    All T-Shirts
                  </Link>
                </li>
                <li>
                  <Link href="/men" className="hover:text-white transition-colors">
                    Men
                  </Link>
                </li>
                <li>
                  <Link href="/women" className="hover:text-white transition-colors">
                    Women
                  </Link>
                </li>
                <li>
                  <Link href="/new-drops" className="hover:text-white transition-colors">
                    New Drops
                  </Link>
                </li>
                <li>
                  <Link href="/bestsellers" className="hover:text-white transition-colors">
                    Bestsellers
                  </Link>
                </li>
              </ul>
            </div>

            {/* 2. ABOUT */}
            <div className="space-y-4">
              <p className="text-xs font-mono tracking-widest text-white uppercase font-bold">
                ABOUT
              </p>
              <ul className="space-y-2.5 text-neutral-400 text-xs font-sans">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Materials
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="/collection/heavyweight" className="hover:text-white transition-colors">
                    Journal
                  </Link>
                </li>
                <li>
                  <Link href="/care-guide" className="hover:text-white transition-colors">
                    Care Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. SUPPORT */}
            <div className="space-y-4">
              <p className="text-xs font-mono tracking-widest text-white uppercase font-bold">
                SUPPORT
              </p>
              <ul className="space-y-2.5 text-neutral-400 text-xs font-sans">
                <li>
                  <Link href="/track-order" className="hover:text-white transition-colors">
                    Order Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white transition-colors">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white transition-colors">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="hover:text-white transition-colors">
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. CONNECT */}
            <div className="space-y-4">
              <p className="text-xs font-mono tracking-widest text-white uppercase font-bold">
                CONNECT
              </p>
              <ul className="space-y-3 text-neutral-400 text-xs font-sans">
                <li>
                  <a
                    href="https://instagram.com/supersnake.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 hover:text-white transition-colors group"
                  >
                    <Instagram size={15} className="text-neutral-400 group-hover:text-white transition-colors" />
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/supersnake"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 hover:text-white transition-colors group"
                  >
                    <XIcon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                    <span>X (Twitter)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/@supersnake"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 hover:text-white transition-colors group"
                  >
                    <Youtube size={15} className="text-neutral-400 group-hover:text-white transition-colors" />
                    <span>YouTube</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://pinterest.com/supersnake"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 hover:text-white transition-colors group"
                  >
                    <PinterestIcon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                    <span>Pinterest</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Far Right: Stacked Slogan beside the snake */}
          <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-center text-center select-none pl-4">
            <div className="space-y-1">
              <span className="font-mono text-xs tracking-[0.35em] text-white/90 leading-loose uppercase block">
                WEAR<br />
                YOUR<br />
                INSTINCT.
              </span>
              <div className="w-6 h-[2px] bg-[#04fc21] mx-auto mt-2" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MIDDLE TRUST BAR: 4 COLUMNS WITH ICONS */}
        {/* ========================================================= */}
        <div className="border-y border-white/[0.08] py-8 my-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/[0.08]">
            {/* 1. Reliable Delivery */}
            <div className="flex items-center gap-4 lg:px-6">
              <div className="text-[#04fc21] shrink-0">
                <Truck size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  RELIABLE DELIVERY
                </p>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Across India
                </p>
              </div>
            </div>

            {/* 2. Easy Returns */}
            <div className="flex items-center gap-4 lg:px-6">
              <div className="text-[#04fc21] shrink-0">
                <Package size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  EASY RETURNS
                </p>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Hassle-free
                </p>
              </div>
            </div>

            {/* 3. Secure Payments */}
            <div className="flex items-center gap-4 lg:px-6">
              <div className="text-[#04fc21] shrink-0">
                <ShieldCheck size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  SECURE PAYMENTS
                </p>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  100% Safe & Encrypted
                </p>
              </div>
            </div>

            {/* 4. Premium Quality */}
            <div className="flex items-center gap-4 lg:px-6">
              <div className="text-[#04fc21] shrink-0">
                <Heart size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                  PREMIUM QUALITY
                </p>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Made to Last
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM BAR: LOGO + PRIVACY/TERMS/COOKIES + COPYRIGHT + MADE IN INDIA */}
        {/* ========================================================= */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-sans text-neutral-400">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <SuperSnakeLogo size="sm" showText={false} withLink={true} />
            <div>
              <span className="text-xs font-bold font-sans tracking-[0.25em] text-white uppercase block leading-none">
                SUPERSNAKE
              </span>
              <span className="text-[8px] font-mono tracking-[0.25em] text-neutral-500 uppercase block mt-1">
                WEAR YOUR INSTINCT.
              </span>
            </div>
          </div>

          {/* Center Links */}
          <div className="flex items-center gap-4 text-xs font-sans text-neutral-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy & Terms
            </Link>
            <span className="text-neutral-700">|</span>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <span className="text-neutral-700">|</span>
            <Link href="/shop" className="hover:text-white transition-colors">
              Site Map
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs font-sans text-neutral-500">
            © 2026 SuperSnake. All rights reserved.
          </div>

          {/* Made in India */}
          <div className="flex items-center gap-1.5 text-xs font-sans text-neutral-400">
            <span>Made in India</span>
            <span className="text-sm">🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
