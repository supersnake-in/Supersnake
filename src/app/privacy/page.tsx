'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-3 border-b border-white/10 pb-6">
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            LEGAL ARCHIVE
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            PRIVACY POLICY
          </h1>
          <p className="text-xs font-mono text-neutral-500">
            Last Updated: January 1, 2026 • SuperSnake Design Atelier, Bengaluru, India
          </p>
        </div>

        <div className="space-y-8 text-xs font-mono text-neutral-400 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              1. OUR PHILOSOPHY ON PATRON DATA
            </h2>
            <p>
              At SuperSnake (&ldquo;SUPERSNAKE.IN&rdquo;), we respect your privacy as fiercely as we respect our craft. We do not monetize, broker, or sell patron data to advertisers or third-party brokers. We gather only the minimal telemetry required to deliver our garments, process payments securely, and maintain your account archive.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              2. INFORMATION WE COLLECT
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-300">
              <li><strong className="text-white">Patron Identity:</strong> Legal name, email address, contact phone number provided during account registration or checkout.</li>
              <li><strong className="text-white">Logistics Data:</strong> Delivery street address, landmark, PIN code, and recipient telephone for Blue Dart shipment routing.</li>
              <li><strong className="text-white">Payment Tokenization:</strong> Transaction identifiers and payment status via Razorpay. We never store credit card numbers, CVVs, or bank login credentials on our servers.</li>
              <li><strong className="text-white">Device & Session Telemetry:</strong> IP address, browser type, and anonymous interaction metrics used to enhance platform performance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              3. HOW WE UTILIZE YOUR DATA
            </h2>
            <p>
              Your data is employed exclusively for:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300">
              <li>Order fulfillment, tailoring preparation, and air express logistics.</li>
              <li>Dispatching transactional SMS and email notifications regarding delivery milestones.</li>
              <li>Authenticating patron sessions and securing private atelier access.</li>
              <li>Preventing fraudulent transactions and ensuring compliance with Indian law.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              4. DATA SECURITY & RETENTION
            </h2>
            <p>
              All traffic to SUPERSNAKE.IN is encrypted via TLS 1.3 with 256-bit AES cipher suites. Database records are stored within secure cloud instances protected by Row Level Security (RLS) policies. We retain order records for tax compliance under Indian GST regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-display font-medium text-white uppercase tracking-wider">
              5. YOUR PRIVACY RIGHTS
            </h2>
            <p>
              Under applicable Indian privacy and data protection frameworks, you maintain the right to inspect, correct, or request the erasure of your personal data from our active rosters. To exercise these rights, contact our privacy desk at <a href="mailto:privacy@supersnake.in" className="text-snake-green hover:underline">privacy@supersnake.in</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
