import { NextRequest, NextResponse } from 'next/server';

export type StorefrontMode = 'PRE_LAUNCH' | 'LIVE' | 'MAINTENANCE';

// In-memory Edge cache for sub-millisecond middleware execution
let edgeStorefrontState = {
  mode: 'PRE_LAUNCH' as StorefrontMode,
  launchDate: '2026-10-14',
  launchTime: '10:00',
  launchTimezone: 'IST',
  automaticLaunch: false,
  maintenanceMessage: '',
  restoreTime: null as string | null,
};
let lastFetchTime = 0;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ioinroemaheajqhwsgxr.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvaW5yb2VtYWhlYWpxaHdzZ3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTQ5MDksImV4cCI6MjEwNTM3MDkwOX0.zIeBSkNWxzAz4q8b5GPiMBEJtOTXkrYC7_5Co1c9frs';

/**
 * Check if the current time has passed the configured launch datetime
 */
function isPastLaunch(launchDate: string, launchTime: string): boolean {
  try {
    const combined = `${launchDate}T${launchTime || '00:00'}:00+05:30`;
    const targetMs = new Date(combined).getTime();
    if (!isNaN(targetMs)) {
      return Date.now() >= targetMs;
    }
  } catch (e) {}
  return false;
}

/**
 * Fetch storefront mode from Supabase with 30-second in-memory Edge caching
 */
async function getStorefrontStatus(): Promise<typeof edgeStorefrontState> {
  const now = Date.now();
  if (now - lastFetchTime < 30000 && lastFetchTime > 0) {
    return edgeStorefrontState;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    // 1. Try fetching from storefront_config
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/storefront_config?id=eq.default&select=storefront_mode,launch_date,launch_time,launch_timezone,automatic_launch,maintenance_message,estimated_restore_time`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        signal: controller.signal,
        cache: 'no-store',
      }
    );

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        edgeStorefrontState = {
          mode: (data[0].storefront_mode as StorefrontMode) || 'PRE_LAUNCH',
          launchDate: data[0].launch_date || '2026-10-14',
          launchTime: data[0].launch_time || '10:00',
          launchTimezone: data[0].launch_timezone || 'IST',
          automaticLaunch: Boolean(data[0].automatic_launch),
          maintenanceMessage: data[0].maintenance_message || '',
          restoreTime: data[0].estimated_restore_time || null,
        };
        lastFetchTime = now;
        return edgeStorefrontState;
      }
    }
  } catch (err) {}

  // 2. Fallback to maintenance_config if storefront_config table is not yet migrated
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/maintenance_config?id=eq.default&select=maintenance_mode,maintenance_message,estimated_restore_time`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        signal: controller.signal,
        cache: 'no-store',
      }
    );

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const isMaint = Boolean(data[0].maintenance_mode);
        edgeStorefrontState = {
          mode: isMaint ? 'MAINTENANCE' : 'PRE_LAUNCH',
          launchDate: '2026-10-14',
          launchTime: '10:00',
          launchTimezone: 'IST',
          automaticLaunch: false,
          maintenanceMessage: data[0].maintenance_message || '',
          restoreTime: data[0].estimated_restore_time || null,
        };
        lastFetchTime = now;
      }
    }
  } catch (err) {
    lastFetchTime = now;
  }

  return edgeStorefrontState;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Always allow Next.js system internals and static asset requests
  if (
    pathname.startsWith('/_next') ||
    pathname === '/api/storefront-mode' ||
    pathname === '/api/maintenance' ||
    pathname.startsWith('/api/pre-booking') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/auth/callback' ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|woff|woff2|ttf|css|js)$/i)
  ) {
    return NextResponse.next();
  }

  // 2. Always allow Admin Portal routes (Admin access is completely isolated)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.next();
  }

  // 3. Allow Admin login route when explicitly requested by an admin
  if (pathname === '/login' && (searchParams.has('admin') || searchParams.has('atelier'))) {
    return NextResponse.next();
  }

  // 4. Retrieve current storefront mode and configuration
  const state = await getStorefrontStatus();
  let effectiveMode: StorefrontMode = state.mode;

  // Check automatic launch trigger
  if (
    effectiveMode === 'PRE_LAUNCH' &&
    state.automaticLaunch &&
    isPastLaunch(state.launchDate, state.launchTime)
  ) {
    effectiveMode = 'LIVE';
  }

  // =========================================================================
  // CASE 1: MAINTENANCE MODE (Storefront is locked down)
  // =========================================================================
  if (effectiveMode === 'MAINTENANCE') {
    // A1. Customer APIs: Return 503 Service Unavailable
    if (pathname.startsWith('/api/')) {
      const retrySeconds = state.restoreTime
        ? Math.max(60, Math.floor((new Date(state.restoreTime).getTime() - Date.now()) / 1000))
        : 1800;

      return new NextResponse(
        JSON.stringify({
          error: 'Service Unavailable',
          message: 'The SuperSnake atelier is currently undergoing scheduled curation.',
          maintenance: true,
          estimatedRestoreTime: state.restoreTime,
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retrySeconds),
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            Pragma: 'no-cache',
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
          },
        }
      );
    }

    // A2. /maintenance page itself: Allow access with noindex headers
    if (pathname === '/maintenance') {
      const response = NextResponse.next();
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }

    // A3. All other customer routes redirect to /maintenance
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = '/maintenance';
    const response = NextResponse.redirect(maintenanceUrl, { status: 307 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // =========================================================================
  // CASE 2: PRE-LAUNCH MODE (Exclusive First Drop & Pre-Booking Phase)
  // =========================================================================
  if (effectiveMode === 'PRE_LAUNCH') {
    // If visitor lands on /maintenance while in PRE_LAUNCH, redirect to /pre-launch
    if (pathname === '/maintenance') {
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = '/pre-launch';
      return NextResponse.redirect(targetUrl, { status: 307 });
    }

    // If customer visits root '/', rewrite internally to /pre-launch
    // This allows supersnake.in to cleanly present the pre-launch experience with NO ugly redirect!
    if (pathname === '/') {
      const preLaunchUrl = request.nextUrl.clone();
      preLaunchUrl.pathname = '/pre-launch';
      const response = NextResponse.rewrite(preLaunchUrl);
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      return response;
    }

    // Routes explicitly allowed during Pre-Launch:
    // - /pre-launch and /pre-launch/*
    // - /product/* (so customers can view and pre-book eligible products)
    // - /account and /account/* (for viewing pre-bookings)
    // - /login, /signup, /verify-email, /forgot-password, /reset-password
    // - Pre-booking APIs: /api/create-order, /api/verify-payment, /api/pincode, /api/newsletter
    // - Informational / Brand pages: /contact, /about, /privacy, /terms, /size-guide, /care-guide, /cookies
    if (
      pathname.startsWith('/pre-launch') ||
      pathname.startsWith('/product/') ||
      pathname.startsWith('/account') ||
      pathname.startsWith('/api/pincode') ||
      pathname === '/api/create-order' ||
      pathname === '/api/verify-payment' ||
      pathname === '/api/newsletter' ||
      pathname === '/track-order' ||
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/verify-email' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password' ||
      pathname === '/contact' ||
      pathname === '/about' ||
      pathname === '/privacy' ||
      pathname === '/terms' ||
      pathname === '/size-guide' ||
      pathname === '/care-guide' ||
      pathname === '/cookies'
    ) {
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      return response;
    }

    // Customer shopping APIs blocked during Pre-Launch:
    if (pathname === '/api/checkout') {
      return new NextResponse(
        JSON.stringify({
          error: 'Pre-Launch Active',
          message: 'Full checkout is currently disabled. Use exclusive Pre-Booking.',
          preLaunch: true,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // All unavailable live shopping routes (/shop, /collections, /cart, /bag, /checkout, /orders, /bestsellers, /men, /women, /new-drops):
    // Redirect to /pre-launch with 307
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/pre-launch';
    const response = NextResponse.redirect(redirectUrl, { status: 307 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return response;
  }

  // =========================================================================
  // CASE 3: LIVE MODE (Full Storefront Operational)
  // =========================================================================
  // If a visitor accesses /maintenance or /pre-launch when LIVE, redirect them to home
  if (pathname === '/maintenance' || pathname === '/pre-launch') {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    return NextResponse.redirect(homeUrl, { status: 307 });
  }

  // Allow normal storefront request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml
     * - static assets with file extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|woff|woff2|ttf|css|js)).*)',
  ],
};
