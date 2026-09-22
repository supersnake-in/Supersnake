'use client';

import React from 'react';
import Link from 'next/link';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { LEGAL_CONFIG, getLegalValue } from '@/lib/legal-config';
import { Mail, AlertCircle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

const TOC = [
  { id: 'ordinary-purchases', title: 'Strict No-Return Policy for Ordinary Purchases' },
  { id: 'damaged-defective', title: 'Damaged, Defective or Non-Conforming Items' },
  { id: 'reporting-procedure', title: 'Email-First Reporting Procedure' },
  { id: 'evidence-required', title: 'Information & Evidence Required' },
  { id: 'investigation-remedies', title: 'Investigation & Potential Remedies' },
  { id: 'unauthorized-returns', title: 'No Unauthorized Returns' },
  { id: 'statutory-protection', title: 'Statutory Consumer Rights & Saving Clause' },
];

const RELATED = [
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Cancellation Policy', href: '/cancellation' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
];

export default function ReturnsAndDefectsPage() {
  const supportEmail = LEGAL_CONFIG.supportEmail || 'support@supersnake.in';
  const mailtoSubject = encodeURIComponent('Damage/Defect Complaint — Order #[ORDER NUMBER]');
  const mailtoBody = encodeURIComponent(
    'Please provide the following details:\n\n' +
    'Order Number:\n' +
    'Full Name:\n' +
    'Registered Email / Phone:\n' +
    'Description of Issue:\n\n' +
    '(Please attach clear photographs of the product, close-ups of the defect/damage, and pictures of outer packaging. If available, an unboxing video may also be attached).'
  );

  return (
    <PolicyLayout
      category="CUSTOMER CARE"
      title="RETURNS & DEFECTS"
      description="Everything you need to know about our strict ordinary purchase policy, damaged garment reporting, and defect resolution."
      tableOfContents={TOC}
      relatedLinks={RELATED}
    >
      {/* Notice Banner */}
      <div className="p-5 bg-[#0e0e0e] border border-white/10 rounded-sm space-y-2">
        <div className="flex items-center gap-2 text-snake-green text-xs font-semibold uppercase tracking-wider">
          <CheckCircle2 size={16} />
          <span>IMPORTANT NOTICE: ORDINARY PURCHASES</span>
        </div>
        <p className="text-neutral-300 text-xs leading-relaxed">
          SuperSnake operates under a strict no-return policy for ordinary purchases. Please consult our Size Guide and product specifications carefully prior to completing your acquisition.
        </p>
      </div>

      {/* Section 1: Ordinary Purchases */}
      <section id="ordinary-purchases" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          1. Strict No-Return Policy for Ordinary Purchases
        </h2>
        <p>
          SuperSnake follows a strict no-return policy for ordinary purchases. We do not accept returns, replacements, or exchanges for:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
          <li>Change of mind or preference after order placement or delivery;</li>
          <li>Incorrect size selection or fit preference;</li>
          <li>Colour, styling, or silhouette nuances differing from subjective expectations;</li>
          <li>Product no longer suiting personal preferences;</li>
          <li>Orders placed in error by the patron.</li>
        </ul>
        <p>
          Before dispatch, every SuperSnake garment is subjected to rigorous quality checks and carefully packed for transit. We take reasonable care to ensure that the product dispatched corresponds precisely to the customer&apos;s confirmed order.
        </p>
      </section>

      {/* Section 2: Damaged, Defective or Non-Conforming Items */}
      <section id="damaged-defective" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          2. Damaged, Defective or Non-Conforming Items
        </h2>
        <p>
          If you receive a garment that is physically damaged, defective in manufacturing (such as severe seam slippage, fabric tears, or structural stitching failure), materially different from what you ordered (such as an incorrect model, size, or colorway dispatched), or affected by an issue attributable to fulfillment or courier transit, please contact us by email as soon as reasonably possible so that the matter can be assessed.
        </p>
      </section>

      {/* Section 3: Email-First Reporting Procedure */}
      <section id="reporting-procedure" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          3. Email-First Reporting Procedure
        </h2>
        <p>
          To report a damaged, defective, or incorrect piece, customers must initiate contact via our official customer support email. We do not maintain an automated self-service return portal, nor are return pickups automatically authorized without review.
        </p>
        
        {/* Email CTA Box */}
        <div className="bg-[#0a0a0a] border border-snake-green/30 p-6 rounded-sm space-y-4 my-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block">
              OFFICIAL REPORTING CHANNEL
            </span>
            <h3 className="text-base font-display font-medium text-white">
              REPORT A DAMAGED OR DEFECTIVE PRODUCT
            </h3>
            <p className="text-xs text-neutral-400">
              Submit your defect claim with order verification, item selection, and photographic/video evidence.
            </p>
          </div>

          <Link
            href="/returns/report"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
          >
            <ShieldAlert size={15} />
            <span>REPORT DAMAGED OR DEFECTIVE PRODUCT</span>
          </Link>

          <p className="text-[11px] text-neutral-500">
            Alternatively, email us directly at <strong className="text-neutral-300 font-normal">{getLegalValue(LEGAL_CONFIG.supportEmail, 'SUPPORT_EMAIL')}</strong> with your order number in the subject line.
          </p>
        </div>
      </section>

      {/* Section 4: Information & Evidence Required */}
      <section id="evidence-required" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          4. Information & Evidence Required
        </h2>
        <p>
          When contacting our team, please provide the following details to facilitate a prompt investigation:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-neutral-400">
          <li><strong className="text-white font-normal">Order Number:</strong> Found in your order confirmation email or patron account archive.</li>
          <li><strong className="text-white font-normal">Patron Identification:</strong> Full name and registered email address or phone number used during checkout.</li>
          <li><strong className="text-white font-normal">Description of Issue:</strong> A concise, specific description of the defect, damage, or discrepancy.</li>
          <li><strong className="text-white font-normal">Photographic Evidence:</strong> Clear, well-lit photographs showing:
            <ul className="list-circle pl-5 pt-1 space-y-1 text-neutral-400">
              <li>The full garment laid flat;</li>
              <li>Close-up detail of the specific defect, flaw, or damage;</li>
              <li>The outer courier packaging and shipping label where transit damage is suspected.</li>
            </ul>
          </li>
          <li><strong className="text-white font-normal">Unboxing Video (Recommended):</strong> If available, an unboxing video may also help us assess the issue and expedite resolution with logistics partners. (An unboxing video is recommended where available, but is not mandatory).</li>
          <li>Any other information reasonably requested by SuperSnake to verify the claim.</li>
        </ul>
        <p className="text-neutral-400 text-xs italic">
          SuperSnake reserves the right to request reasonable evidence necessary to verify a reported issue.
        </p>
      </section>

      {/* Section 5: Investigation & Potential Remedies */}
      <section id="investigation-remedies" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          5. Investigation & Potential Remedies
        </h2>
        <p>
          SuperSnake reviews each reported complaint on an individual, case-by-case basis upon receipt of the requisite evidence.
        </p>
        <p>
          Where an issue attributable to manufacturing defect, transit damage, or fulfillment error is established, possible outcomes and remedies may include:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
          <li>Dispatch of an identical replacement piece (subject to atelier inventory availability);</li>
          <li>Exchange for an agreed substitute piece;</li>
          <li>A full or partial refund to the original payment source; or</li>
          <li>Another appropriate remedy determined in accordance with applicable law and the circumstances of the case.</li>
        </ul>
        <p>
          Where a refund is approved, the refund will be initiated through the applicable payment method/provider. The time taken for the amount to reflect in the customer&apos;s account may vary depending on the payment provider, intermediary gateway, and the customer&apos;s banking institution.
        </p>
      </section>

      {/* Section 6: No Unauthorized Returns */}
      <section id="unauthorized-returns" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          6. No Unauthorized Returns
        </h2>
        <div className="p-4 bg-red-950/20 border border-red-800/40 rounded-sm text-neutral-300 space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-xs uppercase">
            <AlertCircle size={15} />
            <span>CRITICAL RETURN INSTRUCTION</span>
          </div>
          <p className="text-xs leading-relaxed">
            Please do not ship or return any product to us unless our customer support team specifically instructs you to do so in writing and provides official reverse logistics instructions.
          </p>
          <p className="text-[11px] text-neutral-400">
            Unsolicited packages, unauthorized reverse shipments, or parcels sent to unapproved addresses may be refused or returned to the sender at their expense.
          </p>
        </div>
      </section>

      {/* Section 7: Statutory Consumer Rights & Saving Clause */}
      <section id="statutory-protection" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          7. Statutory Consumer Rights & Saving Clause
        </h2>
        <p>
          Nothing in this policy is intended to exclude, restrict or limit any right, remedy, obligation or liability that cannot lawfully be excluded, restricted or limited under applicable law, including the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020.
        </p>
        <p>
          Our policies are intended to provide clear commercial guidelines while respecting all non-excludable statutory rights available to consumers in India.
        </p>
      </section>
    </PolicyLayout>
  );
}
