import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Rate limiting map for account lookups: max 10 requests per IP per minute
const ipLookupLimits = new Map<string, { count: number; windowStart: number }>();

function checkLookupRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipLookupLimits.get(ip);

  if (!entry) {
    ipLookupLimits.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (now - entry.windowStart > 60 * 1000) {
    ipLookupLimits.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= 10) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

    if (!checkLookupRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check public.profiles first
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (profile) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });
  } catch (err: any) {
    console.error('Account lookup error:', err);
    return NextResponse.json({ exists: false });
  }
}
