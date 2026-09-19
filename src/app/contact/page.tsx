'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Clock, MapPin, Send, CheckCircle2, ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react';
import { LEGAL_CONFIG, getLegalValue } from '@/lib/legal-config';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const prefilledOrder = searchParams.get('order') || '';
  const prefilledCategory = searchParams.get('category') || '';

  const [category, setCategory] = useState(
    prefilledCategory || (prefilledOrder ? 'Order Help' : 'General Inquiry')
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

  const supportEmail = LEGAL_CONFIG.supportEmail || getLegalValue(null, 'SUPPORT_EMAIL');

  return (
    <div className="bg-black text-white min-h-screen pt-28 sm:pt-32 pb-24 px-4 sm:px-6 md:px-12 font-sans selection:bg-snake-green selection:text-black">
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
              CUSTOMER CARE
            </span>
            <span className="text-neutral-600 text-xs">•</span>
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              ATELIER CONCIERGE
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            CONTACT US
          </h1>

          <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-xl leading-relaxed">
            Have a question about an acquisition, sizing consultation, logistics milestone, or defect review? Our client specialists are here to assist.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Direct Channels Card */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-5">
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block border-b border-white/10 pb-2">
                DIRECT CHANNELS
              </span>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-snake-green shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">EMAIL CONCIERGE</span>
                    {LEGAL_CONFIG.supportEmail ? (
                      <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} className="text-white hover:text-snake-green transition-colors font-medium">
                        {LEGAL_CONFIG.supportEmail}
                      </a>
                    ) : (
                      <span className="text-neutral-400 font-medium">{supportEmail}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-snake-green shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">HOURS OF OPERATION</span>
                    <p className="text-white">{LEGAL_CONFIG.customerCareHours || 'Monday – Saturday, 10:00 AM – 7:00 PM IST'}</p>
                    <p className="text-neutral-500 text-[10px]">Excluding National & State Holidays</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-snake-green shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">ATELIER LOCATION</span>
                    <p className="text-white">
                      {LEGAL_CONFIG.registeredAddress || getLegalValue(null, 'ATELIER_STUDIO_ADDRESS')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Self-Service Links */}
            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-3">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block border-b border-white/5 pb-2">
                SELF-SERVICE DIRECTIVES
              </span>
              <ul className="space-y-2 text-xs font-mono">
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
                    <span>Shipping & Delivery Policy</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-neutral-300 hover:text-snake-green transition-colors flex items-center justify-between">
                    <span>Returns & Defects Protocol</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="text-neutral-300 hover:text-snake-green transition-colors flex items-center justify-between">
                    <span>Size & Fit Guide</span>
                    <ArrowRight size={12} className="text-neutral-500" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 rounded-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4 font-mono">
                <CheckCircle2 size={40} className="text-snake-green mx-auto animate-pulse" />
                <h3 className="text-xl font-display font-medium text-white uppercase">
                  MESSAGE TRANSMITTED
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-medium">{fullName}</span>. Your inquiry regarding <span className="text-snake-green">{category}</span> has been routed to our atelier desk. A specialist will reply to <span className="text-white font-medium">{email}</span> within our operating hours.
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
                    How Can We Help? (Inquiry Classification) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#121212] border border-white/15 px-4 py-3 text-white text-xs focus:outline-none focus:border-snake-green rounded-sm"
                  >
                    <option value="Order Help">Order Help & Order Status</option>
                    <option value="Payment Help">Payment & Checkout Inquiry</option>
                    <option value="Shipping & Delivery">Shipping & Delivery Logistics</option>
                    <option value="Returns & Defects">Damaged / Defective Product Report</option>
                    <option value="Cancellation Policy">Order Cancellation Request</option>
                    <option value="Sizing Consultation">Size & Fit Consultation</option>
                    <option value="Product Information">Product Materials & Specifications</option>
                    <option value="Other">Other Concierge Inquiries</option>
                  </select>
                </div>

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
