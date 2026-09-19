import { BRAND, formatPrice } from '@/lib/design-tokens';
import { Order } from '@/lib/types';

export function getOrderConfirmationHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #222222;">
        <strong style="color: #ffffff; text-transform: uppercase;">${item.productName}</strong><br/>
        <span style="color: #888888; font-size: 11px;">Color: ${item.color} | Size: ${item.size} | Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #222222; text-align: right; color: #ffffff;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>SUPERSNAKE — Order Confirmed</title>
      </head>
      <body style="background-color: #000000; color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px 20px;">
        <table align="center" width="600" style="max-width: 600px; background-color: #0c0c0c; border: 1px solid #222222; border-radius: 8px; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #222222;">
              <h1 style="color: #ffffff; letter-spacing: 0.3em; margin: 0; font-size: 18px;">SUPERSNAKE</h1>
              <p style="color: #04fc21; font-size: 10px; letter-spacing: 0.2em; margin-top: 6px; text-transform: uppercase;">WEAR YOUR INSTINCT.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 0;">
              <p style="color: #04fc21; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: bold; margin: 0;">ACQUISITION CONFIRMED ✓</p>
              <h2 style="color: #ffffff; font-size: 20px; margin: 8px 0 16px 0;">Order ${order.orderNumber}</h2>
              <p style="color: #a0a0a0; font-size: 13px; line-height: 1.6;">
                Greetings ${order.customer.name},<br/><br/>
                Your heavyweight garments have entered tailoring and preparation at our Bengaluru studio. You will receive real-time updates as your parcel dispatches via Blue Dart Air Express.
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <table width="100%" style="border-collapse: collapse; margin: 16px 0;">
                <thead>
                  <tr style="border-bottom: 1px solid #333333; text-align: left; font-size: 11px; color: #888888; text-transform: uppercase;">
                    <th style="padding-bottom: 8px;">Garment</th>
                    <th style="padding-bottom: 8px; text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding-top: 16px; color: #888888; font-size: 12px;">Total Paid (Inclusive of all taxes):</td>
                    <td style="padding-top: 16px; text-align: right; color: #04fc21; font-size: 16px; font-weight: bold;">${formatPrice(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid #222222; text-align: center; color: #666666; font-size: 10px; letter-spacing: 0.1em;">
              SUPERSNAKE APPAREL INDIA PVT LTD • INDIRANAGAR, BENGALURU 560038<br/>
              QUESTIONS? CONTACT CONCIERGE@SUPERSNAKE.IN
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
