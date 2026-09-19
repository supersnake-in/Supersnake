'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Plus, Minus, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';
import { SuperSnakeLogo } from '../brand/SuperSnakeLogo';
import { BRAND } from '@/lib/design-tokens';
import { useStore } from '@/lib/store';

interface NavColumn {
  id: string;
  number: string;
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}

export function Footer() {
  const { socialConfig, addSubscriber } = useStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const navColumns: NavColumn[] = [
    {
      id: 'shop',
      number: '01',
      title: 'SHOP',
      links: [
        { label: 'ALL T-SHIRTS', href: '/shop' },
        { label: 'MEN', href: '/men' },
        { label: 'WOMEN', href: '/women' },
        { label: 'NEW DROPS', href: '/new-drops' },
        { label: 'BESTSELLERS', href: '/bestsellers' },
      ],
    },
    {
      id: 'customer-care',
      number: '02',
      title: 'CUSTOMER CARE',
      links: [
        { label: 'CONTACT US', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'SHIPPING & DELIVERY', href: '/shipping' },
        { label: 'RETURNS & DEFECTS', href: '/returns' },
        { label: 'CANCELLATION POLICY', href: '/cancellation' },
        { label: 'SIZE GUIDE', href: '/size-guide' },
        { label: 'CARE GUIDE', href: '/care-guide' },
      ],
    },
    {
      id: 'legal',
      number: '03',
      title: 'LEGAL',
      links: [
        { label: 'PRIVACY POLICY', href: '/privacy' },
        { label: 'TERMS & CONDITIONS', href: '/terms' },
      ],
    },
    {
      id: 'connect',
      number: '04',
      title: 'CONNECT',
      links: [
        ...(socialConfig?.instagram ? [{ label: 'INSTAGRAM', href: socialConfig.instagram, external: true }] : [{ label: 'INSTAGRAM', href: 'https://instagram.com/supersnake.in', external: true }]),
        ...(socialConfig?.x ? [{ label: 'X', href: socialConfig.x, external: true }] : [{ label: 'X', href: 'https://x.com/supersnake_in', external: true }]),
        ...(socialConfig?.youtube ? [{ label: 'YOUTUBE', href: socialConfig.youtube, external: true }] : [{ label: 'YOUTUBE', href: 'https://youtube.com/@supersnake_in', external: true }]),
        ...(socialConfig?.threads ? [{ label: 'THREADS', href: socialConfig.threads, external: true }] : []),
        ...(socialConfig?.linkedin ? [{ label: 'LINKEDIN', href: socialConfig.linkedin, external: true }] : []),
      ],
    },
  ];

  const toggleAccordion = (id: string) => {
    setMobileAccordion((prev) => (prev === id ? null : id));
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Subscription transmission interrupted.');
      } else {
        setStatus('success');
        addSubscriber(email);
        setEmail('');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage('Network connection interrupted. Please retry.');
    }
  };

  return (
    <footer className="relative bg-[#030303] text-[#f4f4f4] border-t border-white/[0.06] overflow-hidden select-none font-sans">
      {/* 
        ============================================================
        SUBTLE BACKGROUND ELEMENT (ZONE 00)
        Abstract S-shaped snake curve & faint atmospheric green rim light.
        Barely visible, extending beyond the right edge.
        ============================================================
      */}
      <div 
        className="absolute top-0 right-[-10%] w-[650px] lg:w-[900px] h-full pointer-events-none opacity-[0.035] overflow-hidden"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 800 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover transform translate-x-12 -translate-y-10"
        >
          {/* Faint atmospheric green ambient wash */}
          <circle cx="550" cy="400" r="320" fill="url(#snakeAtmosphereGlow)" />
          
          {/* Abstract S-curved serpent silhouette */}
          <path
            d="M580 50 C 420 120, 260 220, 310 380 C 360 540, 560 590, 510 740 C 470 860, 310 930, 200 980"
            stroke="url(#snakeCurveGrad)"
            strokeWidth="72"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M580 50 C 420 120, 260 220, 310 380 C 360 540, 560 590, 510 740 C 470 860, 310 930, 200 980"
            stroke="#04fc21"
            strokeWidth="2"
            strokeOpacity="0.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <defs>
            <radialGradient id="snakeAtmosphereGlow" cx="0.5" cy="0.5" r="0.5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#04fc21" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#04fc21" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="snakeCurveGrad" x1="200" y1="50" x2="600" y2="980" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="45%" stopColor="#04fc21" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-20 pt-24 lg:pt-32 pb-12 space-y-20 lg:space-y-24">
        {/* 
          ============================================================
          ZONE 01: BRAND + NEWSLETTER (TOP SECTION)
          Horizontal editorial layout: Brand & Headline on Left,
          Minimalist Newsletter on Right.
          ============================================================
        */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 lg:gap-20">
          {/* LEFT SIDE: Brand Identity & Monumental Editorial Headline */}
          <div className="max-w-2xl space-y-7">
            {/* SuperSnake Logo + Moniker */}
            <div className="flex items-center gap-3">
              <SuperSnakeLogo size="sm" showText={false} withGlow={false} />
              <div className="flex flex-col">
                <span className="font-sans font-bold text-xs tracking-[0.25em] text-white/90">
                  SUPERSNAKE
                </span>
                <span className="text-[9px] font-mono tracking-[0.3em] text-neutral-500 uppercase">
                  WEAR YOUR INSTINCT.
                </span>
              </div>
            </div>

            {/* Editorial Serif/Display Heading */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-medium text-white tracking-tight leading-[1.02]">
              ENTER THE<br />
              SNAKE PIT.
            </h2>

            {/* Understated Subtitle */}
            <p className="text-[11px] font-mono tracking-[0.25em] text-neutral-400 uppercase">
              EXCLUSIVE DROPS. EARLY ACCESS. NO NOISE.
            </p>
          </div>

          {/* RIGHT SIDE: Minimalist Horizontal Email Input */}
          <div className="w-full lg:max-w-md lg:pt-8 space-y-4">
            <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase block">
              MEMBERSHIP
            </span>

            {status === 'success' ? (
              <div className="border-b border-snake-green/40 py-4 space-y-1.5 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 text-xs font-mono text-snake-green tracking-widest uppercase font-semibold">
                  <Check size={14} className="text-snake-green" />
                  <span>YOU&apos;RE IN.</span>
                </div>
                <p className="text-xs font-mono text-neutral-400">
                  Welcome to the Snake Pit. Check your inbox for private roster access.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative border-b border-white/15 focus-within:border-snake-green transition-colors duration-300 pb-3 group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="Enter your email address"
                    aria-label="Email address for newsletter"
                    required
                    disabled={status === 'loading'}
                    className="w-full bg-transparent text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none pr-12 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    aria-label="Subscribe to SuperSnake private roster"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-white group-focus-within:text-snake-green transition-all duration-300 p-1 flex items-center justify-center disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <span className="w-4 h-4 border border-snake-green border-t-transparent rounded-full animate-spin inline-block" />
                    ) : (
                      <ArrowRight size={18} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
                    )}
                  </button>
                </div>

                {status === 'error' && (
                  <p className="text-[11px] font-mono text-red-400 tracking-wide pt-1">
                    {errorMessage}
                  </p>
                )}

                <p className="text-[10px] font-mono text-neutral-500 tracking-wider pt-1">
                  By subscribing, you agree to our{' '}
                  <Link href="/privacy" className="text-neutral-400 hover:text-snake-green transition-colors underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>

        {/* 
          ============================================================
          ZONE 02: NAVIGATION SECTION (NUMBERED 4-COLUMN SYSTEM)
          Desktop: 4 Columns (01 SHOP, 02 SUPPORT, 03 COMPANY, 04 CONNECT)
          Mobile: Clean Collapsible Accordions (+ / −)
          ============================================================
        */}
        <div className="pt-12 border-t border-white/[0.06]">
          {/* Desktop Navigation (>= 768px) */}
          <div className="hidden md:grid grid-cols-4 gap-12 text-xs font-mono">
            {navColumns.map((col) => (
              <div key={col.id} className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] tracking-[0.25em] text-neutral-600 block">
                    {col.number}
                  </span>
                  <p className="text-xs font-sans font-bold tracking-[0.2em] text-white uppercase">
                    {col.title}
                  </p>
                </div>

                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors duration-200"
                        >
                          <span>{link.label}</span>
                          <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-snake-green text-[10px]">
                            ↗
                          </span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors duration-200"
                        >
                          <span>{link.label}</span>
                          <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-snake-green text-[10px]">
                            →
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile Accordions (< 768px) */}
          <div className="md:hidden divide-y divide-white/[0.06] text-xs font-mono">
            {navColumns.map((col) => {
              const isOpen = mobileAccordion === col.id;
              return (
                <div key={col.id} className="py-4">
                  <button
                    onClick={() => toggleAccordion(col.id)}
                    className="w-full flex items-center justify-between text-left py-1 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-neutral-600 font-mono">
                        {col.number}
                      </span>
                      <span className="text-xs font-sans font-bold tracking-[0.2em] text-white uppercase">
                        {col.title}
                      </span>
                    </div>
                    <span className="text-neutral-400">
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  {isOpen && (
                    <ul className="pt-4 pb-2 space-y-3 pl-7 animate-in fade-in slide-in-from-top-1 duration-200">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          {link.external ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                              <span>{link.label}</span>
                              <span className="text-snake-green text-[10px]">↗</span>
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                              <span>{link.label}</span>
                              <span className="text-snake-green text-[10px]">→</span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>



        {/* 
          ============================================================
          ZONE 04: LEGAL & COPYRIGHT (BOTTOM BRAND ROW)
          Understated, balanced, fine lines.
          ============================================================
        */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-mono text-neutral-500 tracking-wider">
          {/* Left: Compact SuperSnake Brand & Motto */}
          <div className="flex items-center gap-3 order-2 md:order-1">
            <SuperSnakeLogo size="sm" showText={false} withLink={true} />
            <span className="text-neutral-400">
              SUPERSNAKE — WEAR YOUR INSTINCT.
            </span>
          </div>

          {/* Center: Legal Directives */}
          <div className="flex items-center gap-6 order-1 md:order-2">
            <Link href="/privacy" className="hover:text-white transition-colors">
              PRIVACY POLICY
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              TERMS & CONDITIONS
            </Link>
          </div>

          {/* Right: Copyright & Made in India */}
          <div className="flex items-center gap-4 order-3 text-neutral-600">
            <span>© 2026 SUPERSNAKE. ALL RIGHTS RESERVED.</span>
            <span>MADE IN INDIA 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
