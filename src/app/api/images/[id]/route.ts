import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return new NextResponse('Image ID required', { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('url')
      .eq('id', id)
      .maybeSingle();

    if (error || !data || !data.url) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const rawUrl = data.url;

    // If external or already static path, redirect cleanly
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return NextResponse.redirect(rawUrl, { status: 307 });
    }

    // Decode base64 data URL and stream as optimized binary image
    if (rawUrl.startsWith('data:')) {
      const match = rawUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        return new NextResponse('Invalid image data', { status: 400 });
      }

      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(buffer.length),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Fallback relative redirect
    return NextResponse.redirect(new URL(rawUrl, req.url), { status: 307 });
  } catch (err: any) {
    console.error('Error serving product image:', err);
    return new NextResponse('Error serving image', { status: 500 });
  }
}
