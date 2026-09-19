'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark bg-black">
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-6 font-mono text-center">
        <div className="max-w-md space-y-6">
          <span className="text-[10px] text-red-500 uppercase tracking-widest block">
            CRITICAL EXCEPTION
          </span>
          <h1 className="text-3xl font-display font-medium text-white">
            ATELIER PIPELINE HALTED
          </h1>
          <p className="text-xs text-neutral-400">
            A fatal root error occurred. Click below to reload the application.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200"
          >
            RELOAD APPLICATION
          </button>
        </div>
      </body>
    </html>
  );
}
