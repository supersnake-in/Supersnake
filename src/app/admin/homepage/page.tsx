'use client';

import React, { useState } from 'react';
import { Home, Save, Check } from 'lucide-react';

export default function AdminHomepageConfigPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono max-w-4xl">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
          HOMEPAGE EDITORIAL CURATION
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Control hero campaign headline, spotlight product, and banner text.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 sm:p-8">
        <div className="space-y-2">
          <label className="text-neutral-400 uppercase font-semibold">HERO PRIMARY HEADLINE</label>
          <input
            type="text"
            defaultValue="WEAR YOUR INSTINCT."
            className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
          />
        </div>

        <div className="space-y-2">
          <label className="text-neutral-400 uppercase font-semibold">HERO SUPPORTING COPY</label>
          <input
            type="text"
            defaultValue="Premium T-shirts. Designed for your everyday. Engineered for presence."
            className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
          />
        </div>

        <div className="space-y-2">
          <label className="text-neutral-400 uppercase font-semibold">FLAGSHIP SPOTLIGHT PRODUCT</label>
          <select
            defaultValue="the-signature-tee"
            className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
          >
            <option value="the-signature-tee">THE SIGNATURE TEE (₹1,499)</option>
            <option value="the-serpent-tee">THE SERPENT TEE (₹1,899)</option>
            <option value="the-monolith-oversized">THE MONOLITH OVERSIZED (₹1,799)</option>
            <option value="the-venom-edition">THE VENOM EDITION (₹1,999)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-neutral-400 uppercase font-semibold">BRAND STATEMENT SLOGAN</label>
          <input
            type="text"
            defaultValue="NOT MADE TO BLEND IN."
            className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
          />
        </div>

        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          {saved && (
            <span className="text-snake-green flex items-center gap-1.5 font-bold">
              <Check size={14} /> HOMEPAGE CURATION PUBLISHED
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-3 bg-snake-green text-black font-bold uppercase rounded hover:bg-white transition-colors"
          >
            PUBLISH CHANGES
          </button>
        </div>
      </form>
    </div>
  );
}
