'use client';

import React, { useState, useEffect } from 'react';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { LEGAL_CONFIG, OFFICIAL_EMAILS, getLegalValue } from '@/lib/legal-config';
import { ShieldCheck, Cookie, Check, Lock, ArrowRight } from 'lucide-react';

const TOC = [
  { id: 'dpdp-framework', title: '1. Legal Framework & Applicability' },
  { id: 'data-collected', title: '2. Categories of Personal Data Collected' },
  { id: 'processing-purposes', title: '3. Lawful Grounds & Purposes of Processing' },
  { id: 'cookies-telemetry', title: '4. Cookies, Local Storage & Telemetry (Preferences)' },
  { id: 'service-providers', title: '5. Third-Party Service Providers' },
  { id: 'security-measures', title: '6. Technical & Organizational Security Safeguards' },
  { id: 'retention', title: '7. Data Retention & Erasure' },
  { id: 'principal-rights', title: '8. Data Principal Rights under Indian Law' },
  { id: 'consent-withdrawal', title: '9. Consent & Withdrawal of Consent' },
  { id: 'grievance-officer', title: '10. Data Protection & Grievance Contact' },
];

const RELATED = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Contact Us', href: '/contact' },
];

export default function PrivacyPolicyPage() {
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('supersnake_cookie_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.analytics === 'boolean') {
          setAnalyticsCookies(parsed.analytics);
        }
      }
    } catch (e) {}
  }, []);

  const handleSaveCookiePreferences = () => {
    try {
      localStorage.setItem(
        'supersnake_cookie_consent',
        JSON.stringify({ essential: true, analytics: analyticsCookies })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {}
  };

  const grievanceEmail = LEGAL_CONFIG.grievanceEmail || getLegalValue(null, 'GRIEVANCE_EMAIL');
  const grievanceOfficer = LEGAL_CONFIG.grievanceOfficerName || getLegalValue(null, 'GRIEVANCE_OFFICER_NAME');

  return (
    <PolicyLayout
      category="LEGAL"
      title="PRIVACY POLICY"
      description="How SuperSnake processes, safeguards, and respects personal data under the Digital Personal Data Protection framework."
      tableOfContents={TOC}
      relatedLinks={RELATED}
    >
      {/* Notice Banner */}
      <div className="p-5 bg-[#0e0e0e] border border-white/10 rounded-sm space-y-2">
        <div className="flex items-center gap-2 text-snake-green text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck size={16} />
          <span>DATA PROTECTION COMMITMENT</span>
        </div>
        <p className="text-neutral-300 text-xs leading-relaxed">
          SuperSnake respects patron data as an extension of our craft. We do not sell, rent, or broker your personal information. Data is collected exclusively to fulfill orders, authenticate accounts, ensure secure payments, and comply with applicable Indian laws.
        </p>
      </div>

      {/* Section 1: Legal Framework */}
      <section id="dpdp-framework" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          1. Legal Framework & Applicability
        </h2>
        <p>
          This Privacy Policy governs the collection, processing, storage, and transfer of digital personal data by SuperSnake (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) through <strong className="text-white font-normal">https://supersnake.in</strong> and associated storefront services.
        </p>
        <p>
          This policy is formulated in accordance with the laws of India, including the <strong className="text-white font-normal">Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and the <strong className="text-white font-normal">Digital Personal Data Protection Rules, 2025</strong> to the extent commenced and applicable. In our relationship with patrons, SuperSnake acts as a Data Fiduciary determining the purpose and means of processing personal data.
        </p>
      </section>

      {/* Section 2: Data Collected */}
      <section id="data-collected" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          2. Categories of Personal Data Collected
        </h2>
        <p>
          We collect only the personal data reasonably necessary to provide our ecommerce services. The categories of data collected include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-neutral-400">
          <li>
            <strong className="text-white font-normal">Account & Identity Information:</strong> Full name, registered email address, contact telephone number, and hashed authentication credentials provided during account creation.
          </li>
          <li>
            <strong className="text-white font-normal">Order & Fulfillment Data:</strong> Garments acquired, sizes, colorways, order numbers, transaction values, delivery street addresses, landmark details, and postal PIN codes.
          </li>
          <li>
            <strong className="text-white font-normal">Payment Transaction Data:</strong> Payment method selected (such as UPI, Credit/Debit Card, Net Banking) and transaction reference identifiers. Payment transactions are processed through authorised payment service providers using appropriate security measures. SuperSnake does not store raw credit or debit card numbers, CVVs, or net banking passwords on its servers.
          </li>
          <li>
            <strong className="text-white font-normal">Technical & Telemetry Data:</strong> IP address, browser type and version, device operating system, session tokens, and performance metrics necessary for website security and rendering.
          </li>
          <li>
            <strong className="text-white font-normal">Communication Records:</strong> Records of customer care correspondence, support tickets, defect reports, and photographic evidence submitted for inquiry resolution.
          </li>
        </ul>
      </section>

      {/* Section 3: Purposes */}
      <section id="processing-purposes" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          3. Lawful Grounds & Purposes of Processing
        </h2>
        <p>
          Personal data is processed on lawful grounds under Indian data protection law, specifically based on your informed consent or for legitimate uses such as fulfilling a contract to which you are a party:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
          <li>Processing and fulfilling your garment acquisitions and generating tax invoices;</li>
          <li>Handing over delivery consignments to courier partners and transmitting SMS/email tracking updates;</li>
          <li>Authenticating patron sessions and protecting your account from unauthorized access;</li>
          <li>Screening for fraudulent payment attempts and security anomalies;</li>
          <li>Investigating customer support inquiries, damage reports, and defect claims;</li>
          <li>Complying with applicable statutory tax obligations under Indian Goods and Services Tax (GST) statutes.</li>
        </ul>
      </section>

      {/* Section 4: Cookies, Local Storage & Telemetry */}
      <section id="cookies-telemetry" className="space-y-6 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          4. Cookies, Local Storage & Telemetry
        </h2>
        <p>
          We use browser storage (cookies and local storage) to provide essential website functionality, remember your shopping bag, and preserve your patron session.
        </p>
        
        {/* Actual Storage Audit Table */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">IDENTIFIER</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">PURPOSE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              <tr>
                <td className="py-3 px-4 font-mono text-white text-[11px]">session_token</td>
                <td className="py-3 px-4 text-snake-green text-[10px] uppercase font-bold">Essential</td>
                <td className="py-3 px-4 text-neutral-400 text-[11px]">Authenticates your patron profile across sessions.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white text-[11px]">supersnake_cart</td>
                <td className="py-3 px-4 text-snake-green text-[10px] uppercase font-bold">Essential</td>
                <td className="py-3 px-4 text-neutral-400 text-[11px]">Preserves items in your bag while browsing.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white text-[11px]">supersnake_recent_searches</td>
                <td className="py-3 px-4 text-neutral-300 text-[10px] uppercase">Functional</td>
                <td className="py-3 px-4 text-neutral-400 text-[11px]">Stores recent search terms locally for quick access.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white text-[11px]">supersnake_wishlist</td>
                <td className="py-3 px-4 text-neutral-300 text-[10px] uppercase">Functional</td>
                <td className="py-3 px-4 text-neutral-400 text-[11px]">Saves bookmarked pieces to your local account.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-white text-[11px]">supersnake_cookie_consent</td>
                <td className="py-3 px-4 text-snake-green text-[10px] uppercase font-bold">Essential</td>
                <td className="py-3 px-4 text-neutral-400 text-[11px]">Remembers your cookie preference choices.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Interactive Cookie Preference Manager */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block">
                PREFERENCE CONTROL
              </span>
              <h3 className="text-sm font-display font-medium text-white uppercase">
                MANAGE YOUR COOKIE PREFERENCES
              </h3>
            </div>
            {saved && (
              <span className="text-xs text-snake-green flex items-center gap-1">
                <Check size={14} /> Saved
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-white font-medium block">ESSENTIAL ATELIER STORAGE</span>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Strictly necessary for bag persistence, session authentication, and checkout security. Always active.
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-white/10 text-neutral-400 uppercase rounded">
                REQUIRED
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
              <div>
                <span className="text-white font-medium block">ANONYMOUS PERFORMANCE TELEMETRY</span>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Helps us evaluate site rendering speeds, reduce latency, and ensure fluid motion performance.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsCookies}
                  onChange={(e) => setAnalyticsCookies(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#161616] border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-snake-green peer-checked:after:bg-black" />
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveCookiePreferences}
                className="px-6 py-2.5 bg-white hover:bg-snake-green text-black uppercase tracking-widest font-bold transition-colors text-xs"
              >
                SAVE PREFERENCES
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Third-Party Service Providers */}
      <section id="service-providers" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          5. Third-Party Service Providers
        </h2>
        <p>
          We do not sell personal data to third parties. We may use trusted service providers and business partners to support website operations, payment processing, order fulfilment, communications, security, customer support, analytics, and other services necessary to operate our business.
        </p>
        <p>
          These service providers may process information on our behalf and are required to handle information in accordance with applicable contractual, security, and legal requirements.
        </p>
      </section>

      {/* Section 6: Security */}
      <section id="security-measures" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          6. Technical &amp; Organizational Security Safeguards
        </h2>
        <p>
          We implement reasonable technical and organisational safeguards designed to protect personal information against unauthorised access, misuse, alteration, disclosure, or destruction.
        </p>
        <p>
          These safeguards include transport-level encryption, restricted administrative access protocols, secure server configurations, and ongoing monitoring to protect the confidentiality and integrity of your data.
        </p>
      </section>

      {/* Section 7: Retention */}
      <section id="retention" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          7. Data Retention & Erasure
        </h2>
        <p>
          We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable statutory obligations (such as preserving transaction records for tax compliance under Indian GST and accounting statutes).
        </p>
        <p>
          Once the retention period expires or the specified purpose is fulfilled, personal data is irreversibly anonymized or securely deleted from our active production systems.
        </p>
      </section>

      {/* Section 8: Data Principal Rights */}
      <section id="principal-rights" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          8. Data Principal Rights under Indian Law
        </h2>
        <p>
          As a Data Principal under the Digital Personal Data Protection Act, 2023, you are entitled to exercise the following rights, subject to applicable exceptions and statutory procedures:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-neutral-400">
          <li><strong className="text-white font-normal">Right to Access Information:</strong> Request a summary of your personal data being processed and the identities of third-party processors with whom it has been shared.</li>
          <li><strong className="text-white font-normal">Right to Correction & Erasure:</strong> Request the correction of inaccurate or incomplete personal data, or the erasure of personal data that is no longer required for its original purpose.</li>
          <li><strong className="text-white font-normal">Right of Grievance Redressal:</strong> Submit a grievance to our designated Grievance Officer regarding any act or omission in our processing of your personal data.</li>
          <li><strong className="text-white font-normal">Right to Nominate:</strong> Nominate an individual who, in the event of your death or incapacity, may exercise your data principal rights.</li>
        </ul>
      </section>

      {/* Section 9: Consent & Withdrawal */}
      <section id="consent-withdrawal" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          9. Consent & Withdrawal of Consent
        </h2>
        <p>
          Where processing is based on your consent, you maintain the right to withdraw your consent at any time by contacting our Grievance Officer.
        </p>
        <p className="text-neutral-400 text-xs italic">
          Please note that withdrawing consent does not affect the lawfulness of processing undertaken prior to withdrawal, nor does it preclude processing required by law or necessary to complete orders already dispatched.
        </p>
      </section>

      {/* Section 10: Grievance Officer */}
      <section id="grievance-officer" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          10. Data Protection &amp; Grievance Contact
        </h2>
        <p>
          For formal privacy inquiries or to exercise your Data Principal rights under the Digital Personal Data Protection Act, 2023, please contact our office at{' '}
          <a href={`mailto:${OFFICIAL_EMAILS.office}`} className="text-snake-green hover:underline">
            {OFFICIAL_EMAILS.office}
          </a>
          .
        </p>
      </section>
    </PolicyLayout>
  );
}
