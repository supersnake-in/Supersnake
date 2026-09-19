import { NextResponse } from 'next/server';
import { subscribeNewsletterInSupabase } from '@/lib/supabase/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body?.email || '').trim().toLowerCase();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Save to Supabase newsletter_subscribers table
    try {
      await subscribeNewsletterInSupabase(email);
    } catch (err) {
      console.warn('Supabase newsletter subscriber insert error:', err);
    }

    // Check Resend or simulated storage
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && !resendKey.includes('placeholder')) {
      try {
        // Optional Resend audience sync if configured
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'SuperSnake Atelier <noreply@supersnake.in>',
            to: [email],
            subject: 'Welcome to the Snake Pit',
            html: '<p>You have been entered into the SuperSnake private roster.</p>',
          }),
        });
      } catch (err) {
        console.warn('Resend dispatch notice:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "You're in. Welcome to the Snake Pit.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Subscription transmission interrupted. Please retry.' },
      { status: 500 }
    );
  }
}
