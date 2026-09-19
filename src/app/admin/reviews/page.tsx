'use client';

import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

export default function AdminReviewsPage() {
  const reviews = [
    {
      id: 'rev-1',
      author: 'Kabir V.',
      rating: 5,
      product: 'THE SIGNATURE TEE',
      comment: 'The collar on this tee is ridiculous. Haven’t seen anything hold up this clean in India. Absolutely worth every rupee.',
      verified: true,
      date: '2026-09-17',
    },
    {
      id: 'rev-2',
      author: 'Tara S.',
      rating: 5,
      product: 'THE MERIDIAN CROPPED',
      comment: 'Heavyweight yet drapes like a dream. Hits right at the waist. Need this in 5 more colors.',
      verified: true,
      date: '2026-09-14',
    },
    {
      id: 'rev-3',
      author: 'Siddharth M.',
      rating: 5,
      product: 'THE MONOLITH OVERSIZED',
      comment: 'True 300 GSM. It has a real presence. Definitely oversized so stay true to size for that exact drop shoulder.',
      verified: true,
      date: '2026-09-10',
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
          PATRON REVIEWS & FEEDBACK
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Verified purchaser reviews from across India.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-6 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-3 text-xs"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{r.author}</span>
                  {r.verified && (
                    <span className="px-1.5 py-0.5 bg-snake-green/10 text-snake-green text-[9px] font-bold rounded flex items-center gap-1">
                      <CheckCircle size={10} /> VERIFIED ATELIER BUYER
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-400 uppercase mt-0.5 block">
                  Product: <strong className="text-neutral-200">{r.product}</strong>
                </span>
              </div>

              <div className="flex text-snake-green">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} size={13} className="fill-snake-green" />
                ))}
              </div>
            </div>

            <p className="text-neutral-300 leading-relaxed italic">&ldquo;{r.comment}&rdquo;</p>
            <span className="text-[10px] text-neutral-500 block">{r.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
