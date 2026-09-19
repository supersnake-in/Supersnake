'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, HelpCircle, Mail } from 'lucide-react';
import { LEGAL_CONFIG, getLegalValue } from '@/lib/legal-config';

export interface TableOfContentsItem {
  id: string;
  title: string;
}

export interface RelatedLink {
  label: string;
  href: string;
}

interface PolicyLayoutProps {
  category: 'CUSTOMER CARE' | 'LEGAL';
  title: string;
  description: string;
  effectiveDate?: string | null;
  lastUpdated?: string | null;
  tableOfContents?: TableOfContentsItem[];
  relatedLinks?: RelatedLink[];
  children: React.ReactNode;
}

export function PolicyLayout({
  category,
  title,
  description,
  effectiveDate = LEGAL_CONFIG.policyEffectiveDate,
  lastUpdated = LEGAL_CONFIG.policyLastUpdated,
  tableOfContents = [],
  relatedLinks = [],
  children,
}: PolicyLayoutProps) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="bg-black text-white min-h-screen pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 font-sans selection:bg-snake-green selection:text-black">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Page Header */}
        <header className="border-b border-white/10 pb-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
              {category}
            </span>
            <span className="text-neutral-600 text-xs">•</span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              SUPERSNAKE.IN
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium uppercase tracking-tight text-white leading-tight">
            {title}
          </h1>

          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-2xl leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-[10px] font-mono text-neutral-500">
            <span>
              EFFECTIVE: <strong className="text-neutral-300 font-normal">{effectiveDate || getLegalValue(null, 'DATE')}</strong>
            </span>
            <span>•</span>
            <span>
              LAST UPDATED: <strong className="text-neutral-300 font-normal">{lastUpdated || getLegalValue(null, 'DATE')}</strong>
            </span>
          </div>
        </header>

        {/* Mobile Table of Contents Accordion */}
        {tableOfContents.length > 0 && (
          <div className="lg:hidden bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden text-xs font-mono">
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
              aria-expanded={tocOpen}
            >
              <span className="text-snake-green uppercase font-semibold tracking-wider">
                TABLE OF CONTENTS ({tableOfContents.length})
              </span>
              <ChevronDown
                size={16}
                className={`text-neutral-400 transition-transform duration-200 ${
                  tocOpen ? 'rotate-180 text-snake-green' : ''
                }`}
              />
            </button>

            {tocOpen && (
              <ul className="p-4 pt-0 space-y-2 border-t border-white/5 divide-y divide-white/5">
                {tableOfContents.map((item, idx) => (
                  <li key={item.id} className="pt-2 first:pt-0">
                    <a
                      href={`#${item.id}`}
                      onClick={() => setTocOpen(false)}
                      className="text-neutral-400 hover:text-white transition-colors block py-1"
                    >
                      <span className="text-neutral-600 mr-2">{String(idx + 1).padStart(2, '0')}</span>
                      <span>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Prose Content */}
          <main className={`space-y-10 text-xs sm:text-[13px] font-mono text-neutral-300 leading-relaxed ${
            tableOfContents.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'
          }`}>
            {children}
          </main>

          {/* Desktop Table of Contents Sidebar */}
          {tableOfContents.length > 0 && (
            <aside className="hidden lg:block lg:col-span-4 sticky top-32 space-y-4 bg-[#0a0a0a] border border-white/10 p-5 rounded-sm text-xs font-mono">
              <span className="text-[10px] tracking-widest text-snake-green uppercase block border-b border-white/10 pb-2">
                INDEX / SECTIONS
              </span>
              <ul className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {tableOfContents.map((item, idx) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-neutral-400 hover:text-snake-green transition-colors block py-1 text-[11px] leading-snug"
                    >
                      <span className="text-neutral-600 mr-1.5">{String(idx + 1).padStart(2, '0')}.</span>
                      <span>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>

        {/* Contextual Policy Navigation */}
        {relatedLinks.length > 0 && (
          <nav className="border-t border-white/10 pt-8 space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block">
              RELATED POLICIES & GUIDANCE
            </span>
            <div className="flex flex-wrap gap-2.5">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2.5 bg-[#0a0a0a] border border-white/10 hover:border-snake-green/50 text-neutral-300 hover:text-white rounded-sm text-xs font-mono tracking-wider transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span>{link.label}</span>
                  <ArrowRight size={12} className="text-neutral-500 group-hover:text-snake-green group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Support Callout Banner */}
        <section className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-sm text-center space-y-4">
          <HelpCircle size={28} className="mx-auto text-snake-green" />
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-display font-medium text-white uppercase">
              NEED SPECIFIC ASSISTANCE?
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Our atelier client relations team is available to assist you with orders, sizing, or defect reviews.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-mono">
            <Link
              href="/contact"
              className="px-6 py-3 bg-white hover:bg-snake-green text-black uppercase tracking-widest font-semibold transition-colors inline-flex items-center gap-2"
            >
              <span>CONTACT CONCIERGE</span>
              <ArrowRight size={13} />
            </Link>
            {LEGAL_CONFIG.supportEmail ? (
              <a
                href={`mailto:${LEGAL_CONFIG.supportEmail}`}
                className="px-6 py-3 border border-white/20 hover:border-white text-white uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <Mail size={13} />
                <span>{LEGAL_CONFIG.supportEmail}</span>
              </a>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
