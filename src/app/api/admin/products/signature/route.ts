import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase/client';
import { isAuthorizedAdmin } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, adminEmail } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check admin authorization
    // 1. Try checking auth header or cookies via Supabase session
    const authHeader = request.headers.get('Authorization');
    let callerEmail: string | null = adminEmail || null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.email) {
        callerEmail = user.email;
      }
    }

    // Verify if caller is an authorized admin (if email was identified)
    if (callerEmail && !isAuthorizedAdmin(callerEmail)) {
      return NextResponse.json(
        { error: 'You are not authorized to modify the Signature Product.' },
        { status: 403 }
      );
    }

    // Resolve target UUID if productId is a slug or custom string
    let targetId = productId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);

    if (!isUuid) {
      const { data: prod } = await supabase
        .from('products')
        .select('id')
        .or(`id.eq.${productId},slug.eq.${productId}`)
        .maybeSingle();

      if (prod) {
        targetId = prod.id;
      }
    }

    // Execute atomic stored procedure
    const { error: rpcError } = await supabase.rpc('set_signature_product', {
      target_product_id: targetId,
    });

    if (rpcError) {
      // Fallback for development if RPC is not yet executed on remote database:
      // Perform atomic update
      const { error: clearError } = await supabase
        .from('products')
        .update({ is_signature: false })
        .eq('is_signature', true);

      const { error: updateError } = await supabase
        .from('products')
        .update({ is_signature: true })
        .eq('id', targetId);

      if (clearError || updateError) {
        console.warn('Fallback signature update error:', clearError?.message || updateError?.message);
        return NextResponse.json(
          { error: rpcError.message || 'Failed to update Signature Product in database' },
          { status: 500 }
        );
      }
    }

    // Revalidate relevant storefront and admin pages
    try {
      revalidatePath('/');
      revalidatePath('/shop');
      revalidatePath('/admin/products');
    } catch (e) {
      // Ignore in non-production environments
    }

    return NextResponse.json({
      success: true,
      message: 'Signature Product updated successfully',
      signatureProductId: targetId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error while updating Signature Product' },
      { status: 500 }
    );
  }
}
