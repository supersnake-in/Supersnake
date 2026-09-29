import { NextRequest, NextResponse } from 'next/server';

// In-memory Edge cache to ensure sub-millisecond middleware execution
let edgeMaintenanceState = {
  active: false,
  message: '',
  restoreTime: null as string | null,
};
let lastFetchTime = 0;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ioinroemaheajqhwsgxr.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvaW5yb2VtYWhlYWpxaHdzZ3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3OTQ5MDksImV4cCI6MjEwNTM3MDkwOX0.zIeBSkNWxzAz4q8b5GPiMBEJtOTXkrYC7_5Co1c9frs';

/**
 * Fetch maintenance status from Supabase with 2-second in-memory Edge caching
 */
async function getMaintenanceStatus(): Promise<{
  active: boolean;
  message: string;
  restoreTime: string | null;
}> {
  const now = Date.now();
  // Return cached result if within 2000ms
  if (now - lastFetchTime < 2000 && lastFetchTime > 0) {
    return edgeMaintenanceState;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

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
        edgeMaintenanceState = {
          active: Boolean(data[0].maintenance_mode),
          message: data[0].maintenance_message || '',
          restoreTime: data[0].estimated_restore_time || null,
        };
        lastFetchTime = now;
      }
    }
  } catch (err) {
    // If network or database is unavailable, retain last known state
    lastFetchTime = now;
  }

  return edgeMaintenanceState;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Always allow Next.js system internals and static asset requests
  if (
    pathname.startsWith('/_next') ||
    pathname === '/api/maintenance' ||
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

  // 4. Retrieve current maintenance status
  const { active: isMaintenanceActive, restoreTime } = await getMaintenanceStatus();

  // CASE A: MAINTENANCE MODE IS ACTIVE (Storefront is locked down)
  if (isMaintenanceActive) {
    // A1. Customer-facing API routes: Respond with HTTP 503 Service Unavailable
    if (pathname.startsWith('/api/')) {
      const retrySeconds = restoreTime
        ? Math.max(60, Math.floor((new Date(restoreTime).getTime() - Date.now()) / 1000))
        : 1800;

      return new NextResponse(
        JSON.stringify({
          error: 'Service Unavailable',
          message: 'The SuperSnake atelier is currently undergoing scheduled maintenance.',
          maintenance: true,
          estimatedRestoreTime: restoreTime,
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

    // A2. The /maintenance page itself: Allow access, but stamp with HTTP 503 & SEO noindex headers
    if (pathname === '/maintenance') {
      const response = NextResponse.next();
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      if (restoreTime) {
        const retrySeconds = Math.max(60, Math.floor((new Date(restoreTime).getTime() - Date.now()) / 1000));
        response.headers.set('Retry-After', String(retrySeconds));
      }
      return response;
    }

    // A3. All other customer-facing storefront routes: Intercept & redirect to /maintenance
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = '/maintenance';

    const response = NextResponse.redirect(maintenanceUrl, { status: 307 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // CASE B: MAINTENANCE MODE IS OFF (Storefront is normal)
  // If a customer tries to access /maintenance directly when maintenance is OFF, redirect to home
  if (pathname === '/maintenance') {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    return NextResponse.redirect(homeUrl, { status: 307 });
  }

  // Proceed with normal storefront request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
