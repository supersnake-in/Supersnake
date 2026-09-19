'use client';

import React, { useState, useEffect } from 'react';
import { User, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AccountProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await updateProfile({ fullName, phone });
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const email = profile?.email || user?.email || 'patron@supersnake.in';
  const initial = (fullName || email).charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          PATRON RECORD
        </span>
        <h2 className="text-xl md:text-2xl font-display font-medium text-white">
          PROFILE INFORMATION
        </h2>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-8">
        {/* Avatar Monogram */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#161616] border border-white/20 flex items-center justify-center font-display text-2xl font-bold text-snake-green">
            {initial}
          </div>
          <div>
            <h3 className="text-base font-display font-medium text-white">
              {fullName || 'Patron'}
            </h3>
            <p className="text-xs font-mono text-neutral-400">{email}</p>
            <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 uppercase tracking-widest">
              ATELIER VERIFIED
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
            <Check size={15} />
            <span>Patron record updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              Email Address (Account Identifier)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-[#161616] border border-white/10 px-4 py-2.5 text-xs font-mono text-neutral-400 cursor-not-allowed"
            />
            <span className="text-[10px] font-mono text-neutral-600 block mt-1">
              Contact concierge to modify registered email.
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              Phone Number (For Delivery SMS & Verification)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green transition-colors"
            />
          </div>

          <div>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
              Patron Enrolled Date
            </span>
            <p className="text-xs font-mono text-neutral-300">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Current Season (2026)'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'UPDATING RECORD...' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
