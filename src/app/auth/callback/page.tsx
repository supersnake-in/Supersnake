'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { SuperSnakeLogo } from '@/components/brand/SuperSnakeLogo';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('AUTHENTICATING PATRON...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handleCallback() {
      const next = searchParams.get('next') || '/account';
      const code = searchParams.get('code');
      const queryError = searchParams.get('error_description') || searchParams.get('error');

      // Check query error
      if (queryError) {
        if (active) setError(decodeURIComponent(queryError));
        setTimeout(() => {
          if (active) router.replace('/login');
        }, 2500);
        return;
      }

      try {
        // 1. Check if tokens or errors are in hash fragment (#access_token=... or #error=...)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashError = hashParams.get('error_description') || hashParams.get('error');
          if (hashError) {
            if (active) setError(decodeURIComponent(hashError));
            setTimeout(() => {
              if (active) router.replace('/login');
            }, 2500);
            return;
          }

          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }

        // 2. PKCE code exchange
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Exchange code error:', exchangeError);
            const { data: currentSession } = await supabase.auth.getSession();
            if (!currentSession.session) {
              if (active) setError(exchangeError.message);
              setTimeout(() => {
                if (active) router.replace('/login');
              }, 2500);
              return;
            }
          }
        }

        // 3. Verify active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && active) {
          setStatusMessage('ACCESS GRANTED. ENTERING ATELIER...');
        }

        if (active) {
          router.replace(next);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        if (active) {
          setError(err.message || 'Authentication encountered an error');
          setTimeout(() => router.replace('/login'), 2500);
        }
      }
    }

    handleCallback();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-mono">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <SuperSnakeLogo size="md" showText={false} />
        </div>

        {error ? (
          <div className="p-4 bg-red-950/40 border border-red-800/50 text-red-400 text-xs rounded space-y-2">
            <p className="font-bold tracking-wider uppercase text-red-300">AUTHENTICATION NOTICE</p>
            <p>{error}</p>
            <p className="text-[10px] text-neutral-500">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-block animate-spin w-5 h-5 border-2 border-snake-green border-t-transparent rounded-full" />
            <p className="text-xs tracking-widest text-neutral-300 uppercase animate-pulse">
              {statusMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs text-neutral-500">
          ENTERING ATELIER...
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
