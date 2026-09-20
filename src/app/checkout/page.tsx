'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, CreditCard, Smartphone, Building, Wallet, AlertCircle, RefreshCw, ShoppingBag, ChevronDown, ChevronUp, Loader2, Truck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, BRAND } from '@/lib/design-tokens';
import { loadLastCheckout, loadCartFromStorageAsync, loadCartFromStorageSync } from '@/lib/storage-helper';
import { fetchProductsFromSupabase } from '@/lib/supabase/db';
import { Size } from '@/lib/types';

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
  const { cart, cartTotal, createOrder, updateOrder, clearCart, isLoaded, products, setCart, setCartItem, freeShippingThreshold = BRAND.freeShippingThreshold } = useStore();
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  const { user, profile, checkEmailExists, sendEmailOtp, verifyEmailOtp, authenticateWithOtp, signIn, signInWithOtp, signInWithGoogle, signUp } = useAuth();

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

  // Step 1 Inline Authentication State
  const [authFlow, setAuthFlow] = useState<'enter_email' | 'verify_otp' | 'existing_password'>('enter_email');
  const [hasPasswordAccount, setHasPasswordAccount] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  // Returning patron with active session advances directly to delivery & payment
  useEffect(() => {
    if (user && step === 1) {
      setStep(2);
    }
  }, [user]);

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

  // Step 1 progressive inline authentication handlers
  const handleGoogleCheckoutAuth = async () => {
    setAuthError(null);
    setIsGoogleProcessing(true);
    const res = await signInWithGoogle('/checkout');
    if (res.error) {
      setAuthError(res.error);
      setIsGoogleProcessing(false);
    }
  };

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setAuthError('Please provide a valid email address.');
      return;
    }

    setIsAuthProcessing(true);
    try {
      const checkRes = await checkEmailExists(cleanEmail);
      setHasPasswordAccount(Boolean(checkRes.exists));

      const otpRes = await sendEmailOtp(cleanEmail);
      setIsAuthProcessing(false);

      if (!otpRes.success) {
        setAuthError(otpRes.error || 'Failed to dispatch verification code.');
        return;
      }

      setAuthFlow('verify_otp');
      setOtpCooldown(60);
      setAuthSuccess(`A 6-digit verification code was dispatched to ${cleanEmail}`);
    } catch (err: any) {
      setIsAuthProcessing(false);
      setAuthError(err.message || 'Email verification encountered an issue.');
    }
  };

  const handleVerifyOtpInline = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanOtp = authOtp.trim();

    if (cleanOtp.length !== 6) {
      setAuthError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsAuthProcessing(true);
    const res = await authenticateWithOtp(formData.email.trim().toLowerCase(), cleanOtp);
    setIsAuthProcessing(false);

    if (!res.success) {
      setAuthError(res.error || 'Invalid or expired verification code.');
    } else {
      setStep(2);
    }
  };

  const handleExistingPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authPassword) {
      setAuthError('Please enter your password.');
      return;
    }

    setIsAuthProcessing(true);
    const res = await signIn(formData.email.trim().toLowerCase(), authPassword);
    setIsAuthProcessing(false);

    if (res.error) {
      setAuthError(res.error);
    } else {
      setStep(2);
    }
  };

  const handleResendInlineOtp = async () => {
    if (otpCooldown > 0) return;
    setAuthError(null);
    setAuthSuccess(null);
    const cleanEmail = formData.email.trim().toLowerCase();

    const res = await sendEmailOtp(cleanEmail);
    if (!res.success) {
      setAuthError(res.error || 'Failed to resend code.');
    } else {
      setAuthSuccess(`New verification code sent to ${cleanEmail}`);
      setOtpCooldown(60);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.email) return;
      const cleanPhone = formData.phone.trim().replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setAuthError('Please provide a valid 10-digit mobile number.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const cleanPhone = formData.phone.trim().replace(/\D/g, '').slice(-10);
      if (!formData.fullName || !formData.street || !formData.city || !formData.postalCode) return;
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        setPaymentError('Please provide a valid 10-digit delivery contact number.');
        return;
      }
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

    const cleanPhone = formData.phone.trim().replace(/\D/g, '').slice(-10);
    const totalOrderAmount = cartTotal + (cartTotal >= freeShippingThreshold ? 0 : 150);
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
        status: 'Verification Pending',
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
        shipping: cartTotal >= freeShippingThreshold ? 0 : 150,
        tax: Math.round(cartTotal * 0.05),
        total: totalOrderAmount,
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: cleanPhone,
        },
        shippingAddress: {
          fullName: formData.fullName,
          phone: cleanPhone,
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
        verificationStatus: 'Pending',
        phoneVerified: false,
        customerId: user?.id,
      });

      // 3. Call backend to create Razorpay Order with authoritative items & customer
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
            phone: cleanPhone,
          },
          shippingAddress: {
            fullName: formData.fullName,
            phone: cleanPhone,
            street: formData.street,
            landmark: formData.landmark,
            city: formData.city,
            state: formData.state || 'Karnataka',
            postalCode: formData.postalCode,
            postOffice: formData.postOffice || undefined,
            country: 'India',
          },
          items: cart.map((c) => ({
            productId: c.product.id,
            productName: c.product.name,
            color: c.selectedColor.name,
            size: c.selectedSize,
            quantity: c.quantity,
            price: c.price,
            imageUrl: c.product.images[0]?.url || '',
          })),
          customerId: user?.id,
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
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TeKVwwxJXp1r5I',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SuperSnake',
        description: `Order #${newOrder.orderNumber}`,
        order_id: orderData.order_id,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: cleanPhone,
        },
        theme: {
          color: '#04fc21',
          backdrop_color: 'rgba(0, 0, 0, 0.85)',
        },
        handler: async function (response: any) {
          try {
            // Verify payment signature & idempotently record order on server
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  orderId: newOrder.id,
                  orderNumber: newOrder.orderNumber,
                  items: newOrder.items,
                  subtotal: newOrder.subtotal,
                  discount: newOrder.discount,
                  shipping: newOrder.shipping,
                  tax: newOrder.tax,
                  total: newOrder.total,
                  customer: newOrder.customer,
                  shippingAddress: newOrder.shippingAddress,
                  customerId: user?.id,
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              updateOrder(newOrder.id, {
                status: 'Verification Pending',
                verificationStatus: 'Pending',
                phoneVerified: false,
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

      // 1. Check synchronous storage first - if items exist, hydrate directly without incrementing
      const syncCart = loadCartFromStorageSync();
      if (syncCart.length > 0) {
        setCart(syncCart);
        setIsRecovering(false);
        setHasAttemptedRecovery(true);
        return;
      }

      // 2. Check asynchronous storage (IndexedDB)
      const asyncCart = await loadCartFromStorageAsync();
      if (asyncCart.length > 0) {
        setCart(asyncCart);
        setIsRecovering(false);
        setHasAttemptedRecovery(true);
        return;
      }

      // 3. Check URL search parameters (e.g. from "BUY NOW DIRECT" or "quick buy")
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
          const color = found.colors.find((c) => c.name.toLowerCase() === (paramColorName || '').toLowerCase()) || 
            (paramColorName ? { name: paramColorName, hex: paramColorHex || '#0a0a0a' } : found.colors[0]);
          const size = paramSize || found.sizes[2] || found.sizes[0] || 'L';
          setCartItem(found, size, color, isNaN(paramQty) ? 1 : paramQty);
          setIsRecovering(false);
          setHasAttemptedRecovery(true);
          return;
        }
      }

      // 4. Check last checkout item from sessionStorage / localStorage / IndexedDB
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
          setCartItem(found, lastCheckout.size, lastCheckout.color, lastCheckout.quantity || 1);
          setIsRecovering(false);
          setHasAttemptedRecovery(true);
          return;
        }
      }

      setIsRecovering(false);
      setHasAttemptedRecovery(true);
    };

    attemptRecovery();
  }, [isLoaded, cart.length, hasAttemptedRecovery, products, searchParams, setCart, setCartItem]);

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
        </div>

        {/* Free Shipping Alert if order value is less than threshold */}
        {amountNeededForFreeShipping > 0 && (
          <div className="mb-6 p-3 sm:p-3.5 bg-[#0c0c0c] border border-snake-green/30 rounded-lg flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5 text-neutral-300">
              <Truck size={15} className="text-snake-green shrink-0" />
              <span>
                Shop for <span className="text-white font-bold">{formatPrice(amountNeededForFreeShipping)}</span> more to get free shipping.
              </span>
            </div>
            <Link
              href="/shop"
              className="text-[10px] font-mono text-snake-green hover:underline uppercase tracking-wider shrink-0 ml-2 font-medium"
            >
              SHOP MORE →
            </Link>
          </div>
        )}

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
              {formatPrice(cartTotal + (cartTotal >= freeShippingThreshold ? 0 : 150))}
            </span>
          </button>

          {showMobileSummary && (
            <div className="p-4 border-t border-white/10 space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-white/5 pr-1">
                {cart.map((item) => {
                  const matched = products.find((p) => p.id === item.product?.id || p.slug === item.product?.slug);
                  const imgUrl = item.product?.images?.[0]?.url || matched?.images?.[0]?.url || '';
                  return (
                    <div key={item.id} className="pt-2.5 first:pt-0 flex gap-3 items-center">
                      <div className="relative w-12 h-14 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-white/5 flex items-center justify-center">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={item.product.name}
                            fill
                            sizes="50px"
                            unoptimized={Boolean(imgUrl.startsWith('data:') || imgUrl.startsWith('blob:'))}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-[9px] font-mono text-neutral-600 uppercase">SS</span>
                        )}
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
                  );
                })}
              </div>

              {/* Free Shipping Alert inside mobile summary */}
              {amountNeededForFreeShipping > 0 && (
                <div className="p-2.5 bg-neutral-950/90 border border-snake-green/30 rounded flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Truck size={13} className="text-snake-green shrink-0" />
                    <span>
                      Shop for <span className="text-white font-bold">{formatPrice(amountNeededForFreeShipping)}</span> more to get free shipping.
                    </span>
                  </div>
                  <Link
                    href="/shop"
                    className="text-[10px] font-mono text-snake-green hover:underline uppercase tracking-wider shrink-0 ml-2"
                  >
                    ADD ITEMS →
                  </Link>
                </div>
              )}

              <div className="space-y-2 pt-3 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL</span>
                  <span className="text-white">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>SHIPPING</span>
                  <span className={cartTotal >= freeShippingThreshold ? 'text-snake-green font-medium' : 'text-white'}>
                    {cartTotal >= freeShippingThreshold ? 'FREE' : formatPrice(150)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-white pt-2 border-t border-white/10">
                  <span>TOTAL DUE</span>
                  <span className="text-base text-white">
                    {formatPrice(cartTotal + (cartTotal >= freeShippingThreshold ? 0 : 150))}
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
            {/* Step 1: Contact & Account Detection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-mono tracking-widest text-white uppercase font-bold">
                      {user ? 'AUTHENTICATED PATRON' : 'PATRON IDENTIFICATION'}
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-500 mt-1">
                      {user
                        ? 'Your order will be linked to your verified patron profile.'
                        : 'Enter your email. Existing patrons sign in; new patrons verify email inline.'}
                    </p>
                  </div>
                  {user && (
                    <span className="px-2.5 py-1 bg-snake-green/10 border border-snake-green/40 text-snake-green text-[10px] font-mono uppercase tracking-wider font-semibold rounded flex items-center gap-1.5">
                      <CheckCircle2 size={12} />
                      VERIFIED
                    </span>
                  )}
                </div>

                {authError && (
                  <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* Case 1: Already Authenticated User */}
                {user ? (
                  <form onSubmit={handleNextStep} className="space-y-5">
                    <div className="p-4 bg-neutral-950 border border-white/10 rounded space-y-3 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 uppercase text-[10px]">PATRON ACCOUNT</span>
                        <span className="text-snake-green text-[10px] uppercase font-bold">ACTIVE SESSION</span>
                      </div>
                      <p className="text-white font-semibold text-sm">
                        {formData.fullName || profile?.fullName || user.user_metadata?.full_name || 'Patron'}
                      </p>
                      <p className="text-neutral-400 flex items-center gap-1.5">
                        <Lock size={12} className="text-snake-green" />
                        {user.email}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <label className="text-neutral-400 uppercase flex items-center justify-between">
                        <span>DELIVERY CONTACT NUMBER *</span>
                        <span className="text-[10px] text-neutral-500 font-mono">10 DIGITS (SMS UPDATES)</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        maxLength={15}
                        className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green font-mono"
                      />
                      <p className="text-[10px] font-mono text-neutral-500">
                        Mandatory for courier tracking. No phone OTP required before prepaid order.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      CONTINUE TO DELIVERY ADDRESS <ArrowRight size={14} />
                    </button>
                  </form>
                ) : (
                  /* Case 2: Unauthenticated Customer - Progressive Low-Friction Flow */
                  <div className="space-y-6">
                    {/* Google Authentication */}
                    <button
                      type="button"
                      onClick={handleGoogleCheckoutAuth}
                      disabled={isGoogleProcessing || isAuthProcessing}
                      className="w-full bg-[#121212] hover:bg-white hover:text-black border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-3 group active:scale-[0.99] disabled:opacity-50"
                    >
                      {isGoogleProcessing ? (
                        <span className="inline-block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>CONTINUE WITH GOOGLE</span>
                        </>
                      )}
                    </button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-mono">
                        <span className="bg-[#0c0c0c] px-3 text-neutral-500">OR CONTINUE WITH EMAIL</span>
                      </div>
                    </div>

                    {/* Sub-case 2A: Enter Email */}
                    {authFlow === 'enter_email' && (
                      <form onSubmit={handleCheckEmail} className="space-y-4">
                        <div className="space-y-1.5 text-xs font-mono">
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
                          <p className="text-[10px] font-mono text-neutral-500">
                            We will send a secure 6-digit login code. No password required.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={isAuthProcessing || !formData.email}
                          className="w-full min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAuthProcessing ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              SENDING CODE...
                            </>
                          ) : (
                            <>
                              CONTINUE WITH EMAIL <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Sub-case 2B: Email OTP Verification (Passwordless) */}
                    {authFlow === 'verify_otp' && (
                      <form onSubmit={handleVerifyOtpInline} className="space-y-5 animate-fadeIn">
                        <div className="p-3.5 bg-neutral-950 border border-white/10 rounded flex justify-between items-center text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-snake-green uppercase font-bold block">
                              VERIFYING PATRON
                            </span>
                            <span className="text-white font-semibold">{formData.email}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthFlow('enter_email');
                              setAuthError(null);
                              setAuthSuccess(null);
                              setAuthOtp('');
                            }}
                            className="text-[10px] font-mono text-snake-green hover:underline uppercase"
                          >
                            CHANGE EMAIL
                          </button>
                        </div>

                        <div className="space-y-1.5 text-xs font-mono">
                          <label className="text-neutral-400 uppercase">6-DIGIT VERIFICATION CODE *</label>
                          <input
                            type="text"
                            value={authOtp}
                            onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            placeholder="123456"
                            maxLength={6}
                            autoFocus
                            className="w-full min-h-[48px] bg-black border border-white/20 text-center tracking-[0.5em] text-xl font-mono text-white rounded focus:outline-none focus:border-snake-green"
                          />
                          <p className="text-[10px] font-mono text-neutral-500">
                            Enter the 6-digit code sent to your email to continue.
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                          {hasPasswordAccount ? (
                            <button
                              type="button"
                              onClick={() => {
                                setAuthFlow('existing_password');
                                setAuthError(null);
                              }}
                              className="text-neutral-400 hover:text-white underline text-[11px]"
                            >
                              Sign in with Password instead
                            </button>
                          ) : (
                            <span />
                          )}

                          {otpCooldown > 0 ? (
                            <span className="text-[11px] text-neutral-500">Resend in {otpCooldown}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResendInlineOtp}
                              className="text-snake-green hover:underline text-[11px] uppercase font-semibold"
                            >
                              Resend Code
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isAuthProcessing || authOtp.length !== 6}
                          className="w-full min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAuthProcessing ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              VERIFYING...
                            </>
                          ) : (
                            <>
                              VERIFY &amp; CONTINUE <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Sub-case 2C: Password Option for Returning Patrons */}
                    {authFlow === 'existing_password' && (
                      <form onSubmit={handleExistingPasswordLogin} className="space-y-5 animate-fadeIn">
                        <div className="p-3.5 bg-neutral-950 border border-white/10 rounded flex justify-between items-center text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-neutral-500 uppercase block">PATRON EMAIL</span>
                            <span className="text-white font-semibold">{formData.email}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthFlow('enter_email');
                              setAuthError(null);
                              setAuthSuccess(null);
                            }}
                            className="text-[10px] font-mono text-snake-green hover:underline uppercase"
                          >
                            CHANGE EMAIL
                          </button>
                        </div>

                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between items-center">
                            <label className="text-neutral-400 uppercase">PASSWORD *</label>
                            <Link
                              href="/forgot-password"
                              className="text-[10px] font-mono text-neutral-400 hover:text-snake-green uppercase"
                            >
                              FORGOT?
                            </Link>
                          </div>
                          <input
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            required
                            placeholder="••••••••••••"
                            className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthFlow('verify_otp');
                              setAuthError(null);
                            }}
                            className="text-neutral-400 hover:text-white underline text-[11px]"
                          >
                            Sign in with Email OTP instead
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={isAuthProcessing || !authPassword}
                          className="w-full min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAuthProcessing ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              SIGNING IN...
                            </>
                          ) : (
                            <>
                              SIGN IN &amp; CONTINUE <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Delivery & Payment */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-mono tracking-widest text-white uppercase font-bold">
                      DELIVERY ADDRESS &amp; CONTACT
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
                    CHANGE ACCOUNT
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
                    <label className="text-neutral-400 uppercase flex items-center justify-between">
                      <span>DELIVERY CONTACT NUMBER *</span>
                      <span className="text-[10px] text-neutral-500 font-mono">10 DIGITS (SMS UPDATES)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={15}
                      className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green font-mono"
                    />
                    <p className="text-[10px] font-mono text-neutral-500">
                      Required for dispatch notifications. No phone OTP required.
                    </p>
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
              {cart.map((item) => {
                const matched = products.find((p) => p.id === item.product?.id || p.slug === item.product?.slug);
                const imgUrl = item.product?.images?.[0]?.url || matched?.images?.[0]?.url || '';
                return (
                  <div key={item.id} className="pt-3 first:pt-0 flex gap-3.5 items-center">
                    <div className="relative w-14 h-16 bg-neutral-900 rounded overflow-hidden flex-shrink-0 border border-white/5 flex items-center justify-center">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={item.product.name}
                          fill
                          sizes="60px"
                          unoptimized={Boolean(imgUrl.startsWith('data:') || imgUrl.startsWith('blob:'))}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-[9px] font-mono text-neutral-600 uppercase">SS</span>
                      )}
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
                );
              })}
            </div>

            {/* Free Shipping Alert in Desktop Order Summary */}
            {amountNeededForFreeShipping > 0 && (
              <div className="p-3 bg-neutral-950/90 border border-snake-green/30 rounded flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Truck size={14} className="text-snake-green shrink-0" />
                  <span>
                    Shop for <span className="text-white font-bold">{formatPrice(amountNeededForFreeShipping)}</span> more to get free shipping.
                  </span>
                </div>
                <Link
                  href="/shop"
                  className="text-[10px] font-mono text-snake-green hover:underline uppercase tracking-wider shrink-0 ml-2 font-medium"
                >
                  ADD ITEMS →
                </Link>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>SUBTOTAL</span>
                <span className="text-white">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>SHIPPING</span>
                <span className={cartTotal >= freeShippingThreshold ? 'text-snake-green font-medium' : 'text-white'}>
                  {cartTotal >= freeShippingThreshold ? 'FREE' : formatPrice(150)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-white pt-3 border-t border-white/10">
                <span>TOTAL DUE</span>
                <span className="text-base text-white">
                  {formatPrice(cartTotal + (cartTotal >= freeShippingThreshold ? 0 : 150))}
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
