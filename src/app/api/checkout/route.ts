import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', receipt } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    // Razorpay Order creation simulation or live SDK
    const orderId = `order_${Date.now().toString().slice(-10)}`;

    return NextResponse.json({
      id: orderId,
      entity: 'order',
      amount: amount * 100, // in paise
      amount_paid: 0,
      amount_due: amount * 100,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created',
      attempts: 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
