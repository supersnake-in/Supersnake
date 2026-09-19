'use client';

import React from 'react';
import Link from 'next/link';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { LEGAL_CONFIG, getLegalValue } from '@/lib/legal-config';
import { AlertCircle, CheckCircle2, Clock, RotateCcw, ArrowRight } from 'lucide-react';

const TOC = [
  { id: 'cancellation-window', title: '1. Permitted Cancellation Window' },
  { id: 'post-dispatch', title: '2. Orders Already Packed or Dispatched' },
  { id: 'how-to-cancel', title: '3. How to Request an Order Cancellation' },
  { id: 'refund-terms', title: '4. Refund Processing & Banking Timelines' },
  { id: 'cancellation-by-supersnake', title: '5. Cancellation Initiated by SuperSnake' },
];

const RELATED = [
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Returns & Defects', href: '/returns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
];

export default function CancellationPolicyPage() {
  const supportEmail = LEGAL_CONFIG.supportEmail || 'support@supersnake.in';

  return (
    <PolicyLayout
      category="CUSTOMER CARE"
      title="CANCELLATION POLICY"
      description="Guidelines on order cancellations, pre-dispatch modification windows, refund initiation, and atelier cancellation protocols."
      tableOfContents={TOC}
      relatedLinks={RELATED}
    >
      {/* Notice Card */}
      <div className="p-5 bg-[#0e0e0e] border border-white/10 rounded-sm space-y-2">
        <div className="flex items-center gap-2 text-snake-green text-xs font-semibold uppercase tracking-wider">
          <Clock size={16} />
          <span>TIME-SENSITIVE POLICY</span>
        </div>
        <p className="text-neutral-300 text-xs leading-relaxed">
          Orders enter preparation and logistics sorting shortly after payment confirmation. If you need to cancel, please notify our concierge team immediately.
        </p>
      </div>

      {/* Section 1: Permitted Cancellation Window */}
      <section id="cancellation-window" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          1. Permitted Cancellation Window
        </h2>
        <p>
          You may request cancellation of your order only while it remains in <strong className="text-white font-normal">Pending</strong> or <strong className="text-white font-normal">Processing</strong> status, prior to being packed, manifested, or handed over to our courier partners.
        </p>
        <p>
          Because our fulfillment desk prioritizes prompt turnarounds, the cancellation window is narrow. We recommend contacting us within two (2) hours of placing your order for the highest likelihood of successful intervention.
        </p>
      </section>

      {/* Section 2: Orders Already Packed or Dispatched */}
      <section id="post-dispatch" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          2. Orders Already Packed or Dispatched
        </h2>
        <div className="p-4 bg-[#0a0a0a] border border-white/15 rounded-sm space-y-2">
          <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs uppercase">
            <AlertCircle size={15} className="text-snake-green" />
            <span>NO CANCELLATION POST-DISPATCH</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Once an order status transitions to <strong className="text-white font-normal">Packed</strong>, <strong className="text-white font-normal">Manifested</strong>, or <strong className="text-white font-normal">Dispatched</strong>, cancellation is no longer operationally possible.
          </p>
          <p className="text-[11px] text-neutral-500">
            Couriers cannot recall individual consignments from automated air cargo sorting streams. In such cases, the customer must receive the shipment. If the delivered piece arrives damaged or defective, our <Link href="/returns" className="text-snake-green hover:underline">Returns & Defects</Link> protocol applies.
          </p>
        </div>
      </section>

      {/* Section 3: How to Request an Order Cancellation */}
      <section id="how-to-cancel" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          3. How to Request an Order Cancellation
        </h2>
        <p>
          To request an immediate cancellation, please reach out through our official support channels:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-neutral-400">
          <li>
            <strong className="text-white font-normal">Via Email:</strong> Send an email to <strong className="text-neutral-200 font-normal">{getLegalValue(LEGAL_CONFIG.supportEmail, 'SUPPORT_EMAIL')}</strong> with the subject line: <code className="text-snake-green font-mono bg-neutral-900 px-1.5 py-0.5 rounded text-[11px]">URGENT CANCELLATION — Order #[ORDER NUMBER]</code>.
          </li>
          <li>
            <strong className="text-white font-normal">Via Contact Portal:</strong> Submit an urgent message through our <Link href="/contact" className="text-snake-green hover:underline">Contact Us</Link> portal selecting &ldquo;Order Inquiry &amp; Logistics&rdquo;.
          </li>
        </ul>
        <p className="text-xs text-neutral-400">
          Please provide your full name, registered email address, and order number in your message.
        </p>
      </section>

      {/* Section 4: Refund Processing & Banking Timelines */}
      <section id="refund-terms" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          4. Refund Processing & Banking Timelines
        </h2>
        <p>
          Upon successful cancellation of an order prior to dispatch, a full refund of the amount paid (including any applicable shipping fee charged) will be initiated to your original payment method.
        </p>
        <p>
          Where a refund is approved, the refund will be initiated through the applicable payment method/provider. The time taken for the amount to reflect in the customer&apos;s account may vary depending on the payment provider, gateway clearing cycles, and the customer&apos;s banking system.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li><strong className="text-white font-normal">UPI Transactions:</strong> Typically reflected within 24–48 hours post-gateway reversal.</li>
          <li><strong className="text-white font-normal">Credit / Debit Cards:</strong> Typically reflected within 3–7 business days, subject to card issuer clearing cycles.</li>
          <li><strong className="text-white font-normal">Net Banking:</strong> Dependent on the individual bank&apos;s NEFT/IMPS settlement schedule.</li>
        </ul>
      </section>

      {/* Section 5: Cancellation Initiated by SuperSnake */}
      <section id="cancellation-by-supersnake" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          5. Cancellation Initiated by SuperSnake
        </h2>
        <p>
          SuperSnake reserves the right to cancel an order prior to dispatch under exceptional circumstances, including:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
          <li>Unforeseen inventory discrepancy where an ordered item is found damaged or unavailable during pre-dispatch quality checks;</li>
          <li>Inability of logistics partners to service the specified delivery PIN code;</li>
          <li>Detection of fraudulent transaction indicators or unauthorized payment attempts;</li>
          <li>Incomplete shipping or recipient contact information that remains uncorrected after reasonable customer outreach.</li>
        </ul>
        <p>
          If SuperSnake initiates an order cancellation, you will receive written electronic notification explaining the cause, and 100% of the funds debited will be promptly reversed to your original payment method.
        </p>
      </section>
    </PolicyLayout>
  );
}
