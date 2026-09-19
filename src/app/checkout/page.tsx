'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, CreditCard, Smartphone, Building, Wallet, AlertCircle, RefreshCw, ShoppingBag, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, BRAND } from '@/lib/design-tokens';
import { loadLastCheckout, loadCartFromStorageAsync } from '@/lib/storage-helper';
import { fetchProductsFromSupabase } from '@/lib/supabase/db';
import { Size } from '@/lib/types';
import confetti from 'canvas-confetti';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, cartTotal, createOrder, updateOrder, clearCart, isLoaded, products, addToCart } = useStore();
  const { user, profile } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
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
    postOffice: '',
    paymentMethod: 'upi',
  });

  const [postOffices, setPostOffices] = useState<Array<{ name: string; branchType?: string; deliveryStatus?: string }>>([]);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);

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

  const lookupPincode = async (code: string) => {
    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setPostOffices([]);
      setPincodeMessage(null);
      return;
    }

    setIsFetchingPincode(true);
    setPincodeMessage(null);

    try {
      let data: any = null;
      try {
        const res = await fetch(`/api/pincode/${cleanCode}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {}

      // Direct fallback if internal API route is unreachable
      if (!data || !data.success) {
        try {
          const directRes = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`);
          if (directRes.ok) {
            const directData = await directRes.json();
            if (Array.isArray(directData) && directData[0]?.Status === 'Success' && directData[0]?.PostOffice?.length) {
              const rawPOs = directData[0].PostOffice;
              data = {
                success: true,
                district: rawPOs[0].District || rawPOs[0].Division || '',
                state: rawPOs[0].State || '',
                postOffices: rawPOs.map((po: any) => ({
                  name: po.Name,
                  branchType: po.BranchType || '',
                  deliveryStatus: po.DeliveryStatus || '',
                })),
              };
            }
          }
        } catch (directErr) {}
      }

      if (data && data.success && Array.isArray(data.postOffices) && data.postOffices.length > 0) {
        const district = data.district || '';
        const state = data.state || '';
        const poList = data.postOffices;

        // Prioritize delivery post offices, then alphabetical
        const sortedPOs = [...poList].sort((a: any, b: any) => {
          if (a.deliveryStatus === 'Delivery' && b.deliveryStatus !== 'Delivery') return -1;
          if (a.deliveryStatus !== 'Delivery' && b.deliveryStatus === 'Delivery') return 1;
          return a.name.localeCompare(b.name);
        });

        setPostOffices(sortedPOs);

        // Auto-fill city/district and state
        setFormData((prev) => {
          const selectedPO =
            sortedPOs.length === 1
              ? sortedPOs[0].name
              : sortedPOs.some((p: any) => p.name === prev.postOffice)
              ? prev.postOffice
              : '';
          return {
            ...prev,
            city: district || prev.city,
            state: state || prev.state,
            postOffice: selectedPO,
          };
        });

        if (poList.length > 1) {
          setPincodeMessage(`${poList.length} post offices found. Select yours from the dropdown.`);
        } else {
          setPincodeMessage(null);
        }
      } else {
        setPostOffices([]);
        setPincodeMessage('PIN code not found. You can enter City and State manually.');
      }
    } catch (error) {
      console.error('Failed to lookup PIN code:', error);
      setPincodeMessage(null);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, postalCode: val }));
    if (val.length === 6) {
      lookupPincode(val);
    } else {
      if (postOffices.length > 0) setPostOffices([]);
      if (pincodeMessage) setPincodeMessage(null);
    }
  };

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
      if (postOffices.length > 1 && !formData.postOffice) {
        setPincodeMessage('Please select your post office from the dropdown before continuing.');
        return;
      }
      handleCompletePayment();
    }
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    const totalOrderAmount = cartTotal + (cartTotal >= BRAND.freeShippingThreshold ? 0 : 150);
    const amountInPaise = Math.round(totalOrderAmount * 100);

    try {
      // 1. Ensure Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error(
          'Could not load Razorpay payment gateway. Please check your internet connection or disable ad-blockers and try again.'
        );
      }

      // 2. Create order in store before payment
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
        total: totalOrderAmount,
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
          postOffice: formData.postOffice || undefined,
        },
        payment: {
          method: 'razorpay',
          transactionId: '',
          status: 'pending',
          paidAt: '',
        },
      });

      // 3. Call backend to create Razorpay Order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          customer: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
          orderId: newOrder.id,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to initialize payment session with server.');
      }

      const orderData = await orderRes.json();
      if (!orderData.order_id) {
        throw new Error('Order ID was not returned by payment gateway.');
      }

      // 4. Open Razorpay Standard Checkout
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TdtCpOjDeqd3Mg',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SuperSnake',
        description: `Order #${newOrder.orderNumber}`,
        order_id: orderData.order_id,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#04fc21',
          backdrop_color: 'rgba(0, 0, 0, 0.85)',
        },
        handler: async function (response: any) {
          try {
            // Verify payment signature on server
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              updateOrder(newOrder.id, {
                status: 'Confirmed',
                payment: {
                  method: 'razorpay',
                  transactionId: response.razorpay_payment_id,
                  status: 'paid',
                  paidAt: new Date().toISOString(),
                },
              });
              clearCart();
              router.push(`/checkout/confirmation?orderId=${newOrder.id}&razorpay_payment_id=${response.razorpay_payment_id}`);
            } else {
              setPaymentError('Payment verification failed. If your account was debited, please contact client concierge.');
              setIsProcessing(false);
            }
          } catch (e: any) {
            setPaymentError('Payment verification interrupted. Please contact client concierge.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setPaymentError(response.error?.description || 'Payment was declined by your bank.');
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || 'Payment gateway connection interrupted. Please try again.');
    }
  };

  // Recovery effect: If cart is empty, recover from URL params, storage helper, or last checkout item
  const [isRecovering, setIsRecovering] = useState(false);
  const [hasAttemptedRecovery, setHasAttemptedRecovery] = useState(false);

  useEffect(() => {
    if (!isLoaded || cart.length > 0 || hasAttemptedRecovery) return;

    const attemptRecovery = async () => {
      setIsRecovering(true);

      // 1. Check URL search parameters (e.g. from "BUY NOW DIRECT" or "quick buy")
      const paramSlug = searchParams.get('slug');
      const paramProductId = searchParams.get('productId');
      const paramSize = searchParams.get('size') as Size | null;
      const paramColorName = searchParams.get('color');
      const paramColorHex = searchParams.get('colorHex');
      const paramQty = parseInt(searchParams.get('qty') || '1', 10);

      if (paramSlug || paramProductId) {
        let found = products.find((p) => p.slug === paramSlug || p.id === paramProductId);
        if (!found) {
          try {
            const fetched = await fetchProductsFromSupabase();
            if (fetched) {
              found = fetched.find((p) => p.slug === paramSlug || p.id === paramProductId);
            }
          } catch (e) {}
        }

        if (found) {
          const color = found.colors.find((c) => c.name === paramColorName) || 
            (paramColorName ? { name: paramColorName, hex: paramColorHex || '#0a0a0a' } : found.colors[0]);
          const size = paramSize || found.sizes[2] || found.sizes[0] || 'L';
          addToCart(found, size, color, isNaN(paramQty) ? 1 : paramQty);
          setIsRecovering(false);
          setHasAttemptedRecovery(true);
          return;
        }
      }

      // 2. Check last checkout item from sessionStorage / localStorage / IndexedDB
      const lastCheckout = loadLastCheckout();
      if (lastCheckout && (lastCheckout.slug || lastCheckout.productId)) {
        let found = products.find((p) => p.slug === lastCheckout.slug || p.id === lastCheckout.productId) || lastCheckout.product;
        if (!found) {
          try {
            const fetched = await fetchProductsFromSupabase();
            if (fetched) {
              found = fetched.find((p) => p.slug === lastCheckout.slug || p.id === lastCheckout.productId);
            }
          } catch (e) {}
        }

        if (found) {
          addToCart(found, lastCheckout.size, lastCheckout.color, lastCheckout.quantity || 1);
          setIsRecovering(false);
          setHasAttemptedRecovery(true);
          return;
        }
      }

      // 3. Check asynchronous storage (IndexedDB)
      const asyncCart = await loadCartFromStorageAsync();
      if (asyncCart.length > 0) {
        asyncCart.forEach((item) => {
          addToCart(item.product, item.selectedSize, item.selectedColor, item.quantity);
        });
      }

      setIsRecovering(false);
      setHasAttemptedRecovery(true);
    };

    attemptRecovery();
  }, [isLoaded, cart.length, hasAttemptedRecovery, products, searchParams, addToCart]);

  if (!isLoaded || isRecovering) {
    return (
      <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center space-y-4">
        <Loader2 size={32} className="text-snake-green animate-spin" />
        <h2 className="text-xl font-display uppercase tracking-wider text-neutral-300">PREPARING ATELIER CHECKOUT...</h2>
        <p className="text-xs font-mono text-neutral-500">Securing your garment selection</p>
      </div>
    );
  }

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
                        unoptimized={Boolean(item.product.images[0]?.url?.startsWith('data:') || item.product.images[0]?.url?.startsWith('blob:'))}
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
        <div className="grid grid-cols-2 gap-2 mb-8 md:mb-10 text-xs font-mono">
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
            02. DELIVERY &amp; PAYMENT
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Form (Steps) */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-white/10 rounded-lg p-5 sm:p-8 space-y-8">
            {/* Step 1: Contact */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="border-b border-white/10 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-mono tracking-widest text-white uppercase font-bold">
                      CONTACT INFORMATION
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-500 mt-1">
                      We will send order confirmation & shipment tracking updates here.
                    </p>
                  </div>
                  {!user && (
                    <Link
                      href="/login?next=/checkout"
                      className="text-xs font-mono text-snake-green hover:underline uppercase shrink-0 pt-0.5"
                    >
                      SIGN IN →
                    </Link>
                  )}
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
                      Tracked delivery through our authorised courier partners.
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
                      <label className="text-neutral-400 uppercase flex items-center justify-between">
                        <span>PINCODE *</span>
                        {isFetchingPincode && (
                          <span className="text-[10px] text-snake-green font-mono flex items-center gap-1">
                            <Loader2 size={11} className="animate-spin" />
                            DETECTING...
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        inputMode="numeric"
                        maxLength={6}
                        pattern="[0-9]*"
                        autoComplete="postal-code"
                        value={formData.postalCode}
                        onChange={handlePincodeChange}
                        placeholder="e.g. 560094"
                        className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green font-mono"
                      />
                      {pincodeMessage && (
                        <p className={`text-[10px] font-mono ${postOffices.length > 1 ? 'text-snake-green' : 'text-neutral-400'}`}>
                          {pincodeMessage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Post Office Dropdown when 2 or more exist */}
                  {postOffices.length > 1 && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-neutral-400 uppercase flex items-center justify-between">
                        <span className="text-white font-semibold">SELECT POST OFFICE / AREA *</span>
                        <span className="text-[10px] text-snake-green font-mono">
                          {postOffices.length} LOCATIONS IN THIS PINCODE
                        </span>
                      </label>
                      <div className="relative">
                        <select
                          name="postOffice"
                          required
                          value={formData.postOffice}
                          onChange={handleChange}
                          className="w-full min-h-[48px] bg-[#111] border border-snake-green/60 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green appearance-none pr-10 cursor-pointer font-mono"
                        >
                          <option value="" disabled className="bg-black text-neutral-500">
                            -- SELECT POST OFFICE --
                          </option>
                          {postOffices.map((po) => (
                            <option key={po.name} value={po.name} className="bg-neutral-900 text-white py-1">
                              {po.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-snake-green pointer-events-none" />
                      </div>
                      <p className="text-[10px] font-mono text-neutral-400">
                        Selected post office will be attached to your delivery address for accurate dispatch.
                      </p>
                    </div>
                  )}

                  {/* Single Post Office display if exactly 1 found */}
                  {postOffices.length === 1 && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-neutral-400 uppercase flex items-center justify-between">
                        <span>POST OFFICE / AREA</span>
                        <span className="text-[10px] text-snake-green font-mono">AUTO-DETECTED</span>
                      </label>
                      <input
                        type="text"
                        name="postOffice"
                        value={formData.postOffice}
                        onChange={handleChange}
                        className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green font-mono"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-neutral-400 uppercase flex items-center justify-between">
                        <span>CITY / DISTRICT *</span>
                        {formData.city && <span className="text-[10px] text-snake-green font-mono">AUTO-FILLED</span>}
                      </label>
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
                      <label className="text-neutral-400 uppercase flex items-center justify-between">
                        <span>STATE *</span>
                        {formData.state && <span className="text-[10px] text-snake-green font-mono">AUTO-FILLED</span>}
                      </label>
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

                <div className="text-[11px] font-mono text-neutral-500 leading-relaxed pt-1">
                  By completing this transaction, you agree to our{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-neutral-300 hover:text-snake-green underline underline-offset-2"
                  >
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-neutral-300 hover:text-snake-green underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  , and acknowledge our{' '}
                  <Link
                    href="/shipping"
                    target="_blank"
                    className="text-neutral-300 hover:text-snake-green underline underline-offset-2"
                  >
                    Shipping &amp; Delivery
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/returns"
                    target="_blank"
                    className="text-neutral-300 hover:text-snake-green underline underline-offset-2"
                  >
                    Returns &amp; Defects
                  </Link>
                  .
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
                    disabled={isProcessing}
                    className="flex-1 min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(4,252,33,0.3)] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        CONNECTING TO RAZORPAY...
                      </>
                    ) : (
                      <>
                        CONTINUE TO PAYMENT <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
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
                      unoptimized={Boolean(item.product.images[0]?.url?.startsWith('data:') || item.product.images[0]?.url?.startsWith('blob:'))}
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
                REVIEW DETAILS
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
      {/* Preload Razorpay Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 size={32} className="text-snake-green animate-spin" />
          <h2 className="text-xl font-display uppercase tracking-wider text-neutral-300">PREPARING ATELIER CHECKOUT...</h2>
          <p className="text-xs font-mono text-neutral-500">Securing your garment selection</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
