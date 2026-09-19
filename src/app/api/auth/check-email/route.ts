import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { exists: false, error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { exists: false, error: 'Invalid email format.' },
        { status: 400 }
      );
    }

    // 1. Check in public.profiles table
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (profile) {
        return NextResponse.json({ exists: true });
      }
    } catch (dbErr) {
      console.warn('Profile check error:', dbErr);
    }

    // 2. Check in existing orders table if customer has ordered previously
    try {
      const { data: pastOrder } = await supabase
        .from('orders')
        .select('id, customer_email')
        .ilike('customer_email', cleanEmail)
        .maybeSingle();

      if (pastOrder) {
        return NextResponse.json({ exists: true });
      }
    } catch (orderErr) {
      // Graceful fallback
    }

    return NextResponse.json({ exists: false });
  } catch (error: any) {
    console.error('Check email route error:', error);
    return NextResponse.json(
      { exists: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
