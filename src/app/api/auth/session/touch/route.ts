import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user?.id) {
        userId = user.id;
      }
    }

    // Also support payload userId if authenticated through client session
    if (!userId) {
      try {
        const body = await request.json();
        if (body?.userId) {
          userId = body.userId;
        }
      } catch (e) {}
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthenticated session touch request' },
        { status: 401 }
      );
    }

    // Update last_login_at in public.profiles server-side
    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        last_login_at: now,
        updated_at: now,
      })
      .eq('id', userId);

    if (updateErr) {
      console.warn('Session touch db notice:', updateErr.message);
    }

    return NextResponse.json({
      success: true,
      lastLoginAt: now,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
