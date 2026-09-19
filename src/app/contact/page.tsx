'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { BRAND } from '@/lib/design-tokens';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const prefilledOrder = searchParams.get('order') || '';

  const [category, setCategory] = useState(prefilledOrder ? 'Order Inquiry' : 'General Concierge');
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
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            CLIENT RELATIONS
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            ATELIER CONCIERGE
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400">
            For sizing consultations, custom orders, or order inquiries. Expect a personal response within 4 business hours.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Info Card */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase block">
                DIRECT CHANNELS
              </span>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-snake-green shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">EMAIL</span>
                    <a href={`mailto:${BRAND.contact.email}`} className="text-white hover:text-snake-green transition-colors">
                      {BRAND.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-snake-green shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">HOURS</span>
                    <p className="text-white">Monday – Saturday</p>
                    <p className="text-neutral-400 text-[11px]">10:00 AM – 7:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-snake-green shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">STUDIO</span>
                    <p className="text-white">SuperSnake Design Atelier</p>
                    <p className="text-neutral-400 text-[11px]">Indiranagar, Bengaluru, KA 560038, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-sm space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block">
                EXPRESS TRACKING
              </span>
              <p className="text-xs font-mono text-neutral-400">
                Looking to track an existing shipment?
              </p>
              <a
                href="/track-order"
                className="inline-block text-xs font-mono text-snake-green hover:underline uppercase pt-1"
              >
                OPEN TRACKING PORTAL →
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 size={40} className="text-snake-green mx-auto animate-pulse" />
                <h3 className="text-xl font-display font-medium text-white">
                  INQUIRY TRANSMITTED
                </h3>
                <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white">{fullName}</span>. An atelier client specialist has received your inquiry regarding <span className="text-white">{category}</span> and will reply directly to <span className="text-white">{email}</span>.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-4 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono uppercase tracking-wider rounded"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Inquiry Classification
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  >
                    <option value="General Concierge">General Concierge</option>
                    <option value="Order Inquiry">Order Inquiry & Logistics</option>
                    <option value="Sizing Consultation">Sizing & Silhouette Consultation</option>
                    <option value="Returns & Exchanges">Returns & Exchanges</option>
                    <option value="Press & Collaborations">Press & Collaborations</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Aditya Sharma"
                      className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="patron@supersnake.in"
                      className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. SS-2026-1049"
                    className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Detail your request or inquiry..."
                    className="w-full bg-[#121212] border border-white/15 px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-snake-green resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'TRANSMITTING...'
                  ) : (
                    <>
                      <span>SUBMIT TO ATELIER</span>
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

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ContactFormContent />
    </Suspense>
  );
}
