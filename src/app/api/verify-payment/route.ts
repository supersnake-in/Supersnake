import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
        },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Razorpay key secret not configured on server.',
        },
        { status: 500 }
      );
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(payload)
      .digest('hex');

    // Secure comparison to prevent timing attacks
    const genBuffer = Buffer.from(generated_signature, 'utf8');
    const sigBuffer = Buffer.from(razorpay_signature, 'utf8');

    const isMatch =
      genBuffer.length === sigBuffer.length &&
      crypto.timingSafeEqual(genBuffer, sigBuffer);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Signature verification failed. Payment cannot be verified.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    console.error('Razorpay signature verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error occurred while verifying payment signature.',
      },
      { status: 400 }
    );
  }
}
