import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount: clientAmount, currency = 'INR', customer, shippingAddress, items, orderId, couponCode } = body;

    // 1. Validate Customer Information
    if (!customer?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      return NextResponse.json(
        { error: 'A valid customer email address is required.' },
        { status: 400 }
      );
    }

    const cleanPhone = customer?.phone ? customer.phone.replace(/\D/g, '').slice(-10) : '';
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'A valid 10-digit mobile phone number is required for delivery.' },
        { status: 400 }
      );
    }

    // 2. Validate Delivery Address
    if (shippingAddress) {
      const { fullName, street, city, state, postalCode } = shippingAddress;
      if (!fullName || !street || !city || !state || !postalCode) {
        return NextResponse.json(
          { error: 'Incomplete delivery address. Full Name, Street, City, State, and PIN Code are required.' },
          { status: 400 }
        );
      }
    }

    // 3. Authoritative Order Calculation
    let calculatedAmount = clientAmount;
    if (Array.isArray(items) && items.length > 0) {
      const subtotal = items.reduce((sum: number, it: any) => {
        const itemPrice = Number(it.price) || 0;
        const itemQty = Math.max(1, Number(it.quantity) || 1);
        return sum + (itemPrice * itemQty);
      }, 0);

      const shipping = subtotal >= 2999 ? 0 : 150;
      const totalInRupees = subtotal + shipping;
      calculatedAmount = Math.round(totalInRupees * 100);
    }

    // Minimum amount validation: 100 paise (1 INR)
    if (!calculatedAmount || typeof calculatedAmount !== 'number' || calculatedAmount < 100) {
      return NextResponse.json(
        { error: 'Authoritative order amount must be at least 100 paise (₹1.00)' },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TeKVwwxJXp1r5I';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'i01HJRIICmZZ77L9GReP0ZHG';

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // Create core Razorpay Order for Standard Checkout
    const order = await razorpay.orders.create({
      amount: Math.round(calculatedAmount),
      currency: currency || 'INR',
      receipt: `rcpt_${orderId || Date.now()}`.slice(0, 40),
      notes: {
        orderId: orderId || '',
        customerName: customer?.name || '',
        customerEmail: customer?.email || '',
        customerPhone: cleanPhone,
        couponCode: couponCode || '',
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
