'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, CreditCard, Smartphone, Building, Wallet, AlertCircle, RefreshCw, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, BRAND } from '@/lib/design-tokens';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, createOrder } = useStore();
  const { user, profile } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'upi',
  });

  useEffect(() => {
    if (profile || user) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || profile?.email || user?.email || '',
        fullName: prev.fullName || profile?.fullName || '',
        phone: prev.phone || profile?.phone || '',
      }));
    }
  }, [profile, user]);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.email || !formData.phone) return;
      setStep(2);
    } else if (step === 2) {
      if (!formData.fullName || !formData.street || !formData.city || !formData.postalCode) return;
      setStep(3);
    }
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate Razorpay Gateway Interaction
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newOrder = createOrder({
        status: 'Confirmed',
        items: cart.map((c) => ({
          productId: c.product.id,
          productName: c.product.name,
          color: c.selectedColor.name,
          size: c.selectedSize,
          quantity: c.quantity,
          price: c.price,
          imageUrl: c.product.images[0]?.url || '',
        })),
        subtotal: cartTotal,
        discount: 0,
        shipping: cartTotal >= BRAND.freeShippingThreshold ? 0 : 150,
        tax: Math.round(cartTotal * 0.05),
        total: cartTotal + (cartTotal >= BRAND.freeShippingThreshold ? 0 : 150),
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state || 'Karnataka',
          postalCode: formData.postalCode,
        },
        payment: {
          method: 'razorpay',
          transactionId: `pay_SS${Date.now().toString().slice(-8)}`,
          status: 'paid',
          paidAt: new Date().toISOString(),
        },
      });

      // Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#04fc21', '#ffffff', '#000000'],
        });
      } catch (e) {}

      router.push(`/checkout/confirmation?orderId=${newOrder.id}`);
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || 'Payment gateway connection interrupted. Please verify your payment details and retry.');
    }
  };

  if (cart.length === 0 && !isProcessing) {
    return (
      <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-2xl font-display uppercase tracking-wider">YOUR BAG IS EMPTY</h2>
        <p className="text-xs font-mono text-neutral-400">Add garments to your bag before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="px-8 py-3.5 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase"
        >
          SHOP T-SHIRTS
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen pt-28 pb-24 px-4 sm:px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Checkout Header */}
        <div className="border-b border-white/10 pb-6 mb-8 md:mb-10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-mega text-snake-green uppercase">
              SECURE TRANSACTION
            </span>
            <h1 className="text-2xl md:text-4xl font-display font-bold uppercase tracking-tight text-white">
              CHECKOUT
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Lock size={14} className="text-snake-green" />
            <span>256-BIT ENCRYPTED</span>
          </div>
        </div>

        {/* Mobile Collapsible Order Summary */}
        <div className="lg:hidden mb-6 bg-[#0c0c0c] border border-white/10 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full p-4 flex items-center justify-between text-xs font-mono bg-neutral-950 hover:bg-neutral-900 transition-colors"
          >
            <div className="flex items-center gap-2 text-snake-green">
              <ShoppingBag size={15} />
              <span className="text-white font-medium">
                {showMobileSummary ? 'Hide order summary' : 'Show order summary'}
              </span>
              <span className="text-neutral-500">({cart.length})</span>
              {showMobileSummary ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
            </div>
            <span className="text-white font-bold text-sm">
              {formatPrice(cartTotal + (cartTotal >= BRAND.freeShippingThreshold ? 0 : 150))}
            </span>
          </button>

          {showMobileSummary && (
            <div className="p-4 border-t border-white/10 space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-white/5 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex gap-3 items-center">
                    <div className="relative w-12 h-14 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-white/5">
                      <Image
                        src={item.product.images[0]?.url || ''}
                        alt={item.product.name}
                        fill
                        sizes="50px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-[11px] font-mono min-w-0">
                      <p className="font-semibold text-white uppercase truncate">{item.product.name}</p>
                      <p className="text-[10px] text-neutral-400">
                        {item.selectedColor.name} • {item.selectedSize} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-white font-medium flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL</span>
                  <span className="text-white">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>EXPRESS SHIPPING</span>
                  <span className="text-snake-green">
                    {cartTotal >= BRAND.freeShippingThreshold ? 'FREE' : formatPrice(150)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>TAXES (GST 5%)</span>
                  <span className="text-white">INCLUDED</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-white pt-2 border-t border-white/10">
                  <span>TOTAL DUE</span>
                  <span className="text-base text-snake-green">
                    {formatPrice(cartTotal + (cartTotal >= BRAND.freeShippingThreshold ? 0 : 150))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="grid grid-cols-3 gap-2 mb-8 md:mb-10 text-xs font-mono">
          <div
            className={`pb-2 border-b-2 transition-colors ${
              step >= 1 ? 'border-snake-green text-white font-semibold' : 'border-neutral-800 text-neutral-600'
            }`}
          >
            01. CONTACT
          </div>
          <div
            className={`pb-2 border-b-2 transition-colors ${
              step >= 2 ? 'border-snake-green text-white font-semibold' : 'border-neutral-800 text-neutral-600'
            }`}
          >
            02. DELIVERY
          </div>
          <div
            className={`pb-2 border-b-2 transition-colors ${
              step >= 3 ? 'border-snake-green text-white font-semibold' : 'border-neutral-800 text-neutral-600'
            }`}
          >
            03. PAYMENT
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Form (Steps) */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-white/10 rounded-lg p-5 sm:p-8 space-y-8">
            {/* Step 1: Contact */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-mono tracking-widest text-white uppercase font-bold">
                    CONTACT INFORMATION
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-500 mt-1">
                    We will send order confirmation & shipment tracking updates here.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 uppercase">EMAIL ADDRESS *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. aditya@example.com"
                      className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-neutral-400 uppercase">PHONE NUMBER (FOR SMS TRACKING) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  CONTINUE TO DELIVERY <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* Step 2: Delivery */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-mono tracking-widest text-white uppercase font-bold">
                      DELIVERY ADDRESS
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-500 mt-1">
                      Express air delivery via Blue Dart / Delhivery.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-mono text-neutral-400 hover:text-white underline"
                  >
                    EDIT CONTACT
                  </button>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 uppercase">FULL RECIPIENT NAME *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Full recipient name"
                      className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-neutral-400 uppercase">STREET ADDRESS & APARTMENT *</label>
                    <input
                      type="text"
                      name="street"
                      required
                      autoComplete="street-address"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Building, flat, and street details"
                      className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-neutral-400 uppercase">LANDMARK (OPTIONAL)</label>
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        placeholder="Near Metro Station"
                        className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-neutral-400 uppercase">PINCODE *</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="postal-code"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="560038"
                        className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-neutral-400 uppercase">CITY *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Bengaluru"
                        className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-neutral-400 uppercase">STATE *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        autoComplete="address-level1"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Karnataka"
                        className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="min-h-[48px] py-4 px-6 border border-white/20 text-neutral-300 font-mono text-xs uppercase hover:border-white active:scale-[0.99] transition-all"
                  >
                    BACK
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    CONTINUE TO PAYMENT <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-mono tracking-widest text-white uppercase font-bold">
                      PAYMENT METHOD
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-500 mt-1">
                      Powered by Razorpay. All Indian payment instruments supported.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-mono text-neutral-400 hover:text-white underline"
                  >
                    EDIT DELIVERY
                  </button>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  {/* UPI */}
                  <label className="flex items-center justify-between p-4 border rounded border-snake-green bg-snake-green/5 cursor-pointer active:scale-[0.99] transition-all">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={formData.paymentMethod === 'upi'}
                        onChange={handleChange}
                        className="accent-snake-green"
                      />
                      <Smartphone size={18} className="text-snake-green shrink-0" />
                      <div>
                        <p className="font-semibold text-white">UPI (Google Pay, PhonePe, Paytm, CRED)</p>
                        <p className="text-[11px] text-neutral-400">Instant verification via QR code or VPA</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-snake-green font-bold uppercase shrink-0">FASTEST</span>
                  </label>

                  {/* Cards */}
                  <label className="flex items-center justify-between p-4 border rounded border-white/10 hover:border-white/30 cursor-pointer active:scale-[0.99] transition-all">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="accent-snake-green"
                      />
                      <CreditCard size={18} className="text-neutral-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Credit / Debit Card</p>
                        <p className="text-[11px] text-neutral-400">Visa, MasterCard, RuPay, Amex</p>
                      </div>
                    </div>
                  </label>

                  {/* Net Banking */}
                  <label className="flex items-center justify-between p-4 border rounded border-white/10 hover:border-white/30 cursor-pointer active:scale-[0.99] transition-all">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="netbanking"
                        checked={formData.paymentMethod === 'netbanking'}
                        onChange={handleChange}
                        className="accent-snake-green"
                      />
                      <Building size={18} className="text-neutral-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">Net Banking</p>
                        <p className="text-[11px] text-neutral-400">HDFC, ICICI, SBI, Axis & 50+ banks</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-black/60 border border-white/10 rounded text-[11px] font-mono text-neutral-400 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-snake-green flex-shrink-0" />
                  <span>
                    Your payment information is tokenized and processed via Razorpay’s PCI-DSS Level 1 compliant gateway. SuperSnake never stores raw card details.
                  </span>
                </div>

                <div className="text-[11px] font-mono text-neutral-500 leading-relaxed pt-1">
                  By completing this transaction, you agree to our{' '}
                  <Link href="/terms" target="_blank" className="text-neutral-300 hover:text-snake-green underline underline-offset-2">
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="text-neutral-300 hover:text-snake-green underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  , and acknowledge our{' '}
                  <Link href="/shipping" target="_blank" className="text-neutral-300 hover:text-snake-green underline underline-offset-2">
                    Shipping &amp; Delivery
                  </Link>{' '}
                  and{' '}
                  <Link href="/returns" target="_blank" className="text-neutral-300 hover:text-snake-green underline underline-offset-2">
                    Returns &amp; Defects
                  </Link>{' '}
                  policies.
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="min-h-[48px] py-4 px-6 border border-white/20 text-neutral-300 font-mono text-xs uppercase hover:border-white active:scale-[0.99] transition-all"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleCompletePayment}
                    disabled={isProcessing}
                    className="flex-1 min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(4,252,33,0.3)] disabled:opacity-50"
                  >
                    {isProcessing ? 'PROCESSING SECURE TRANSACTION...' : `PAY ${formatPrice(cartTotal)} →`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary Sidebar (Desktop locked) */}
          <div className="hidden lg:block lg:col-span-5 bg-[#0d0d0d] border border-white/10 rounded-lg p-6 space-y-6">
            <h3 className="text-xs font-mono tracking-widest text-neutral-400 uppercase border-b border-white/10 pb-3">
              YOUR ORDER ({cart.length})
            </h3>

            {/* Item list */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 divide-y divide-white/5">
              {cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3.5 items-center">
                  <div className="relative w-14 h-16 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-white/5">
                    <Image
                      src={item.product.images[0]?.url || ''}
                      alt={item.product.name}
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs font-mono">
                    <p className="font-semibold text-white uppercase">{item.product.name}</p>
                    <p className="text-[11px] text-neutral-400">
                      {item.selectedColor.name} • {item.selectedSize} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-white font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>SUBTOTAL</span>
                <span className="text-white">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>EXPRESS SHIPPING</span>
                <span className="text-snake-green">
                  {cartTotal >= BRAND.freeShippingThreshold ? 'FREE' : formatPrice(150)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>TAXES (GST 5%)</span>
                <span className="text-white">INCLUDED</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-white pt-3 border-t border-white/10">
                <span>TOTAL DUE</span>
                <span className="text-base text-snake-green">
                  {formatPrice(cartTotal + (cartTotal >= BRAND.freeShippingThreshold ? 0 : 150))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Error Modal */}
      {paymentError && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-red-800/60 p-6 md:p-8 rounded-sm max-w-md w-full space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={22} className="shrink-0" />
              <h3 className="text-lg font-display font-medium text-white uppercase">
                TRANSACTION UNRESOLVED
              </h3>
            </div>
            <p className="text-xs font-mono text-neutral-300 leading-relaxed">
              {paymentError}
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setPaymentError(null);
                  handleCompletePayment();
                }}
                className="w-full py-3 bg-snake-green hover:bg-white text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                <span>RETRY TRANSACTION</span>
              </button>
              <button
                onClick={() => setPaymentError(null)}
                className="w-full py-2.5 border border-white/20 hover:border-white text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
              >
                MODIFY PAYMENT METHOD
              </button>
              <Link
                href="/contact"
                className="text-center text-[11px] font-mono text-neutral-500 hover:text-snake-green pt-1 uppercase"
              >
                CONTACT CLIENT CONCIERGE →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
