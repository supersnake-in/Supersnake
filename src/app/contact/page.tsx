'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Clock, Send, CheckCircle2, ArrowRight, AlertCircle, FileText, Phone } from 'lucide-react';
import { LEGAL_CONFIG, OFFICIAL_EMAILS } from '@/lib/legal-config';
import { useStore } from '@/lib/store';

function ContactFormContent() {
  const { socialConfig } = useStore();
  const searchParams = useSearchParams();
  const prefilledOrder = searchParams.get('order') || '';
  const prefilledCategory = searchParams.get('category') || '';

  const [category, setCategory] = useState(
    prefilledCategory || (prefilledOrder ? 'Order Help' : 'Order Help')
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState(prefilledOrder);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="bg-black text-white min-h-screen pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 font-sans selection:bg-snake-green selection:text-black">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
              CUSTOMER CARE
            </span>
            <span className="text-neutral-600 text-xs">•</span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              SUPERSNAKE CONCIERGE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            CONTACT US
          </h1>

          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-2xl leading-relaxed">
            Have an inquiry regarding an acquisition, sizing consultation, delivery milestone, or defect report? Connect directly with our team through the official channels below.
          </p>
        </div>

        {/* Official Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 text-xs font-mono">
          {/* Channel 1: Customer Support */}
          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2.5">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[10px] uppercase tracking-widest text-snake-green">CUSTOMER SUPPORT</span>
              <Mail size={14} className="text-snake-green" />
            </div>
            <a
              href={`mailto:${OFFICIAL_EMAILS.support}`}
              className="text-white hover:text-snake-green transition-colors font-semibold block text-sm break-all"
            >
              {OFFICIAL_EMAILS.support}
            </a>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Orders, delivery, defect reports, cancellations, and general customer care.
            </p>
          </div>

          {/* Channel 2: Telephone Concierge */}
          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2.5">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[10px] uppercase tracking-widest text-snake-green">CONCIERGE LINE</span>
              <Phone size={14} className="text-snake-green" />
            </div>
            <a
              href={`tel:${(socialConfig?.contactPhone || '+91 (0) 80 4920 2000').replace(/[^+\d]/g, '')}`}
              className="text-white hover:text-snake-green transition-colors font-semibold block text-sm break-all"
            >
              {socialConfig?.contactPhone || '+91 (0) 80 4920 2000'}
            </a>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Direct telephone line for sizing consultations, VIP inquiries &amp; urgent orders.
            </p>
          </div>

          {/* Channel 3: General Enquiries */}
          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2.5">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[10px] uppercase tracking-widest text-snake-green">GENERAL ENQUIRIES</span>
              <Mail size={14} className="text-snake-green" />
            </div>
            <a
              href={`mailto:${OFFICIAL_EMAILS.general}`}
              className="text-white hover:text-snake-green transition-colors font-semibold block text-sm break-all"
            >
              {OFFICIAL_EMAILS.general}
            </a>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Brand partnerships, general questions, and brand correspondence.
            </p>
          </div>

          {/* Channel 4: Formal / Legal */}
          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2.5">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[10px] uppercase tracking-widest text-snake-green">FORMAL &amp; LEGAL</span>
              <FileText size={14} className="text-snake-green" />
            </div>
            <a
              href={`mailto:${OFFICIAL_EMAILS.office}`}
              className="text-white hover:text-snake-green transition-colors font-semibold block text-sm break-all"
            >
              {OFFICIAL_EMAILS.office}
            </a>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Formal business, regulatory notices, and privacy-related correspondence.
            </p>
          </div>

          {/* Channel 5: Operating Hours */}
          <div className="bg-[#0a0a0a] border border-white/10 p-5 rounded-sm space-y-2.5">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-[10px] uppercase tracking-widest text-snake-green">CARE HOURS</span>
              <Clock size={14} className="text-snake-green" />
            </div>
            <p className="text-white font-semibold text-xs leading-snug">
              {LEGAL_CONFIG.customerCareHours}
            </p>
            <p className="text-[10px] text-neutral-500">
              Excluding National &amp; State Holidays
            </p>
          </div>
        </div>

        {/* Main Section: Form & Directives */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Quick Links */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-4 text-xs font-mono">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block border-b border-white/10 pb-2">
                CUSTOMER DIRECTIVES
              </span>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link href="/track-order" className="text-neutral-300 hover:text-snake-green transition-colors flex items-center justify-between">
                    <span>Live Order Tracking</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-neutral-300 hover:text-snake-green transition-colors flex items-center justify-between">
                    <span>Frequently Asked Questions</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-neutral-300 hover:text-snake-green transition-colors flex items-center justify-between">
                    <span>Shipping &amp; Delivery Policy</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-neutral-300 hover:text-snake-green transition-colors flex items-center justify-between">
                    <span>Returns &amp; Defects Policy</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/cancellation" className="text-neutral-300 hover:text-snake-green transition-colors flex items-center justify-between">
                    <span>Cancellation Policy</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="text-neutral-300 hover:text-snake-green transition-colors flex items-center justify-between">
                    <span>Size Guide &amp; Fit Matrix</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/care-guide" className="text-neutral-300 hover:text-snake-green transition-colors flex items-center justify-between">
                    <span>Garment Care Protocols</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-8 bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4 font-mono">
                <CheckCircle2 size={40} className="text-snake-green mx-auto" />
                <h3 className="text-xl font-display font-medium text-white uppercase">
                  MESSAGE TRANSMITTED
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-medium">{fullName}</span>. Your inquiry regarding <span className="text-snake-green">{category}</span> has been received. Our team will review your message and reply to <span className="text-white font-medium">{email}</span> within our operating hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs uppercase tracking-wider rounded transition-colors"
                  >
                    SEND ANOTHER INQUIRY
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
                    Category of Inquiry *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-white text-xs focus:outline-none focus:border-snake-green rounded-sm"
                  >
                    <option value="Order Help">Order Help</option>
                    <option value="Payment Help">Payment Help</option>
                    <option value="Shipping & Delivery">Shipping &amp; Delivery</option>
                    <option value="Damaged / Defective Product">Damaged / Defective Product</option>
                    <option value="Order Cancellation">Order Cancellation</option>
                    <option value="Size & Fit Consultation">Size &amp; Fit Consultation</option>
                    <option value="Product Information">Product Information</option>
                    <option value="Account Help">Account Help</option>
                    <option value="Customer Complaint">Customer Complaint</option>
                    <option value="Other General Inquiry">Other General Inquiry</option>
                  </select>
                </div>

                {/* Contextual Advisory for Defect Reports */}
                {category === 'Damaged / Defective Product' && (
                  <div className="p-3 bg-white/[0.02] border border-snake-green/30 rounded text-[11px] text-neutral-300 flex items-start gap-2.5 leading-relaxed">
                    <AlertCircle size={15} className="text-snake-green shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Evidence Submission Requirement:</p>
                      <p className="text-neutral-400 mt-0.5">
                        For rapid investigation of damage or defect claims, please send clear photographs of the garment, defect close-up, and outer shipping packaging directly to{' '}
                        <a href={`mailto:${OFFICIAL_EMAILS.support}`} className="text-snake-green hover:underline">
                          {OFFICIAL_EMAILS.support}
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="e.g. Aditya Sharma"
                      className="w-full min-h-[44px] bg-[#121212] border border-white/15 px-4 py-3 text-white text-base sm:text-xs focus:outline-none focus:border-snake-green rounded-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="patron@example.com"
                      className="w-full min-h-[44px] bg-[#121212] border border-white/15 px-4 py-3 text-white text-base sm:text-xs focus:outline-none focus:border-snake-green rounded-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. SS-2026-1049"
                    className="w-full min-h-[44px] bg-[#121212] border border-white/15 px-4 py-3 text-white text-base sm:text-xs focus:outline-none focus:border-snake-green rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
                    Your Message / Inquiry Details *
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Please provide specifics regarding your inquiry..."
                    className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-white text-xs focus:outline-none focus:border-snake-green rounded-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] py-3.5 bg-white hover:bg-snake-green text-black uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    'TRANSMITTING...'
                  ) : (
                    <>
                      <span>SUBMIT INQUIRY</span>
                      <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactUsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ContactFormContent />
    </Suspense>
  );
}
