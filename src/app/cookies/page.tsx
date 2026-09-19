'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Check } from 'lucide-react';

export default function CookiePolicyPage() {
  const [essentialCookies, setEssentialCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem(
        'supersnake_cookie_consent',
        JSON.stringify({ essential: true, analytics: analyticsCookies })
      );
    } catch (e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-3 border-b border-white/10 pb-6">
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            PATRON TELEMETRY
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            COOKIE DIRECTIVE
          </h1>
          <p className="text-xs font-mono text-neutral-500">
            Last Updated: January 1, 2026 • SuperSnake Design Atelier
          </p>
        </div>

        <div className="space-y-8 text-xs font-mono text-neutral-400 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              1. OUR USE OF COOKIES
            </h2>
            <p>
              Cookies and local storage mechanisms allow SUPERSNAKE.IN to remember your bag items, preserve your patron session, and record your preferred silhouette settings without requiring repeated logins.
            </p>
          </section>

          <section className="space-y-4 bg-[#0a0a0a] border border-white/10 p-6 rounded-sm">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              2. MANAGE YOUR PREFERENCES
            </h2>

            {saved && (
              <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
                <Check size={15} />
                <span>Cookie preferences saved.</span>
              </div>
            )}

            <div className="space-y-4 pt-2 divide-y divide-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-white font-medium block">ESSENTIAL ATELIER COOKIES</span>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Required for bag persistence, checkout security, and authentication. Always active.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-neutral-400 uppercase">
                  REQUIRED
                </span>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-white font-medium block">ANALYTICS & PERFORMANCE</span>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    Anonymous interaction telemetry to optimize site rendering speeds and 60fps motion performance.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analyticsCookies}
                    onChange={(e) => setAnalyticsCookies(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#161616] border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-snake-green peer-checked:after:bg-black" />
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
              >
                SAVE CHOICES
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
