'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-3 border-b border-white/10 pb-6">
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            LEGAL ARCHIVE
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            TERMS OF SERVICE
          </h1>
          <p className="text-xs font-mono text-neutral-500">
            Effective Date: January 1, 2026 • SuperSnake Design Atelier, Bengaluru, India
          </p>
        </div>

        <div className="space-y-8 text-xs font-mono text-neutral-400 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              1. PREAMBLE & ACCEPTANCE
            </h2>
            <p>
              By accessing SUPERSNAKE.IN, browsing our collections, creating a patron profile, or purchasing garments, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue your use of our platform immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              2. PRODUCT DESCRIPTIONS & FABRIC WEIGHTS
            </h2>
            <p>
              We strive to represent our garment silhouettes, fabric weights (280–300 GSM), and colorways with maximum visual and technical accuracy. However, slight nuances in dye shading may occur across production dye lots due to our use of organic GOTS-certified pigments. Finished garment dimensions conform strictly to our published Size Guide within standard garment tolerance (+/- 0.5 inches).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              3. PRICING & TAXATION
            </h2>
            <p>
              All prices displayed on SUPERSNAKE.IN are denominated in Indian Rupees (INR ₹) and are inclusive of integrated Goods and Services Tax (GST) under applicable Indian fiscal statutes. We reserve the right to modify prices for upcoming drops without prior notification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              4. INTELLECTUAL PROPERTY
            </h2>
            <p>
              The SUPERSNAKE trademark, the iconic snake emblem, all editorial photography, garment cuts, typography designs, and website code are the exclusive intellectual property of SuperSnake. Any unauthorized reproduction, commercial distribution, or imitation is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              5. GOVERNING LAW & JURISDICTION
            </h2>
            <p>
              These Terms shall be construed in accordance with and governed by the laws of India. Any disputes arising in connection with orders or website usage shall fall under the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
