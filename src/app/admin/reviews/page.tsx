'use client';

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface Review {
  id: string;
  author: string;
  rating: number;
  product: string;
  comment: string;
  verified: boolean;
  date: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            product:products(name)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setReviews(
            data.map((r: any) => ({
              id: r.id,
              author: r.author_name,
              rating: r.rating,
              product: r.product?.name || 'Garment',
              comment: r.comment,
              verified: r.verified_purchase,
              date: (r.created_at || '').slice(0, 10),
            }))
          );
        }
      } catch (e) {
        console.warn('Could not load reviews:', e);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <div className="space-y-6 font-mono">
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            PATRON REVIEWS & FEEDBACK
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Verified purchaser reviews from across India.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300">
            TOTAL REVIEWS: <strong className="text-white">{reviews.length}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-neutral-500">
          Loading atelier reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-16 text-center space-y-3">
          <MessageSquare size={36} className="mx-auto text-neutral-600" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            NO REVIEWS RECORDED YET
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Reviews submitted by verified purchasers on product pages will dynamically stream here in real time.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
