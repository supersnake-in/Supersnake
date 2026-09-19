import { BRAND, formatPrice } from '@/lib/design-tokens';
import { Order } from '@/lib/types';

const BASE_WRAPPER = (title: string, bodyContent: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
  </head>
  <body style="background-color: #000000; color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
    <table align="center" width="600" style="max-width: 600px; background-color: #0c0c0c; border: 1px solid #222222; border-radius: 4px; padding: 36px;">
      <tr>
        <td align="center" style="padding-bottom: 24px; border-bottom: 1px solid #222222;">
          <h1 style="color: #ffffff; letter-spacing: 0.3em; margin: 0; font-size: 20px; font-weight: 700;">SUPERSNAKE</h1>
          <p style="color: #04fc21; font-size: 10px; letter-spacing: 0.25em; margin-top: 6px; text-transform: uppercase;">WEAR YOUR INSTINCT.</p>
        </td>
      </tr>
      ${bodyContent}
      <tr>
        <td style="padding-top: 28px; border-top: 1px solid #222222; text-align: center; color: #666666; font-size: 10px; font-family: monospace; letter-spacing: 0.1em; line-height: 1.6;">
          SUPERSNAKE APPAREL ATELIER • INDIRANAGAR, BENGALURU 560038, INDIA<br/>
          FOR INQUIRIES, REACH CONCIERGE AT ${BRAND.contact.email}
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export function getWelcomeEmailHtml({ name, email }: { name: string; email: string }): string {
  const content = `
    <tr>
      <td style="padding: 28px 0;">
        <p style="color: #04fc21; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; margin: 0;">
          PATRON ENROLLMENT CONFIRMED
        </p>
        <h2 style="color: #ffffff; font-size: 22px; font-weight: 500; margin: 12px 0 16px 0;">
          WELCOME TO THE ATELIER, ${name.toUpperCase()}.
        </h2>
        <p style="color: #a0a0a0; font-size: 13px; line-height: 1.7; margin-bottom: 24px;">
          Your patron profile has been activated. You now have privileged access to private exhibitions, 15-minute early access windows on limited heavyweight drops, and archived order tracking.
        </p>
        <div style="text-align: center; padding: 16px 0;">
          <a href="https://supersnake.in/shop" style="background-color: #ffffff; color: #000000; padding: 14px 28px; font-size: 11px; font-family: monospace; letter-spacing: 0.2em; text-decoration: none; font-weight: 700; text-transform: uppercase; display: inline-block;">
            EXPLORE THE COLLECTION
          </a>
        </div>
      </td>
    </tr>
  `;
  return BASE_WRAPPER('SUPERSNAKE — Welcome to the Atelier', content);
}

export function getOrderConfirmationHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #1a1a1a;">
        <strong style="color: #ffffff; text-transform: uppercase; font-size: 13px;">${item.productName}</strong><br/>
        <span style="color: #888888; font-size: 11px; font-family: monospace;">Color: ${item.color} | Size: ${item.size} | Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 14px 0; border-bottom: 1px solid #1a1a1a; text-align: right; color: #ffffff; font-family: monospace; font-size: 13px;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `
    )
    .join('');

  const content = `
    <tr>
      <td style="padding: 28px 0;">
        <p style="color: #04fc21; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; margin: 0;">
          ACQUISITION CONFIRMED ✓
        </p>
        <h2 style="color: #ffffff; font-size: 22px; font-weight: 500; margin: 8px 0 16px 0;">
          Order ${order.orderNumber}
        </h2>
        <p style="color: #a0a0a0; font-size: 13px; line-height: 1.7;">
          Greetings ${order.customer.name},<br/><br/>
          Your heavyweight pieces have entered tailoring inspection and packaging at our Bengaluru studio. Your parcel will be routed for tracked delivery with our courier partner.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <table width="100%" style="border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="border-bottom: 1px solid #333333; text-align: left; font-size: 11px; color: #888888; text-transform: uppercase; font-family: monospace;">
              <th style="padding-bottom: 8px;">Garment</th>
              <th style="padding-bottom: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 16px; color: #888888; font-size: 12px; font-family: monospace;">Total Paid (Inclusive of all taxes):</td>
              <td style="padding-top: 16px; text-align: right; color: #04fc21; font-size: 16px; font-weight: bold; font-family: monospace;">${formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 0;">
        <div style="background-color: #121212; border: 1px solid #222222; padding: 16px; font-size: 12px; font-family: monospace; color: #cccccc;">
          <strong style="color: #ffffff;">DISPATCHING TO:</strong><br/>
          ${order.shippingAddress.fullName}<br/>
          ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}
        </div>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding-top: 12px;">
        <a href="https://supersnake.in/track-order" style="background-color: #04fc21; color: #000000; padding: 12px 24px; font-size: 11px; font-family: monospace; letter-spacing: 0.15em; text-decoration: none; font-weight: 700; text-transform: uppercase; display: inline-block;">
          TRACK ORDER LIVE
        </a>
      </td>
    </tr>
  `;

  return BASE_WRAPPER('SUPERSNAKE — Order Confirmed', content);
}

export function getShippedEmailHtml(order: Order): string {
  const content = `
    <tr>
      <td style="padding: 28px 0;">
        <p style="color: #04fc21; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; margin: 0;">
          DISPATCH TRANSMITTED // AIR EXPRESS
        </p>
        <h2 style="color: #ffffff; font-size: 22px; font-weight: 500; margin: 8px 0 16px 0;">
          Order ${order.orderNumber} is on the Move
        </h2>
        <p style="color: #a0a0a0; font-size: 13px; line-height: 1.7;">
          Your parcel has departed our Bengaluru fulfillment center. It is currently in transit with <strong>${order.tracking?.carrier || 'our courier partner'}</strong>.
        </p>
        <div style="background-color: #121212; border: 1px solid #222222; padding: 18px; margin: 20px 0; font-family: monospace; font-size: 12px;">
          <div style="color: #888888; font-size: 10px; margin-bottom: 4px;">WAYBILL NUMBER</div>
          <div style="color: #ffffff; font-size: 15px; font-weight: bold; letter-spacing: 0.1em;">${order.tracking?.trackingNumber || 'SS-EXP-AIR'}</div>
          <div style="color: #888888; font-size: 10px; margin-top: 12px; margin-bottom: 4px;">ESTIMATED ARRIVAL</div>
          <div style="color: #04fc21; font-size: 13px; font-weight: bold;">${order.tracking?.estimatedDelivery || 'Within 2–3 Days'}</div>
        </div>
        <div style="text-align: center; padding-top: 10px;">
          <a href="https://supersnake.in/track-order" style="background-color: #ffffff; color: #000000; padding: 12px 24px; font-size: 11px; font-family: monospace; letter-spacing: 0.15em; text-decoration: none; font-weight: 700; text-transform: uppercase; display: inline-block;">
            TRACK LIVE ON RADAR
          </a>
        </div>
      </td>
    </tr>
  `;
  return BASE_WRAPPER('SUPERSNAKE — Order Dispatched', content);
}

export function getDeliveredEmailHtml(order: Order): string {
  const content = `
    <tr>
      <td style="padding: 28px 0;">
        <p style="color: #04fc21; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; margin: 0;">
          DESTINATION REACHED ✓
        </p>
        <h2 style="color: #ffffff; font-size: 22px; font-weight: 500; margin: 8px 0 16px 0;">
          Order ${order.orderNumber} Delivered
        </h2>
        <p style="color: #a0a0a0; font-size: 13px; line-height: 1.7;">
          Your parcel was successfully handed over at ${order.shippingAddress.city}. We hope you appreciate the weight, drape, and tactile presence of the garment.
        </p>
        <p style="color: #a0a0a0; font-size: 13px; line-height: 1.7;">
          Should you experience any manufacturing defect or transit damage, please notify our concierge within 48 hours of delivery as outlined in our Returns &amp; Defects policy.
        </p>
        <div style="text-align: center; padding-top: 18px;">
          <a href="https://supersnake.in/account/orders/${order.id}" style="background-color: #ffffff; color: #000000; padding: 12px 24px; font-size: 11px; font-family: monospace; letter-spacing: 0.15em; text-decoration: none; font-weight: 700; text-transform: uppercase; display: inline-block;">
            VIEW ORDER IN ACCOUNT
          </a>
        </div>
      </td>
    </tr>
  `;
  return BASE_WRAPPER('SUPERSNAKE — Delivered', content);
}

export function getReturnApprovedHtml({ orderNumber, customerName }: { orderNumber: string; customerName: string }): string {
  const content = `
    <tr>
      <td style="padding: 28px 0;">
        <p style="color: #04fc21; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; margin: 0;">
          RETURN APPROVED // REVERSE PICKUP SCHEDULED
        </p>
        <h2 style="color: #ffffff; font-size: 22px; font-weight: 500; margin: 8px 0 16px 0;">
          Return for Order ${orderNumber}
        </h2>
        <p style="color: #a0a0a0; font-size: 13px; line-height: 1.7;">
          Greetings ${customerName},<br/><br/>
          Your return/exchange request for order ${orderNumber} has been verified by our logistics team. Our courier partner has been scheduled for doorstep reverse pickup within 24–48 hours.
        </p>
        <div style="background-color: #121212; border: 1px solid #222222; padding: 16px; font-size: 12px; font-family: monospace; color: #cccccc; margin: 16px 0;">
          <strong style="color: #ffffff;">RETURN CHECKLIST:</strong><br/>
          1. Garment must be unworn and unwashed with original atelier hangtags intact.<br/>
          2. Place inside the protective packaging bag provided with your order.
        </div>
      </td>
    </tr>
  `;
  return BASE_WRAPPER('SUPERSNAKE — Return Approved', content);
}
