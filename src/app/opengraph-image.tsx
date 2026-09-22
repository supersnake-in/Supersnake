import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SUPERSNAKE | Wear Your Instinct | Premium Heavyweight T-Shirts';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#050505',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #151515 0%, #000000 100%)',
          padding: '60px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#ffffff',
          border: '12px solid #0d0d0d',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            paddingBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 900,
              letterSpacing: '0.3em',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span>SUPERSNAKE</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#04fc21',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '14px',
              letterSpacing: '0.25em',
              color: '#888888',
              fontFamily: 'monospace',
            }}
          >
            ATELIER EDITION • BENGALURU
          </div>
        </div>

        {/* Center Editorial Hero */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            margin: '40px 0',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              letterSpacing: '0.35em',
              color: '#04fc21',
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            MONOLITHIC HEAVYWEIGHT APPAREL
          </div>

          <div
            style={{
              fontSize: '68px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              textTransform: 'uppercase',
              color: '#ffffff',
            }}
          >
            WEAR YOUR INSTINCT.
          </div>

          <div
            style={{
              fontSize: '20px',
              color: '#a1a1aa',
              letterSpacing: '0.05em',
              maxWidth: '850px',
              lineHeight: 1.4,
            }}
          >
            Architectural silhouettes cut from 280–300 GSM combed Supima® cotton. Zero-sag collars. Built for permanent presence.
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '24px',
              fontSize: '13px',
              letterSpacing: '0.2em',
              color: '#71717a',
              fontFamily: 'monospace',
            }}
          >
            <span>280–300 GSM</span>
            <span>•</span>
            <span>BOXY & OVERSIZED</span>
            <span>•</span>
            <span>MADE IN INDIA</span>
          </div>

          <div
            style={{
              fontSize: '15px',
              letterSpacing: '0.25em',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'monospace',
            }}
          >
            SUPERSNAKE.IN
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
