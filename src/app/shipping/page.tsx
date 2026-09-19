'use client';

import React from 'react';
import Link from 'next/link';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { LEGAL_CONFIG, getLegalValue } from '@/lib/legal-config';
import { Truck, ShieldCheck, Clock, MapPin, Package, ArrowRight, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/design-tokens';

const TOC = [
  { id: 'order-processing', title: '1. Order Processing' },
  { id: 'dispatch', title: '2. Dispatch Protocol' },
  { id: 'estimated-delivery', title: '3. Estimated Delivery Timelines' },
  { id: 'shipping-charges', title: '4. Shipping Charges & Thresholds' },
  { id: 'delivery-delays', title: '5. Delivery Delays & External Circumstances' },
  { id: 'incorrect-address', title: '6. Accuracy of Shipping Information' },
  { id: 'failed-attempts', title: '7. Failed Delivery Attempts & Non-Receipt' },
  { id: 'damaged-shipment', title: '8. Package Inspection & Damaged Shipments' },
  { id: 'order-tracking', title: '9. Live Order Tracking' },
  { id: 'support-contact', title: '10. Logistics Support & Escalations' },
];

const RELATED = [
  { label: 'Returns & Defects', href: '/returns' },
  { label: 'Cancellation Policy', href: '/cancellation' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
];

export default function ShippingAndDeliveryPage() {
  const processingTime = LEGAL_CONFIG.shippingProcessingTime || getLegalValue(null, 'SHIPPING_PROCESSING_TIME');
  const deliveryEstimate = LEGAL_CONFIG.deliveryEstimate || getLegalValue(null, 'DELIVERY_ESTIMATE');
  const freeThreshold = LEGAL_CONFIG.freeShippingThreshold;
  const standardFee = LEGAL_CONFIG.standardShippingFee;

  return (
    <PolicyLayout
      category="CUSTOMER CARE"
      title="SHIPPING & DELIVERY"
      description="Detailed disclosures regarding order fulfillment, courier transit, delivery estimates, logistics fees, and package inspection."
      tableOfContents={TOC}
      relatedLinks={RELATED}
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
        <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] uppercase tracking-widest text-snake-green">PROCESSING WINDOW</span>
            <Clock size={16} className="text-snake-green" />
          </div>
          <p className="text-sm sm:text-base font-display font-medium text-white">
            {processingTime}
          </p>
          <p className="text-[11px] text-neutral-400">
            Following successful payment verification.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] uppercase tracking-widest text-snake-green">DELIVERY METHOD</span>
            <Truck size={16} className="text-snake-green" />
          </div>
          <p className="text-sm sm:text-base font-display font-medium text-white">
            {LEGAL_CONFIG.shippingDescription}
          </p>
          <p className="text-[11px] text-neutral-400">
            Estimated Delivery: {deliveryEstimate}
          </p>
        </div>
      </div>

      {/* Section 1: Order Processing */}
      <section id="order-processing" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          1. Order Processing
        </h2>
        <p>
          All orders placed on SUPERSNAKE.IN are initiated after successful payment authorization and fraud-screening clearance. Order processing entails inventory reservation, physical garment inspection, folding, protective wrapping, and generation of the courier shipping waybill.
        </p>
        <p>
          Processing typically takes <strong className="text-white font-normal">{processingTime}</strong> during regular business days (excluding national holidays, state holidays, and Sundays). Orders placed on non-business days or after cut-off hours enter processing on the next immediate business day.
        </p>
      </section>

      {/* Section 2: Dispatch Protocol */}
      <section id="dispatch" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          2. Dispatch Protocol
        </h2>
        <p>
          Once processed, garments are sealed in protective packaging and handed over to our appointed courier partner for tracked delivery. At the time of handover, a unique consignment tracking/waybill number is generated.
        </p>
        <p>
          An electronic dispatch confirmation is sent to your registered email address and contact telephone number, containing direct courier tracking links.
        </p>
      </section>

      {/* Section 3: Estimated Delivery Timelines */}
      <section id="estimated-delivery" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          3. Estimated Delivery Timelines
        </h2>
        <p>
          Estimated delivery timelines generally range within <strong className="text-white font-normal">{deliveryEstimate}</strong> following the date of dispatch, subject to destination pin code:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
          <li><strong className="text-white font-normal">Metro Destinations:</strong> Typically delivered within 2–3 business days post-dispatch.</li>
          <li><strong className="text-white font-normal">Tier-2 / Regional Centers:</strong> Typically delivered within 3–5 business days post-dispatch.</li>
          <li><strong className="text-white font-normal">Remote, Island or Special Security Outposts:</strong> May require 5–7 business days depending on surface or feeder connectivity.</li>
        </ul>
        <p className="text-neutral-400 text-xs italic">
          Delivery timelines are estimates only and are not guaranteed delivery dates. Actual transit speed may fluctuate based on operational contingencies, courier hub volume, weather anomalies, or local restrictions.
        </p>
      </section>

      {/* Section 4: Shipping Charges & Thresholds */}
      <section id="shipping-charges" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          4. Shipping Charges & Thresholds
        </h2>
        <p>
          Shipping charges, if applicable, are transparently displayed during checkout prior to final payment submission:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
          <li>
            <strong className="text-white font-normal">Orders Totaling {freeThreshold ? formatPrice(freeThreshold) : '[THRESHOLD]'} or Above:</strong> Complimentary express domestic shipping.
          </li>
          <li>
            <strong className="text-white font-normal">Orders Below {freeThreshold ? formatPrice(freeThreshold) : '[THRESHOLD]'}:</strong> Subject to a standard logistics fee of {standardFee ? formatPrice(standardFee) : '[FEE]'} to cover priority courier handling and reinforced protective packaging.
          </li>
        </ul>
      </section>

      {/* Section 5: Delivery Delays */}
      <section id="delivery-delays" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          5. Delivery Delays & External Circumstances
        </h2>
        <p>
          While we make reasonable commercial efforts to ensure timely fulfillment, SuperSnake shall not be held liable for delivery delays arising from factors outside reasonable control, including but not limited to:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li>Severe weather, cyclones, floods, or natural events;</li>
          <li>Regional transport strikes, civil disruptions, or road blockages;</li>
          <li>Operational disruptions or flight delays affecting air-cargo lanes;</li>
          <li>Local government curfews, elections, or regulatory containment zones.</li>
        </ul>
      </section>

      {/* Section 6: Accuracy of Shipping Information */}
      <section id="incorrect-address" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          6. Accuracy of Shipping Information
        </h2>
        <p>
          Customers must ensure that the shipping address, contact telephone number, PIN code, and recipient name provided at checkout are complete and accurate.
        </p>
        <p>
          SuperSnake is not responsible for non-delivery, misdelivery, or re-routing delays resulting from incomplete addresses, missing flat/building numbers, incorrect pin codes, or unreachable customer contact numbers. Any reshipment fees necessitated by incorrect address details may be chargeable.
        </p>
      </section>

      {/* Section 7: Failed Delivery Attempts */}
      <section id="failed-attempts" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          7. Failed Delivery Attempts & Non-Receipt
        </h2>
        <p>
          Our courier partners make up to three (3) delivery attempts before marking a shipment as undeliverable. If the recipient is unavailable, the courier typically contacts the registered phone number or leaves a notice for re-delivery.
        </p>
        <p>
          If a parcel is returned to our studio (Return to Origin — RTO) due to non-availability, refusal of delivery, or an unreachable recipient, our customer care desk will contact you to arrange re-dispatch.
        </p>
      </section>

      {/* Section 8: Package Inspection & Damaged Shipments */}
      <section id="damaged-shipment" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          8. Package Inspection & Damaged Shipments
        </h2>
        <div className="p-4 bg-[#0e0e0e] border border-white/10 rounded-sm space-y-2">
          <div className="flex items-center gap-2 text-snake-green font-semibold text-xs uppercase">
            <ShieldCheck size={16} />
            <span>DELIVERY INSPECTION GUIDELINE</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Upon delivery, please inspect the external packaging before accepting the consignment. If the outer carton or protective tamper-evident polybag appears visibly torn, punctured, heavily crushed, or resealed:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-400 text-xs">
            <li>Note the damage on the delivery partner&apos;s physical or digital proof-of-delivery acknowledgement;</li>
            <li>Take photographs of the exterior condition prior to opening;</li>
            <li>Promptly notify our support desk via our <Link href="/returns" className="text-snake-green hover:underline">Returns & Defects</Link> protocol.</li>
          </ul>
        </div>
      </section>

      {/* Section 9: Live Order Tracking */}
      <section id="order-tracking" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          9. Live Order Tracking
        </h2>
        <p>
          Patrons can track the live status of active dispatches using our dedicated order tracking interface:
        </p>
        <div className="pt-2">
          <Link
            href="/track-order"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] hover:bg-neutral-800 border border-white/15 text-white font-mono text-xs uppercase tracking-widest rounded-sm transition-colors"
          >
            <Truck size={14} className="text-snake-green" />
            <span>LAUNCH LIVE ORDER TRACKER</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* Section 10: Logistics Support & Escalations */}
      <section id="support-contact" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          10. Logistics Support & Escalations
        </h2>
        <p>
          For queries regarding shipment milestones, address modifications prior to dispatch, or delayed consignments, contact our concierge team at <strong className="text-white font-normal">{getLegalValue(LEGAL_CONFIG.supportEmail, 'SUPPORT_EMAIL')}</strong> or submit an inquiry through our <Link href="/contact" className="text-snake-green hover:underline">Contact Us</Link> portal.
        </p>
      </section>
    </PolicyLayout>
  );
}
