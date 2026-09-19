'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

const FAQS: FAQCategory[] = [
  {
    category: 'ORDERS & TRACKING',
    items: [
      {
        q: 'How do I track my SuperSnake shipment?',
        a: 'Once your order is tailored and dispatched, you will receive an SMS and email notification with your Blue Dart Air Express waybill number. You can also visit our public Track Order portal or view real-time fulfillment timelines under your Patron Account.',
      },
      {
        q: 'Can I modify or cancel my order after placing it?',
        a: 'We process orders swiftly within our Bengaluru studio. If you need to adjust sizing or shipping addresses, please contact our concierge within 2 hours of placement. Once an order is marked as Packed or Shipped, it cannot be recalled.',
      },
      {
        q: 'What payment options are accepted?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking across 50+ Indian banks, and select digital wallets via our 256-bit encrypted Razorpay gateway.',
      },
    ],
  },
  {
    category: 'SHIPPING & TRANSIT',
    items: [
      {
        q: 'What are the delivery transit times?',
        a: 'Metropolitan centers (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai) receive express delivery within 2–3 business days. Tier-2 and regional addresses arrive within 3–5 business days via Blue Dart Air Express.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes. All orders over ₹1,999 qualify for complimentary domestic express shipping across India. Orders below this threshold incur a flat ₹99 logistics fee.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'We currently serve patrons throughout India. International express delivery to North America, Europe, and the Middle East will launch in Q3 2026.',
      },
    ],
  },
  {
    category: 'SIZING & SILHOUETTE',
    items: [
      {
        q: 'What is the difference between Oversized, Boxy, and Relaxed cuts?',
        a: 'Our Oversized cut features dropped shoulders, elongated sleeves, and a substantial drape. The Boxy cut is cropped through the torso with an expansive chest for an architectural streetwear silhouette. Relaxed is our balanced everyday cut, while Classic offers tailored athletic contours.',
      },
      {
        q: 'Should I size down for an oversized fit?',
        a: 'No. Our garments are intentionally patterned to achieve their intended silhouette at your true size. If you normally wear size L, order size L for our signature oversized drape. If you prefer a trimmer look, you may size down.',
      },
    ],
  },
  {
    category: 'RETURNS & EXCHANGES',
    items: [
      {
        q: 'What is the SuperSnake return policy?',
        a: 'We provide a 7-day complimentary return and exchange window from the date of confirmed delivery. Garments must remain unworn, unwashed, and in their original packaging with atelier tags intact.',
      },
      {
        q: 'How long does a refund take to reflect?',
        a: 'Once our inspection team receives and verifies your returned piece, refunds are processed within 48 hours to your original payment method. Depending on your bank, funds typically credit in 3–5 business days.',
      },
    ],
  },
  {
    category: 'FABRIC & CRAFT',
    items: [
      {
        q: 'Why 280–300 GSM?',
        a: 'GSM stands for grams per square meter. Standard fast-fashion tees weigh 140–180 GSM, leading to transparency, collar sag, and rapid degradation. 280–300 GSM represents the golden ratio: substantial, opaque, breathable, and structural.',
      },
      {
        q: 'Will my T-shirt shrink after washing?',
        a: 'All SuperSnake fabrics undergo pre-shrinking and silicone washing prior to cutting. Expect less than 1.5% shrinkage when washed following our Care Guide (cold wash at 30°C and flat dried).',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'ORDERS & TRACKING-0': true,
    'FABRIC & CRAFT-0': true,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            PATRON INTELLIGENCE
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400 max-w-lg mx-auto">
            Everything you need to know about our heavyweight fabrications, sizing metrics, dispatches, and returns.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {FAQS.map((cat) => (
            <div key={cat.category} className="space-y-4">
              <h2 className="text-xs font-mono tracking-widest text-snake-green uppercase border-b border-white/10 pb-2">
                {cat.category}
              </h2>

              <div className="space-y-2">
                {cat.items.map((item, idx) => {
                  const key = `${cat.category}-${idx}`;
                  const isOpen = !!openItems[key];

                  return (
                    <div
                      key={idx}
                      className="bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden transition-colors hover:border-white/20"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                      >
                        <span className="text-sm font-display font-medium text-white">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-snake-green' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-xs font-mono text-neutral-400 leading-relaxed border-t border-white/5">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Box */}
        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-sm text-center space-y-4">
          <HelpCircle size={32} className="mx-auto text-snake-green" />
          <h3 className="text-lg font-display font-medium text-white">
            CANNOT FIND WHAT YOU ARE LOOKING FOR?
          </h3>
          <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto">
            Our atelier client specialists are available Monday to Saturday to answer any specific sizing or order queries.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              <span>CONNECT WITH CONCIERGE</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
