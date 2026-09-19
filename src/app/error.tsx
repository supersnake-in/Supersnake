'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, AlertCircle } from 'lucide-react';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('SuperSnake Application Error:', error);
  }, [error]);

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center font-sans text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center mb-2">
          <SuperSnakeLogo size="lg" showText={false} />
        </div>

        <span className="text-[10px] font-mono tracking-[0.3em] text-red-400 uppercase block">
          EXCEPTION INTERCEPTED
        </span>

        <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white leading-tight">
          SOMETHING WENT OFF SCRIPT.
        </h1>

        <p className="text-xs md:text-sm font-mono text-neutral-400 leading-relaxed">
          An unexpected interruption occurred within our rendering pipeline. You may attempt to re-execute the request or return to the main hall.
        </p>

        {error.digest && (
          <p className="text-[10px] font-mono text-neutral-600">
            DIAGNOSTIC ID: {error.digest}
          </p>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            <span>RETRY EXECUTION</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <Home size={14} />
            <span>RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
