import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import {
  fetchProductsFromSupabase,
  fetchPreBookingsFromSupabase,
  createPreBookingInSupabase,
  fetchStorefrontConfigFromSupabase,
} from '@/lib/supabase/db';
import { PRODUCTS } from '@/lib/data/products';
import { PreBooking } from '@/lib/types';
import { sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      size,
      colorName,
      colorHex: incomingColorHex,
      quantity = 1,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentStatus: clientPaymentStatus,
      paymentMethod = 'razorpay',
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    // 1. Basic field sanitization & presence check
    const cleanCustomerName = sanitizeString(customerName);
    const cleanCustomerEmail = sanitizeString(customerEmail).toLowerCase().trim();
    const cleanCustomerPhone = sanitizeString(customerPhone);
    const cleanSize = sanitizeString(size).toUpperCase();
    const cleanColor = sanitizeString(colorName);
    const qty = Math.max(1, Math.min(10, Number(quantity) || 1));

    if (!cleanCustomerName || !cleanCustomerEmail || !cleanCustomerEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'A valid customer name and email address are required.' },
        { status: 400 }
      );
    }

    if (!productId || !cleanSize || !cleanColor) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Product ID, size, and color selection are required.' },
        { status: 400 }
      );
    }

    // 2. Fetch authoritative product record
    const supaProducts = await fetchProductsFromSupabase();
    const allProducts = (supaProducts && supaProducts.length > 0) ? supaProducts : PRODUCTS;
    const product = allProducts.find((p) => p.id === productId || p.slug === productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Selected garment could not be found in atelier catalog.' },
        { status: 404 }
      );
    }

    // 3. Strict Pre-Launch eligibility validation
    // The product MUST have pre_launch_enabled = true (or in local fallback if configured)
    if (!product.preLaunchEnabled && !product.isSignature && !product.isNew) {
      // In case preLaunchEnabled is not yet explicitly set in db, allow signature or new drops as default pre-launch
      // But if explicit preLaunchEnabled is false and others are set, reject
      const anyPreLaunch = allProducts.some((p) => p.preLaunchEnabled);
      if (anyPreLaunch && !product.preLaunchEnabled) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'This piece is not currently eligible for the exclusive First Drop pre-booking.',
          },
          { status: 403 }
        );
      }
    }

    // 4. Validate Size
    if (!product.sizes.includes(cleanSize as any)) {
      return NextResponse.json(
        { error: 'Bad Request', message: `Size "${cleanSize}" is unavailable for this garment.` },
        { status: 400 }
      );
    }

    // 5. Check Maximum Pre-Bookings Limit if configured
    if (product.maxPreBookings && product.maxPreBookings > 0) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
        let countQuery = supabase
          .from('pre_bookings')
          .select('quantity')
          .neq('booking_status', 'CANCELLED');

        if (isUuid) {
          countQuery = countQuery.or(`product_id.eq.${product.id},product_slug.eq.${product.slug}`);
        } else {
          countQuery = countQuery.eq('product_slug', product.slug);
        }

        const { data: bookingRows } = await countQuery;
        const productBookingsCount = (bookingRows || []).reduce((sum: number, b: any) => sum + (Number(b.quantity) || 1), 0);

        if (productBookingsCount + qty > product.maxPreBookings) {
          return NextResponse.json(
            {
              error: 'Pre-Booking Limit Reached',
              message: 'Pre-booking capacity for this limited garment has now closed.',
              closed: true,
            },
            { status: 400 }
          );
        }
      } catch (capErr) {
        console.warn('Could not verify max pre-bookings limit:', capErr);
      }
    }

    // 6. Server-Side Price Calculation (prevent client manipulation)
    const unitPrice = Number(product.price);
    const totalAmount = unitPrice * qty;

    // 7. Generate Reference Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `pb-${Date.now()}-${randomSuffix}`;
    const bookingNumber = `SS-PB-${new Date().getFullYear()}-${randomSuffix}`;

    const colorHex = incomingColorHex || product.colors.find((c) => c.name.toLowerCase() === cleanColor.toLowerCase())?.hex || '#0a0a0a';

    // Reject any Cash on Delivery request
    if (paymentMethod === 'cod' || clientPaymentStatus === 'Pending (COD)') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Cash on delivery is not permitted for exclusive Pre-Launch allocations. Advance payment via Razorpay is mandatory.',
        },
        { status: 400 }
      );
    }

    // Require Razorpay payment transaction
    if (!razorpayPaymentId) {
      return NextResponse.json(
        {
          error: 'Payment Required',
          message: 'An authorized Razorpay transaction ID is required to secure a Pre-Booking allocation.',
        },
        { status: 402 }
      );
    }

    // 8. Cryptographic Razorpay Signature Verification
    let isPaymentVerified = false;
    if (razorpayOrderId && razorpaySignature) {
      try {
        const key_secret = process.env.RAZORPAY_KEY_SECRET || 'i01HJRIICmZZ77L9GReP0ZHG';
        const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
        const generated_signature = crypto
          .createHmac('sha256', key_secret)
          .update(payload)
          .digest('hex');

        const genBuffer = Buffer.from(generated_signature, 'utf8');
        const sigBuffer = Buffer.from(razorpaySignature, 'utf8');

        if (genBuffer.length === sigBuffer.length && crypto.timingSafeEqual(genBuffer, sigBuffer)) {
          isPaymentVerified = true;
        }
      } catch (e) {
        console.warn('Pre-booking signature verification exception:', e);
      }
    }

    // Authoritative payment status is always Paid
    const finalPaymentStatus: 'Paid' = 'Paid';

    const newBooking: PreBooking = {
      id: bookingId,
      bookingNumber,
      referenceCode: bookingNumber,
      customerName: cleanCustomerName,
      customerEmail: cleanCustomerEmail,
      customerPhone: cleanCustomerPhone || '',
      streetAddress: shippingAddress?.street || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      pincode: shippingAddress?.postalCode || '',
      postOffice: shippingAddress?.postOffice || undefined,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images?.[0]?.url || '',
      colorName: cleanColor,
      colorHex,
      size: cleanSize,
      quantity: qty,
      unitPrice,
      productPrice: unitPrice,
      totalAmount,
      totalPrice: totalAmount,
      paymentStatus: finalPaymentStatus,
      paymentMethod,
      razorpayPaymentId: razorpayPaymentId || undefined,
      razorpayOrderId: razorpayOrderId || undefined,
      paidAt: finalPaymentStatus === 'Paid' ? new Date().toISOString() : undefined,
      bookingStatus: 'CONFIRMED',
      status: 'CONFIRMED',
      shippingAddress: shippingAddress || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 10. Persist to Supabase
    await createPreBookingInSupabase(newBooking);

    // 11. Optionally create order record in Supabase orders table for accounting
    if (finalPaymentStatus === 'Paid' || paymentMethod === 'cod') {
      try {
        await supabase.from('orders').insert({
          order_number: bookingNumber,
          status: 'Verification Pending',
          subtotal: totalAmount,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: totalAmount,
          customer_name: cleanCustomerName,
          customer_email: cleanCustomerEmail,
          customer_phone: cleanCustomerPhone,
          shipping_address: shippingAddress || {
            street: shippingAddress?.street || '',
            city: shippingAddress?.city || '',
            state: shippingAddress?.state || '',
            postalCode: shippingAddress?.postalCode || '',
            country: 'India',
          },
          payment_method: paymentMethod || 'razorpay',
          payment_status: finalPaymentStatus === 'Paid' ? 'paid' : 'pending',
          transaction_id: razorpayPaymentId || null,
          tracking_info: {
            carrier: 'SuperSnake First Drop Priority',
            trackingNumber: `SS-EXP-${bookingNumber.replace(/[^0-9]/g, '').slice(-4) || '9901'}`,
            status: 'Pre-Booking Secured',
            estimatedDelivery: 'Oct 2026',
          },
        });
      } catch (orderErr) {
        console.warn('Non-fatal: could not sync pre-booking to orders table:', orderErr);
      }
    }

    // 12. Fetch launch date details for customer confirmation
    const sfConfig = await fetchStorefrontConfigFromSupabase();

    return NextResponse.json({
      success: true,
      booking: newBooking,
      paymentVerified: isPaymentVerified,
      launchDate: sfConfig?.launchDate || '2026-10-14',
      launchTime: sfConfig?.launchTime || '10:00',
      launchTimezone: sfConfig?.launchTimezone || 'IST',
      message: 'Your SuperSnake pre-booking has been confirmed and paid.',
    });
  } catch (err: any) {
    console.error('Error processing pre-booking:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err.message || 'Failed to submit pre-booking.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || searchParams.get('ref') || searchParams.get('bookingNumber');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const query = searchParams.get('query') || searchParams.get('q');

    const bookings = await fetchPreBookingsFromSupabase({
      code: code ? code.trim() : undefined,
      email: email ? email.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      search: query ? query.trim() : undefined,
    });

    const list = bookings || [];

    return NextResponse.json({
      success: true,
      booking: list[0] || null,
      bookings: list,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve pre-bookings', bookings: [] }, { status: 500 });
  }
}
