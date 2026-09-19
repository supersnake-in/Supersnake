'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { SuperSnakeLogo } from '../brand/SuperSnakeLogo';
import { BRAND } from '@/lib/design-tokens';

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
    <footer className="bg-black text-neutral-400 border-t border-white/[0.08] pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-20">
        {/* Newsletter Section: ENTER THE SNAKE PIT */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/[0.08] pb-16">
          <div className="max-w-xl space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
              MEMBERSHIP
            </span>
            <h3 className="text-3xl md:text-5xl font-display font-medium text-white tracking-tight">
              ENTER THE SNAKE PIT.
            </h3>
            <p className="text-xs md:text-sm font-mono text-neutral-400 leading-relaxed">
              Early access to limited heavyweight drops, private exhibitions, and editorial releases. Never noise.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-mono text-snake-green py-3 border-b border-snake-green">
                <Check size={16} /> YOU ARE ON THE PRIVATE ROSTER.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative border-b border-white/20 pb-2 focus-within:border-snake-green transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-transparent text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:text-snake-green transition-colors p-1"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-xs font-mono">
          {/* Col 1 */}
          <div className="space-y-4">
            <p className="text-[11px] tracking-widest text-white uppercase font-semibold">COLLECTIONS</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/shop" className="hover:text-snake-green transition-colors">ALL T-SHIRTS</Link>
              </li>
              <li>
                <Link href="/men" className="hover:text-snake-green transition-colors">MEN</Link>
              </li>
              <li>
                <Link href="/women" className="hover:text-snake-green transition-colors">WOMEN</Link>
              </li>
              <li>
                <Link href="/new-drops" className="hover:text-snake-green transition-colors">NEW DROPS</Link>
              </li>
              <li>
                <Link href="/bestsellers" className="hover:text-snake-green transition-colors">BESTSELLERS</Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <p className="text-[11px] tracking-widest text-white uppercase font-semibold">ATELIER & CRAFT</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="hover:text-snake-green transition-colors">BRAND MANIFESTO</Link>
              </li>
              <li>
                <Link href="/care-guide" className="hover:text-snake-green transition-colors">CARE & LONGEVITY</Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-snake-green transition-colors">SIZE & FIT GUIDE</Link>
              </li>
              <li>
                <Link href="/collection/heavyweight" className="hover:text-snake-green transition-colors">280 GSM CAPSULE</Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <p className="text-[11px] tracking-widest text-white uppercase font-semibold">CLIENT SERVICES</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/track-order" className="hover:text-snake-green transition-colors">TRACK SHIPMENT</Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-snake-green transition-colors">SHIPPING POLICY</Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-snake-green transition-colors">7-DAY RETURNS & EXCHANGES</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-snake-green transition-colors">FREQUENTLY ASKED QUESTIONS</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-snake-green transition-colors">CONTACT CONCIERGE</Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-4">
            <p className="text-[11px] tracking-widest text-white uppercase font-semibold">PORTAL</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/account" className="hover:text-snake-green transition-colors">PATRON ACCOUNT</Link>
              </li>
              <li>
                <Link href="/admin" className="text-neutral-400 hover:text-snake-green transition-colors flex items-center gap-1.5">
                  <span>ADMIN DASHBOARD</span>
                  <ArrowRight size={12} />
                </Link>
              </li>
              <li>
                <span className="text-neutral-600">CURRENCY: INR (₹)</span>
              </li>
              <li>
                <span className="text-neutral-600">SHIPPING: INDIA DOMESTIC</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-mono text-neutral-600">
          <div className="flex items-center gap-4">
            <SuperSnakeLogo size="sm" showText={false} withLink={false} />
            <span>SUPERSNAKE.IN © 2026. WEAR YOUR INSTINCT.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">PRIVACY</Link>
            <Link href="/terms" className="hover:text-neutral-400 transition-colors">TERMS</Link>
            <Link href="/cookies" className="hover:text-neutral-400 transition-colors">COOKIES</Link>
            <span>BENGALURU, INDIA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
