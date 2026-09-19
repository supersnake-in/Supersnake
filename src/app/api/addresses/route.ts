import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ addresses: [] });
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching addresses from Supabase:', error.message);
      return NextResponse.json({ addresses: [] });
    }

    return NextResponse.json({ addresses: data || [] });
  } catch (err: any) {
    console.error('Addresses GET API error:', err);
    return NextResponse.json({ addresses: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      label = 'Home',
      fullName,
      phone,
      street,
      landmark,
      city,
      state,
      postalCode,
      country = 'India',
      isDefault = false,
    } = body;

    if (!userId || !fullName || !phone || !street || !city || !postalCode) {
      return NextResponse.json(
        { error: 'Missing required address fields.' },
        { status: 400 }
      );
    }

    // If marked as default, unset other default addresses
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        label,
        full_name: fullName,
        phone,
        street,
        landmark,
        city,
        state: state || 'Karnataka',
        postal_code: postalCode,
        country,
        is_default: isDefault,
      })
      .select()
      .single();

    if (error) {
      console.warn('Address insert error:', error.message);
      return NextResponse.json(
        { error: 'Could not save address.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, address: data });
  } catch (err: any) {
    console.error('Address POST API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'Address ID and User ID required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: 'Could not delete address.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
