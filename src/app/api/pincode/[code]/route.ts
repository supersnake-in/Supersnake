import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    if (!code || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json(
        { success: false, error: 'Invalid 6-digit PIN code' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://api.postalpincode.in/pincode/${cleanCode}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'SuperSnake-Ecom/1.0',
        },
        next: { revalidate: 86400 }, // Cache postal data for 24 hours
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch PIN code data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (
      Array.isArray(data) &&
      data[0] &&
      data[0].Status === 'Success' &&
      Array.isArray(data[0].PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const postOfficesRaw = data[0].PostOffice;
      const district = postOfficesRaw[0].District || postOfficesRaw[0].Division || '';
      const state = postOfficesRaw[0].State || '';

      const postOffices = postOfficesRaw.map((po: any) => ({
        name: po.Name,
        branchType: po.BranchType || '',
        deliveryStatus: po.DeliveryStatus || '',
        district: po.District || '',
        state: po.State || '',
      }));

      return NextResponse.json({
        success: true,
        pincode: cleanCode,
        district,
        state,
        postOffices,
      });
    }

    return NextResponse.json({
      success: false,
      error: data[0]?.Message || 'No records found for this PIN code',
    });
  } catch (error: any) {
    console.error('PIN code lookup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error looking up PIN code' },
      { status: 500 }
    );
  }
}
