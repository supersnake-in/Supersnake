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

    const cleanContact = customer?.phone ? customer.phone.replace(/\D/g, '').slice(-10) : undefined;

    // Create core Razorpay Order for Standard Checkout
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: currency || 'INR',
      receipt: `rcpt_${orderId || Date.now()}`.slice(0, 40),
      notes: {
        orderId: orderId || '',
        customerName: customer?.name || '',
        customerEmail: customer?.email || '',
        customerPhone: cleanContact || '',
      },
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: key_id,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
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
