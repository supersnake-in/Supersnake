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
      quantity = 1,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentStatus = 'Reservation', // 'Reservation' | 'Paid'
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
      const existingBookings = await fetchPreBookingsFromSupabase();
      if (existingBookings) {
        const productBookingsCount = existingBookings
          .filter((b) => (b.productId === product.id || b.productSlug === product.slug) && b.bookingStatus !== 'CANCELLED')
          .reduce((sum, b) => sum + b.quantity, 0);

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
      }
    }

    // 6. Server-Side Price Calculation (prevent client manipulation)
    const unitPrice = Number(product.price);
    const totalAmount = unitPrice * qty;

    // 7. Generate Reference Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `pb-${Date.now()}-${randomSuffix}`;
    const bookingNumber = `SS-PB-${new Date().getFullYear()}-${randomSuffix}`;

    const colorHex = product.colors.find((c) => c.name.toLowerCase() === cleanColor.toLowerCase())?.hex || '#0a0a0a';

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
      paymentStatus: paymentStatus === 'Paid' ? 'Paid' : 'Reservation',
      bookingStatus: 'CONFIRMED',
      status: 'CONFIRMED',
      shippingAddress: shippingAddress || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 8. Persist to Supabase
    await createPreBookingInSupabase(newBooking);

    // 9. Fetch launch date details for customer confirmation
    const sfConfig = await fetchStorefrontConfigFromSupabase();

    return NextResponse.json({
      success: true,
      booking: newBooking,
      launchDate: sfConfig?.launchDate || '2026-10-14',
      launchTime: sfConfig?.launchTime || '10:00',
      launchTimezone: sfConfig?.launchTimezone || 'IST',
      message: 'Your SuperSnake pre-booking has been confirmed.',
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
    const email = searchParams.get('email');

    const bookings = await fetchPreBookingsFromSupabase();
    if (!bookings) {
      return NextResponse.json({ bookings: [] });
    }

    if (email) {
      const filtered = bookings.filter((b) => b.customerEmail.toLowerCase() === email.toLowerCase().trim());
      return NextResponse.json({ bookings: filtered });
    }

    return NextResponse.json({ bookings });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve pre-bookings', bookings: [] }, { status: 500 });
  }
}
