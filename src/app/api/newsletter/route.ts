import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // In production, save to Supabase / Resend audience
    return NextResponse.json({
      success: true,
      message: 'Subscribed to SuperSnake private roster',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Subscription failed' },
      { status: 500 }
    );
  }
}
