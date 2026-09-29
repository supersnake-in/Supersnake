import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/security';
import { fetchPreBookingsFromSupabase, updatePreBookingInSupabase } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminEmail = searchParams.get('adminEmail');

    if (!isAuthorizedAdmin(adminEmail)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin authorization required.' },
        { status: 403 }
      );
    }

    const bookings = await fetchPreBookingsFromSupabase();
    return NextResponse.json({ bookings: bookings || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, bookingStatus, paymentStatus, adminNotes, adminEmail } = body;

    if (!isAuthorizedAdmin(adminEmail)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin authorization required.' },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: 'Pre-Booking ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (bookingStatus) updates.bookingStatus = bookingStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const success = await updatePreBookingInSupabase(id, updates);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
