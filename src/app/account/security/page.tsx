'use client';

import React, { useState } from 'react';
import { Lock, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AccountSecurityPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      setIsSubmitting(false);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSaved(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Could not update password');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          SECURITY PROTOCOLS
        </span>
        <h2 className="text-xl md:text-2xl font-display font-medium text-white">
          SECURITY & ACCESS
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Update Password */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-6">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-snake-green" />
            <div>
              <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider">
                UPDATE PASSWORD
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Ensure your credentials meet our 8+ character luxury encryption standards.
              </p>
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
              <span>Password successfully updated.</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'UPDATING...' : 'CHANGE PASSWORD'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
