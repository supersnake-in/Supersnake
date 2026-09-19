'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Check, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { FitType, Size } from '@/lib/types';

export default function AccountPreferencesPage() {
  const { profile, updateProfile } = useAuth();
  const [preferredFit, setPreferredFit] = useState<FitType>('Classic');
  const [preferredSize, setPreferredSize] = useState<Size>('M');
  const [genderInterest, setGenderInterest] = useState<'men' | 'women' | 'all'>('all');
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.preferredFit) setPreferredFit(profile.preferredFit);
      if (profile.preferredSize) setPreferredSize(profile.preferredSize as Size);
      if (profile.genderInterest) setGenderInterest(profile.genderInterest);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSubmitting(true);
    await updateProfile({
      preferredFit,
      preferredSize,
      genderInterest,
    });
    setIsSubmitting(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const fits: FitType[] = ['Oversized', 'Boxy', 'Relaxed', 'Classic', 'Slim'];
  const sizes: Size[] = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'];

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          CURATION MATRIX
        </span>
        <h2 className="text-xl md:text-2xl font-display font-medium text-white">
          FIT & SIZE PREFERENCES
        </h2>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-8">
        <p className="text-xs font-mono text-neutral-400 leading-relaxed">
          Configure your standard silhouette and size profile. We calibrate catalog views, recommendation cards, and default size selections according to these metrics.
        </p>

        {saved && (
          <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
            <Check size={15} />
            <span>Preferences saved. Your catalog views are now calibrated.</span>
          </div>
        )}

        {/* Preferred Silhouette */}
        <div className="space-y-3">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            PREFERRED CUT & SILHOUETTE
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {fits.map((fit) => {
              const isSelected = preferredFit === fit;
              return (
                <button
                  key={fit}
                  type="button"
                  onClick={() => setPreferredFit(fit)}
                  className={`p-4 rounded-sm border text-left transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-snake-green text-white shadow-[0_0_12px_rgba(4,252,33,0.15)]'
                      : 'bg-[#121212] border-white/10 text-neutral-400 hover:border-white/30'
                  }`}
                >
                  <span className="text-xs font-display font-medium block text-white">
                    {fit.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
                    {fit === 'Oversized' && 'Dropped shoulder, heavy drape'}
                    {fit === 'Boxy' && 'Cropped torso, wide chest'}
                    {fit === 'Relaxed' && 'Generous everyday comfort'}
                    {fit === 'Classic' && 'Tailored athletic contour'}
                    {fit === 'Slim' && 'Tailored close-cut contour'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Size */}
        <div className="space-y-3">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            STANDARD SIZE
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((sz) => {
              const isSelected = preferredSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setPreferredSize(sz)}
                  className={`w-12 h-12 rounded-sm border font-mono text-xs flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-snake-green border-snake-green text-black font-bold'
                      : 'bg-[#121212] border-white/10 text-neutral-300 hover:border-white/30'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Interest */}
        <div className="space-y-3">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            EDITORIAL INTEREST
          </label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { id: 'all', label: 'BOTH COLLECTIONS' },
              { id: 'men', label: 'MEN ONLY' },
              { id: 'women', label: 'WOMEN ONLY' },
            ].map((cat) => {
              const isSelected = genderInterest === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setGenderInterest(cat.id as any)}
                  className={`py-3 px-2 rounded-sm border text-center font-mono text-xs uppercase tracking-wider transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-snake-green text-snake-green font-semibold'
                      : 'bg-[#121212] border-white/10 text-neutral-400 hover:border-white/30'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'SAVING...' : 'SAVE PREFERENCES'}
          </button>
        </div>
      </div>
    </div>
  );
}
