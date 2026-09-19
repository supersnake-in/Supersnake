'use client';

import React from 'react';
import Link from 'next/link';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { LEGAL_CONFIG, OFFICIAL_EMAILS, getLegalValue } from '@/lib/legal-config';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const TOC = [
  { id: 'sec-01', title: '1. Introduction & Acceptance of Terms' },
  { id: 'sec-02', title: '2. Definitions' },
  { id: 'sec-03', title: '3. Patron Eligibility' },
  { id: 'sec-04', title: '4. Account Registration & Patron Profile' },
  { id: 'sec-05', title: '5. Account Security & Credential Confidentiality' },
  { id: 'sec-06', title: '6. Product Information, Tolerances & Visual Nuances' },
  { id: 'sec-07', title: '7. Pricing Structure' },
  { id: 'sec-08', title: '8. Taxes (Goods & Services Tax)' },
  { id: 'sec-09', title: '9. Product Availability & Limited Drops' },
  { id: 'sec-10', title: '10. Order Placement & Contract Formation' },
  { id: 'sec-11', title: '11. Payment Instruments & Gateway Tokenization' },
  { id: 'sec-12', title: '12. Shipping & Delivery Terms' },
  { id: 'sec-13', title: '13. Cancellation Terms' },
  { id: 'sec-14', title: '14. Returns & Defect Remedies' },
  { id: 'sec-15', title: '15. Intellectual Property & Brand Ownership' },
  { id: 'sec-16', title: '16. Website Use & Permitted Access' },
  { id: 'sec-17', title: '17. Prohibited Activities' },
  { id: 'sec-18', title: '18. User Submissions & Feedback' },
  { id: 'sec-19', title: '19. Third-Party Services & Links' },
  { id: 'sec-20', title: '20. Website Availability & Maintenance' },
  { id: 'sec-21', title: '21. Limitation of Liability' },
  { id: 'sec-22', title: '22. Indemnification' },
  { id: 'sec-23', title: '23. Force Majeure' },
  { id: 'sec-24', title: '24. Amendments & Modifications to Terms' },
  { id: 'sec-25', title: '25. Governing Law' },
  { id: 'sec-26', title: '26. Jurisdiction' },
  { id: 'sec-27', title: '27. Consumer Rights & Statutory Saving Clause' },
  { id: 'sec-28', title: '28. Contact Information & Legal Notices' },
];

const RELATED = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Returns & Defects', href: '/returns' },
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Contact Us', href: '/contact' },
];

export default function TermsAndConditionsPage() {
  const jurisdiction = LEGAL_CONFIG.jurisdiction || getLegalValue(null, 'LEGAL_JURISDICTION');
  const supportEmail = LEGAL_CONFIG.supportEmail || getLegalValue(null, 'SUPPORT_EMAIL');

  return (
    <PolicyLayout
      category="LEGAL"
      title="TERMS & CONDITIONS"
      description="The definitive commercial and legal terms governing your use of SUPERSNAKE.IN, garment acquisitions, patron accounts, and dispute resolution."
      tableOfContents={TOC}
      relatedLinks={RELATED}
    >
      {/* Preamble Card */}
      <div className="p-5 bg-[#0e0e0e] border border-white/10 rounded-sm space-y-2">
        <div className="flex items-center gap-2 text-snake-green text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck size={16} />
          <span>LEGAL BINDING AGREEMENT</span>
        </div>
        <p className="text-neutral-300 text-xs leading-relaxed">
          Please read these Terms &amp; Conditions carefully. By accessing or using SUPERSNAKE.IN, purchasing garments, or creating an account, you agree to be bound by these Terms and our related policies.
        </p>
      </div>

      {/* Section 1 */}
      <section id="sec-01" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          1. Introduction & Acceptance of Terms
        </h2>
        <p>
          These Terms and Conditions (&ldquo;Terms&rdquo;) govern the relationship between SuperSnake (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) and each individual user, visitor, or patron (&ldquo;you&rdquo; or &ldquo;customer&rdquo;) accessing or using the website located at <strong className="text-white font-normal">https://supersnake.in</strong> and related digital storefront interfaces.
        </p>
        <p>
          By browsing our collections, creating an account, or placing an order, you confirm that you have read, understood, and agreed to be legally bound by these Terms and our applicable customer care and legal policies.
        </p>
      </section>

      {/* Section 2 */}
      <section id="sec-02" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          2. Definitions
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
          <li><strong className="text-white font-normal">&ldquo;SuperSnake&rdquo;</strong> refers to the business entity operating the website https://supersnake.in.</li>
          <li><strong className="text-white font-normal">&ldquo;Patron&rdquo; / &ldquo;Customer&rdquo;</strong> refers to any individual accessing the website or purchasing garments.</li>
          <li><strong className="text-white font-normal">&ldquo;Products&rdquo;</strong> refers to garments, T-shirts, and apparel offered for sale on SUPERSNAKE.IN.</li>
          <li><strong className="text-white font-normal">&ldquo;Order&rdquo;</strong> refers to an offer by a patron to acquire products subject to these Terms.</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="sec-03" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          3. Patron Eligibility
        </h2>
        <p>
          You must be at least 18 years of age and legally competent to enter into a binding contract under the Indian Contract Act, 1872 to use our services or purchase products. If you are under 18, you may use the website only with the supervision and consent of a parent or legal guardian.
        </p>
      </section>

      {/* Section 4 */}
      <section id="sec-04" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          4. Account Registration & Patron Profile
        </h2>
        <p>
          When creating a patron account, you agree to provide truthful, accurate, current, and complete information. You are solely responsible for keeping your profile details updated. SuperSnake reserves the right to suspend or terminate accounts containing misleading or fictitious information.
        </p>
      </section>

      {/* Section 5 */}
      <section id="sec-05" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          5. Account Security & Credential Confidentiality
        </h2>
        <p>
          You are responsible for maintaining the confidentiality of your login credentials and password. You agree to accept responsibility for all activities conducted under your account. Notify us immediately of any unauthorized access or security breach.
        </p>
      </section>

      {/* Section 6 */}
      <section id="sec-06" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          6. Product Information, Tolerances & Visual Nuances
        </h2>
        <p>
          We strive to represent garment cuts, fabric weights, textures, and colorways with maximum technical fidelity. However:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li>Color representation may exhibit minor variations across display monitors and device calibrations;</li>
          <li>Standard garment manufacturing tolerances of approximately +/- 0.5 inches may occur due to manual tailoring and natural fabric tension;</li>
          <li>Organic cotton and garment-dye processes may present natural tonal nuances characteristic of artisan craftsmanship.</li>
        </ul>
      </section>

      {/* Section 7 */}
      <section id="sec-07" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          7. Pricing Structure
        </h2>
        <p>
          All product prices on SUPERSNAKE.IN are denominated in Indian Rupees (INR ₹). We reserve the right to revise prices for upcoming collections or seasonal drops without prior notice. The price charged for an order will be the price displayed at the moment of checkout confirmation.
        </p>
      </section>

      {/* Section 8 */}
      <section id="sec-08" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          8. Taxes (Goods & Services Tax)
        </h2>
        <p>
          All product prices displayed on the website are inclusive of applicable integrated Goods and Services Tax (GST) under Indian tax laws, unless explicitly indicated otherwise on the checkout review screen.
        </p>
      </section>

      {/* Section 9 */}
      <section id="sec-09" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          9. Product Availability & Limited Drops
        </h2>
        <p>
          Products are produced in limited batches and are subject to stock availability. Receipt of an order acknowledgment does not signify final acceptance if an item becomes unavailable due to an inventory anomaly or defect discovered during pre-dispatch checks.
        </p>
      </section>

      {/* Section 10 */}
      <section id="sec-10" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          10. Order Placement & Contract Formation
        </h2>
        <p>
          Submitting an order constitutes an offer to purchase. A legally binding contract of sale is formed only when we successfully process your payment, issue an order confirmation, and prepare your parcel for courier dispatch.
        </p>
      </section>

      {/* Section 11 */}
      <section id="sec-11" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          11. Payment Processing &amp; Instruments
        </h2>
        <p>
          Payments may be processed through authorised payment service providers using appropriate security measures. Payment information may be handled directly by the applicable payment service provider in accordance with its own terms, privacy policy, and applicable security requirements.
        </p>
        <p>
          We accept UPI, major credit/debit cards, Net Banking, and approved digital payment instruments. By submitting payment, you represent that you are authorized to use the chosen payment instrument.
        </p>
      </section>

      {/* Section 12 */}
      <section id="sec-12" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          12. Shipping & Delivery Terms
        </h2>
        <p>
          Orders are delivered through appointed third-party courier services. Delivery estimates and logistics charges are detailed in our dedicated <Link href="/shipping" className="text-snake-green hover:underline">Shipping & Delivery</Link> policy, which forms an integral part of these Terms.
        </p>
      </section>

      {/* Section 13 */}
      <section id="sec-13" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          13. Cancellation Terms
        </h2>
        <p>
          Orders may be cancelled only while in Pending or Processing status, prior to being packed or dispatched. Once dispatched, orders cannot be cancelled. For full conditions, refer to our <Link href="/cancellation" className="text-snake-green hover:underline">Cancellation Policy</Link>.
        </p>
      </section>

      {/* Section 14 */}
      <section id="sec-14" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          14. Returns & Defect Remedies
        </h2>
        <p>
          SuperSnake follows a strict no-return policy for ordinary purchases. We do not accept returns for change of mind, incorrect size selection, or fit/color preferences.
        </p>
        <p>
          If a product is received damaged, defective, or materially non-conforming, our email-first defect reporting workflow applies. Consult our <Link href="/returns" className="text-snake-green hover:underline">Returns & Defects</Link> policy for evidence requirements and potential remedies.
        </p>
      </section>

      {/* Section 15 */}
      <section id="sec-15" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          15. Intellectual Property & Brand Ownership
        </h2>
        <p>
          The &ldquo;SuperSnake&rdquo; name, logo, graphic emblems, website design, UI architecture, typography, product photographs, editorial copy, and code are protected by applicable Indian and international copyright, trademark, and intellectual property laws.
        </p>
        <p>
          No material from this website may be copied, reproduced, republished, uploaded, posted, transmitted, or distributed for commercial purposes without our prior written authorization.
        </p>
      </section>

      {/* Section 16 */}
      <section id="sec-16" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          16. Website Use & Permitted Access
        </h2>
        <p>
          We grant you a limited, non-exclusive, non-transferable license to access and make personal, non-commercial use of SUPERSNAKE.IN. You agree not to download (other than page caching) or modify any portion of the site without express written consent.
        </p>
      </section>

      {/* Section 17 */}
      <section id="sec-17" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          17. Prohibited Activities
        </h2>
        <p>
          When using SUPERSNAKE.IN, you agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-neutral-400">
          <li>Use automated scripts, bots, spiders, or scrapers to extract data or inventory;</li>
          <li>Introduce malware, viruses, or code designed to disrupt platform performance;</li>
          <li>Attempt unauthorized access to our administrative portal, databases, or servers;</li>
          <li>Impersonate any person or misrepresent your affiliation with SuperSnake;</li>
          <li>Use the platform for any unlawful, deceptive, or fraudulent purpose.</li>
        </ul>
      </section>

      {/* Section 18 */}
      <section id="sec-18" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          18. User Submissions & Feedback
        </h2>
        <p>
          Any reviews, suggestions, ideas, or feedback submitted to SuperSnake become our non-exclusive property and may be used for service improvement without obligation of compensation.
        </p>
      </section>

      {/* Section 19 */}
      <section id="sec-19" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          19. Third-Party Services & Links
        </h2>
        <p>
          Our platform integrates third-party services (such as payment gateways and courier tracking). We do not control and are not responsible for the independent operations or content of third-party websites.
        </p>
      </section>

      {/* Section 20 */}
      <section id="sec-20" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          20. Website Availability & Maintenance
        </h2>
        <p>
          While we strive for 24/7 continuous availability, we do not warrant that website operation will be uninterrupted or error-free. Periodic maintenance, updates, or technical contingencies may occur.
        </p>
      </section>

      {/* Section 21 */}
      <section id="sec-21" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          21. Limitation of Liability
        </h2>
        <p>
          To the maximum extent permitted by applicable Indian law, SuperSnake shall not be liable for indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the website or purchased products.
        </p>
        <p>
          Nothing in these Terms attempts to exclude or limit liability for death, personal injury caused by negligence, fraud, or any liability that cannot lawfully be excluded under Indian consumer protection statutes.
        </p>
      </section>

      {/* Section 22 */}
      <section id="sec-22" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          22. Indemnification
        </h2>
        <p>
          Where legally appropriate, you agree to indemnify and hold harmless SuperSnake, its directors, officers, employees, and agents from any claims, damages, liabilities, and expenses arising from your violation of these Terms or misuse of the platform.
        </p>
      </section>

      {/* Section 23 */}
      <section id="sec-23" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          23. Force Majeure
        </h2>
        <p>
          Neither party shall be held liable for failure or delay in performing obligations (other than payment) resulting from events beyond reasonable control, including natural catastrophes, severe weather, regional transport disruption, strikes, pandemics, or government containment orders.
        </p>
      </section>

      {/* Section 24 */}
      <section id="sec-24" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          24. Amendments & Modifications to Terms
        </h2>
        <p>
          We reserve the right to modify these Terms to reflect operational, legal, or regulatory changes. Updated versions will be published with an updated &ldquo;Last Updated&rdquo; date. Continued use of the platform constitutes acceptance of revised terms.
        </p>
      </section>

      {/* Section 25 */}
      <section id="sec-25" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          25. Governing Law
        </h2>
        <p>
          These Terms and any dispute or claim arising out of or in connection with them or your garment acquisitions shall be governed by and construed in accordance with the substantive laws of India.
        </p>
      </section>

      {/* Section 26 */}
      <section id="sec-26" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          26. Jurisdiction
        </h2>
        <p>
          Subject to applicable consumer protection legislation, any dispute, controversy, or claim arising under or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-white font-normal">{jurisdiction}</strong>.
        </p>
      </section>

      {/* Section 27 */}
      <section id="sec-27" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          27. Consumer Rights & Statutory Saving Clause
        </h2>
        <p>
          Nothing in these Terms is intended to exclude, restrict, or limit any right, remedy, obligation, or liability that cannot lawfully be excluded, restricted, or limited under applicable Indian consumer laws, including the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020.
        </p>
      </section>

      {/* Section 28 */}
      <section id="sec-28" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          28. Contact Information &amp; Legal Notices
        </h2>
        <p>
          For legal notices or formal business correspondence regarding these Terms, please contact our office at{' '}
          <a href={`mailto:${OFFICIAL_EMAILS.office}`} className="text-snake-green hover:underline">
            {OFFICIAL_EMAILS.office}
          </a>{' '}
          or via our <Link href="/contact" className="text-snake-green hover:underline">Contact Us</Link> portal.
        </p>
      </section>
    </PolicyLayout>
  );
}
