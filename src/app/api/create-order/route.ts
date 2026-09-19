import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', customer, orderId, origin } = body;

    // Minimum amount validation: 100 paise (1 INR)
    if (!amount || typeof amount !== 'number' || amount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 paise (₹1.00)' },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TdtCpOjDeqd3Mg';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'h8352O1kmcWDIIT0bbmycIFK';

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const hostOrigin = origin || request.headers.get('origin') || 'https://supersnake-xi.vercel.app';
    const callbackUrl = `${hostOrigin}/checkout/confirmation?orderId=${orderId || ''}`;

    const cleanContact = customer?.phone ? customer.phone.replace(/\D/g, '').slice(-10) : undefined;

    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount),
      currency: currency || 'INR',
      accept_partial: false,
      description: `SuperSnake Order ${orderId ? '#' + orderId.toUpperCase() : ''}`,
      customer: {
        name: customer?.name || 'Customer',
        email: customer?.email || undefined,
        contact: cleanContact && cleanContact.length === 10 ? cleanContact : undefined,
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      callback_url: callbackUrl,
      callback_method: 'get',
    });

    return NextResponse.json({
      payment_link_url: paymentLink.short_url,
      payment_link_id: paymentLink.id,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
    });
  } catch (error: any) {
    console.error('Razorpay payment link creation error:', error);
    if (error?.statusCode === 401) {
      return NextResponse.json(
        { error: 'Razorpay authentication failed. Invalid API credentials.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error?.error?.description || error.message || 'Failed to initialize payment session' },
      { status: 500 }
    );
  }
}
