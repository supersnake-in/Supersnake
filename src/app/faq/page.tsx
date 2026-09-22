'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react';
import { LEGAL_CONFIG, getLegalValue } from '@/lib/legal-config';
import { formatPrice } from '@/lib/design-tokens';
import { JsonLd } from '@/components/seo/JsonLd';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

export default function FAQPage() {
  const freeThreshold = LEGAL_CONFIG.freeShippingThreshold ? formatPrice(LEGAL_CONFIG.freeShippingThreshold) : '[THRESHOLD]';
  const standardFee = LEGAL_CONFIG.standardShippingFee ? formatPrice(LEGAL_CONFIG.standardShippingFee) : '[FEE]';
  const deliveryEstimate = LEGAL_CONFIG.deliveryEstimate || getLegalValue(null, 'DELIVERY_ESTIMATE');
  const supportEmail = LEGAL_CONFIG.supportEmail || getLegalValue(null, 'SUPPORT_EMAIL');

  const FAQS: FAQCategory[] = [
    {
      category: 'GENERAL',
      items: [
        {
          q: 'What is SuperSnake?',
          a: 'SuperSnake is a premium independent apparel house dedicated to heavyweight architectural silhouettes, refined organic cotton fabrications, and uncompromising modern streetwear.',
        },
        {
          q: 'Where does SuperSnake ship?',
          a: 'We currently fulfill domestic orders across all serviceable PIN codes in India through tracked delivery via our authorised courier partners. International fulfillment is slated for future seasonal drops.',
        },
        {
          q: 'How do I contact customer care?',
          a: `You can reach our client concierge via our Contact Us portal or by emailing ${supportEmail}. Our operating hours are Monday to Saturday, 10:00 AM – 7:00 PM IST.`,
        },
      ],
    },
    {
      category: 'ORDERS',
      items: [
        {
          q: 'How do I place an order?',
          a: 'Select your preferred piece, choose your desired size and colorway, and click "ADD TO BAG". Proceed through our encrypted checkout by providing your delivery address and completing payment through our secure checkout.',
        },
        {
          q: 'Can I modify my order after placement?',
          a: 'Because orders enter tailoring preparation swiftly, modifications (such as size adjustment or delivery address updates) must be requested immediately by contacting our concierge prior to dispatch.',
        },
        {
          q: 'Can I cancel my order?',
          a: 'Cancellations are accepted only while an order is in Pending or Processing status. Once an order is Packed or Dispatched, it cannot be recalled from courier transit. Refer to our Cancellation Policy for complete terms.',
        },
      ],
    },
    {
      category: 'PAYMENTS',
      items: [
        {
          q: 'What payment methods are supported?',
          a: 'We support all major Indian and international payment instruments, including UPI (Google Pay, PhonePe, Paytm, CRED), Credit & Debit Cards (Visa, MasterCard, RuPay, Amex), Net Banking across major banks, and approved digital wallets.',
        },
        {
          q: 'When is my payment confirmed?',
          a: 'Payment authorization occurs in real-time. Once confirmed, you will immediately see the order confirmation screen and receive an electronic receipt via email and SMS.',
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes. Payments are processed through authorised payment service providers using appropriate security measures with 256-bit encryption. SuperSnake does not store raw credit card numbers or banking passwords.',
        },
      ],
    },
    {
      category: 'SHIPPING & DELIVERY',
      items: [
        {
          q: 'When will my order be dispatched?',
          a: `Orders are typically processed and dispatched within our standard processing window post-payment verification. You will receive an electronic notification with live tracking as soon as your parcel is handed over to the courier.`,
        },
        {
          q: 'How long does delivery take?',
          a: `Delivery timelines generally range within ${deliveryEstimate} following dispatch, subject to destination PIN code. Metros generally receive delivery within 2–3 business days.`,
        },
        {
          q: 'What are the shipping charges?',
          a: `Orders totaling ${freeThreshold} or greater qualify for complimentary domestic shipping. Orders below ${freeThreshold} incur a standard ${standardFee} logistics handling fee.`,
        },
        {
          q: 'How do I track my order?',
          a: 'You can track active shipments by entering your order number on our Track Order page or clicking the direct waybill link sent in your dispatch SMS and email.',
        },
      ],
    },
    {
      category: 'RETURNS & DEFECTS',
      items: [
        {
          q: 'Does SuperSnake accept returns for change of mind or size?',
          a: 'No. SuperSnake follows a strict no-return policy for ordinary purchases. We do not accept returns or exchanges for change of mind, incorrect size selection, or fit/color preference. Please consult our Size Guide before placing an order.',
        },
        {
          q: 'What if I receive a damaged or defective garment?',
          a: 'If an item arrives damaged, defective, materially different from what was ordered, or affected by fulfillment/transit issues, please email our support team promptly with your order number, issue description, and clear photographs of the product and packaging.',
        },
        {
          q: 'Is an unboxing video mandatory to report damage?',
          a: 'An unboxing video is recommended where available to help expedite assessment with courier partners, but is not mandatory. Clear photographs of the damaged product and outer packaging are required.',
        },
        {
          q: 'Can I send the product back immediately?',
          a: 'No. Please do not ship or return any product to us unless our customer support team specifically reviews your case and instructs you to do so in writing. Unauthorized returns will be refused.',
        },
      ],
    },
    {
      category: 'PRODUCTS & SIZING',
      items: [
        {
          q: 'How do I choose my correct size?',
          a: 'Please refer to our architectural Size Guide page for exact pit-to-pit chest, body length, shoulder width, and sleeve measurements. We recommend measuring a well-fitting flat T-shirt and comparing it against our measurements.',
        },
        {
          q: 'How should I care for my SuperSnake T-shirt?',
          a: 'Always follow the care instructions provided on the garment label. As a general standard: machine wash cold (30°C) inside out, flat dry in the shade away from direct sunlight, and cool iron inside out. Do not bleach or dry clean.',
        },
        {
          q: 'Are product colours accurate on the website?',
          a: 'We shoot all editorial imagery under calibrated studio lighting to reflect actual fabric shades. However, slight variations may occur across display devices due to individual screen calibration settings.',
        },
      ],
    },
    {
      category: 'ACCOUNT',
      items: [
        {
          q: 'How do I create a patron account?',
          a: 'Click on Account in the top navigation or visit /signup. You can register using your email and choose your silhouette preferences.',
        },
        {
          q: 'How do I view my order history?',
          a: 'Log into your Patron Account and navigate to Orders. You will find real-time status updates, invoice receipts, and carrier waybill details for all acquisitions.',
        },
        {
          q: 'How do I reset my password?',
          a: 'Visit the login portal and click "FORGOT PASSWORD". Enter your registered email address to receive secure password recovery instructions.',
        },
      ],
    },
  ];

  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'GENERAL-0': true,
    'RETURNS & DEFECTS-0': true,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      }))
    ),
  };

  return (
    <div className="bg-black text-white min-h-screen pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 font-sans selection:bg-snake-green selection:text-black">
      <JsonLd data={faqSchema} />
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
              CUSTOMER CARE
            </span>
            <span className="text-neutral-600 text-xs">•</span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              KNOWLEDGE BASE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            FREQUENTLY ASKED QUESTIONS
          </h1>

          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-xl leading-relaxed">
            Essential information regarding orders, dispatches, payments, strict no-return policy, defect reporting, and garment care.
          </p>
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-12">
          {FAQS.map((cat) => (
            <div key={cat.category} className="space-y-4">
              <h2 className="text-xs font-mono tracking-widest text-snake-green uppercase border-b border-white/10 pb-2">
                {cat.category}
              </h2>

              <div className="space-y-2">
                {cat.items.map((item, idx) => {
                  const key = `${cat.category}-${idx}`;
                  const isOpen = !!openItems[key];
                  const buttonId = `faq-btn-${key.replace(/\s+/g, '-').toLowerCase()}`;
                  const panelId = `faq-panel-${key.replace(/\s+/g, '-').toLowerCase()}`;

                  return (
                    <div
                      key={idx}
                      className="bg-[#0a0a0a] border border-white/10 rounded-sm overflow-hidden transition-colors hover:border-white/20"
                    >
                      <button
                        id={buttonId}
                        onClick={() => toggleItem(key)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                      >
                        <span className="text-xs sm:text-sm font-display font-medium text-white">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-snake-green' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          className="px-5 sm:px-6 pb-5 pt-1 text-xs font-mono text-neutral-300 leading-relaxed border-t border-white/5"
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Banner */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-sm text-center space-y-4">
          <HelpCircle size={32} className="mx-auto text-snake-green" />
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-display font-medium text-white uppercase">
              CANNOT FIND WHAT YOU ARE LOOKING FOR?
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Our atelier client specialists are available Monday to Saturday to assist with any specific questions.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-mono">
            <Link
              href="/contact"
              className="px-6 py-3 bg-white hover:bg-snake-green text-black uppercase tracking-widest font-semibold transition-colors inline-flex items-center gap-2"
            >
              <span>CONNECT WITH CONCIERGE</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/returns"
              className="px-6 py-3 border border-white/20 hover:border-white text-white uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <span>RETURNS & DEFECTS POLICY</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
