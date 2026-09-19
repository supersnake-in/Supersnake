'use client';

import React from 'react';
import Link from 'next/link';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { LEGAL_CONFIG, getLegalValue } from '@/lib/legal-config';
import { ShieldCheck, Mail, Clock, MapPin, Phone, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const TOC = [
  { id: 'statutory-framework', title: '1. Statutory Framework & Grievance Mechanism' },
  { id: 'officer-details', title: '2. Designated Grievance Officer Details' },
  { id: 'filing-procedure', title: '3. Procedure to File a Grievance' },
  { id: 'timelines', title: '4. Mandatory Resolution Timelines (48h / 1 Month)' },
  { id: 'escalation', title: '5. Escalation & Consumer Protection Hierarchy' },
];

const RELATED = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Returns & Defects', href: '/returns' },
];

export default function GrievanceRedressalPage() {
  const officerName = LEGAL_CONFIG.grievanceOfficerName || getLegalValue(null, 'GRIEVANCE_OFFICER_NAME');
  const officerEmail = LEGAL_CONFIG.grievanceEmail || getLegalValue(null, 'GRIEVANCE_EMAIL');
  const officerAddress = LEGAL_CONFIG.grievanceAddress || getLegalValue(null, 'GRIEVANCE_OFFICER_POSTAL_ADDRESS');
  const officerPhone = LEGAL_CONFIG.grievancePhone || getLegalValue(null, 'GRIEVANCE_PHONE_NUMBER');

  return (
    <PolicyLayout
      category="LEGAL"
      title="GRIEVANCE REDRESSAL"
      description="Official consumer grievance redressal mechanism established under the Consumer Protection (E-Commerce) Rules, 2020."
      tableOfContents={TOC}
      relatedLinks={RELATED}
    >
      {/* Notice Card */}
      <div className="p-5 bg-[#0e0e0e] border border-white/10 rounded-sm space-y-2">
        <div className="flex items-center gap-2 text-snake-green text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck size={16} />
          <span>STATUTORY CONSUMER PROTECTION</span>
        </div>
        <p className="text-neutral-300 text-xs leading-relaxed">
          SuperSnake is committed to resolving patron grievances fairly, transparently, and in strict compliance with the Consumer Protection (E-Commerce) Rules, 2020.
        </p>
      </div>

      {/* Section 1: Statutory Framework */}
      <section id="statutory-framework" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          1. Statutory Framework & Grievance Mechanism
        </h2>
        <p>
          In accordance with the <strong className="text-white font-normal">Consumer Protection Act, 2019</strong> and the <strong className="text-white font-normal">Consumer Protection (E-Commerce) Rules, 2020</strong>, SuperSnake has established a dedicated Consumer Grievance Redressal Mechanism to address customer complaints regarding orders, fulfillment, product quality, or service deficiencies.
        </p>
        <p>
          This mechanism ensures that any consumer grievance that remains unresolved through ordinary customer care channels is formally reviewed by a designated Grievance Officer.
        </p>
      </section>

      {/* Section 2: Officer Details */}
      <section id="officer-details" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          2. Designated Grievance Officer Details
        </h2>
        <p>
          The details of our designated Grievance Officer appointed under the Consumer Protection (E-Commerce) Rules, 2020 are set forth below:
        </p>

        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-4 not-prose">
          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="text-snake-green shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">NAME & DESIGNATION</span>
                <p className="text-white font-semibold text-sm">{officerName}</p>
                <p className="text-neutral-400 text-[11px]">Nodal Grievance Officer, SuperSnake</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-white/5">
              <Mail size={16} className="text-snake-green shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">OFFICIAL GRIEVANCE EMAIL</span>
                {LEGAL_CONFIG.grievanceEmail ? (
                  <a href={`mailto:${LEGAL_CONFIG.grievanceEmail}`} className="text-white hover:text-snake-green transition-colors font-medium">
                    {LEGAL_CONFIG.grievanceEmail}
                  </a>
                ) : (
                  <span className="text-neutral-300 font-medium">{officerEmail}</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-white/5">
              <Phone size={16} className="text-snake-green shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">TELEPHONE CONTACT</span>
                <span className="text-neutral-300 font-medium">{officerPhone}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-white/5">
              <MapPin size={16} className="text-snake-green shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">POSTAL ADDRESS</span>
                <p className="text-neutral-300">{officerAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Filing Procedure */}
      <section id="filing-procedure" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          3. Procedure to File a Grievance
        </h2>
        <p>
          Before filing a formal grievance, we encourage patrons to first reach out to our front-line <Link href="/contact" className="text-snake-green hover:underline">Contact Us</Link> concierge for rapid assistance. If your issue remains unresolved or you are dissatisfied with the resolution:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-neutral-400">
          <li>
            Send an email to the official Grievance Email with the subject line: <code className="text-snake-green font-mono bg-neutral-900 px-1.5 py-0.5 rounded text-[11px]">FORMAL GRIEVANCE — Order #[ORDER NUMBER]</code>;
          </li>
          <li>Provide your full name, registered email address, and order reference number;</li>
          <li>Provide a clear, detailed summary of the grievance and any prior customer support correspondence;</li>
          <li>Attach supporting evidence, photographs, or relevant documentation;</li>
          <li>Specify the preferred remedy sought (e.g. replacement, refund, or clarification).</li>
        </ul>
      </section>

      {/* Section 4: Timelines */}
      <section id="timelines" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          4. Mandatory Resolution Timelines (48h / 1 Month)
        </h2>
        <p>
          In accordance with Rule 5(3)(e) of the Consumer Protection (E-Commerce) Rules, 2020:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-2">
          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-snake-green">STAGE 01 / ACKNOWLEDGMENT</span>
            <h4 className="text-sm font-display font-medium text-white uppercase">WITHIN 48 HOURS</h4>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              We will acknowledge receipt of your grievance and generate a unique ticket tracking reference number within 48 hours of receipt.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-snake-green">STAGE 02 / REDRESSAL</span>
            <h4 className="text-sm font-display font-medium text-white uppercase">WITHIN ONE MONTH</h4>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              The Grievance Officer will investigate the facts, liaise with logistics or atelier teams, and provide a written resolution within one (1) month from the date of receipt.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Escalation */}
      <section id="escalation" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          5. Escalation & Consumer Protection Hierarchy
        </h2>
        <p>
          If you remain unsatisfied with the redressal provided by our Grievance Officer, you may escalate your concern to the statutory consumer protection authorities established by the Government of India, including:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
          <li>
            <strong className="text-white font-normal">National Consumer Helpline (NCH):</strong> Operated by the Department of Consumer Affairs, Government of India (Toll-Free: 1915 or via consumerhelpline.gov.in).
          </li>
          <li>
            <strong className="text-white font-normal">e-Daakhil Portal:</strong> For electronic filing of consumer complaints before the appropriate District, State, or National Consumer Disputes Redressal Commission.
          </li>
        </ul>
      </section>
    </PolicyLayout>
  );
}
