'use client';

import React, { useState } from 'react';
import { Settings, Shield, Key, Bell, CreditCard, Mail, Check } from 'lucide-react';
import { BRAND } from '@/lib/design-tokens';

export default function AdminSettingsPage() {
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
          PLATFORM & INTEGRATION SETTINGS
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Configure Supabase, Razorpay, Resend, and Cloudflare credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Gateway Config */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <CreditCard size={16} className="text-snake-green" />
            <span>RAZORPAY PAYMENT GATEWAY</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">RAZORPAY KEY ID</label>
              <input
                type="text"
                placeholder="Configured via NEXT_PUBLIC_RAZORPAY_KEY_ID"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded placeholder:text-neutral-600 focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">WEBHOOK SECRET</label>
              <input
                type="password"
                placeholder="Configured via RAZORPAY_WEBHOOK_SECRET (Server Only)"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded placeholder:text-neutral-600 focus:border-snake-green"
              />
            </div>
          </div>
        </div>

        {/* Database & Supabase */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <Shield size={16} className="text-snake-green" />
            <span>SUPABASE POSTGRESQL & AUTH</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">SUPABASE PROJECT URL</label>
              <input
                type="text"
                placeholder="Configured via NEXT_PUBLIC_SUPABASE_URL"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded placeholder:text-neutral-600 focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">ANON / PUBLIC KEY</label>
              <input
                type="password"
                placeholder="Configured via NEXT_PUBLIC_SUPABASE_ANON_KEY"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded placeholder:text-neutral-600 focus:border-snake-green"
              />
            </div>
          </div>
        </div>

        {/* Resend Email */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <Mail size={16} className="text-snake-green" />
            <span>RESEND TRANSACTIONAL EMAILS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">SENDER DOMAIN</label>
              <input
                type="text"
                placeholder="concierge@supersnake.in"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded placeholder:text-neutral-600 focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">RESEND API KEY</label>
              <input
                type="password"
                placeholder="Configured via RESEND_API_KEY (Server Only)"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded placeholder:text-neutral-600 focus:border-snake-green"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {saved && (
            <span className="text-snake-green flex items-center gap-1 font-bold">
              <Check size={14} /> SETTINGS SAVED
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-3 bg-snake-green text-black font-bold uppercase rounded hover:bg-white transition-colors"
          >
            SAVE CONFIGURATION
          </button>
        </div>
      </form>
    </div>
  );
}
