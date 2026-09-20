import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = body;

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

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'i01HJRIICmZZ77L9GReP0ZHG';
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

    // Idempotent Order Creation in Supabase
    let confirmedOrderId = orderData?.id || `ord_${Date.now()}`;
    let orderNumber = orderData?.orderNumber || `SS-${Date.now().toString().slice(-6)}`;

    if (orderData) {
      try {
        // Check if order with this transactionId already exists
        const { data: existing } = await supabase
          .from('orders')
          .select('id, order_number')
          .eq('transaction_id', razorpay_payment_id)
          .maybeSingle();

        if (existing) {
          return NextResponse.json({
            success: true,
            message: 'Payment already verified and order confirmed.',
            orderId: existing.id,
            orderNumber: existing.order_number,
            paymentId: razorpay_payment_id,
          });
        }

        // Insert confirmed order with Verification Pending status
        const { data: inserted, error: insertErr } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            status: 'Verification Pending',
            subtotal: orderData.subtotal,
            discount: orderData.discount || 0,
            shipping: orderData.shipping || 0,
            tax: orderData.tax || 0,
            total: orderData.total,
            customer_name: orderData.customer?.name,
            customer_email: orderData.customer?.email,
            customer_phone: orderData.customer?.phone,
            shipping_address: orderData.shippingAddress,
            payment_method: 'razorpay',
            payment_status: 'paid',
            transaction_id: razorpay_payment_id,
            verification_status: 'Pending',
            phone_verified: false,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (inserted) {
          confirmedOrderId = inserted.id;
          orderNumber = inserted.order_number;

          if (Array.isArray(orderData.items) && orderData.items.length > 0) {
            const itemRows = orderData.items.map((it: any) => ({
              order_id: inserted.id,
              product_name: it.productName,
              color: it.color,
              size: it.size,
              quantity: it.quantity,
              price: it.price,
              image_url: it.imageUrl,
            }));
            await supabase.from('order_items').insert(itemRows);
          }
        }
      } catch (dbErr) {
        console.warn('Supabase order creation in verify-payment:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed.',
      paymentId: razorpay_payment_id,
      orderId: confirmedOrderId,
      orderNumber,
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
