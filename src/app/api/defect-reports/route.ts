import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { DefectReport } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      productId,
      productName,
      productColor,
      productSize,
      productImage,
      defectType,
      description,
      images,
      videoUrl,
    } = body;

    if (!orderNumber || !customerName || !customerEmail || !productName || !description) {
      return NextResponse.json(
        { error: 'Missing required defect reporting fields.' },
        { status: 400 }
      );
    }

    const timestamp = Date.now().toString().slice(-4);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reportNumber = `SS-DEF-${new Date().getFullYear()}-${timestamp}`;
    const id = `def-${Date.now()}-${randomSuffix}`;

    const newReport: DefectReport = {
      id,
      reportNumber,
      orderId: orderId || '',
      orderNumber: orderNumber.trim(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone ? customerPhone.trim() : '',
      productId,
      productName,
      productColor,
      productSize,
      productImage,
      defectType: defectType || 'General Defect',
      description: description.trim(),
      images: Array.isArray(images) ? images : [],
      videoUrl: videoUrl || null,
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Attempt Supabase insert
    try {
      await supabase.from('defect_reports').insert({
        id: newReport.id,
        report_number: newReport.reportNumber,
        order_id: newReport.orderId,
        order_number: newReport.orderNumber,
        customer_name: newReport.customerName,
        customer_email: newReport.customerEmail,
        customer_phone: newReport.customerPhone,
        product_id: newReport.productId || null,
        product_name: newReport.productName,
        product_color: newReport.productColor || null,
        product_size: newReport.productSize || null,
        product_image: newReport.productImage || null,
        defect_type: newReport.defectType,
        description: newReport.description,
        images: newReport.images,
        video_url: newReport.videoUrl,
        status: newReport.status,
      });
    } catch (dbErr) {
      console.warn('Could not insert to Supabase defect_reports:', dbErr);
    }

    return NextResponse.json({ success: true, report: newReport });
  } catch (err: any) {
    console.error('Error handling defect report submission:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing defect report.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('defect_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ reports: [] });
    }

    return NextResponse.json({ reports: data || [] });
  } catch (err: any) {
    return NextResponse.json({ reports: [] });
  }
}
