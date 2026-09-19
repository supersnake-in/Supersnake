'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  EyeOff,
  Check,
  Plus,
  Home,
  Briefcase,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, BRAND } from '@/lib/design-tokens';
import { loadLastCheckout, loadCartFromStorageAsync, loadCartFromStorageSync } from '@/lib/storage-helper';
import { fetchProductsFromSupabase } from '@/lib/supabase/db';
import {
  normalizePhoneNumber,
  isValidPhoneNumber,
  formatPhoneDisplay,
  maskPhoneNumber,
} from '@/lib/phone-utils';
import { Address, Size } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

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
  const { cart, cartTotal, createOrder, updateOrder, clearCart, isLoaded, products, setCart, setCartItem } = useStore();
  const {
    user,
    profile,
    signIn,
    signUp,
    signInWithGoogle,
    checkEmailExists,
    sendPhoneOtp,
    verifyPhoneOtp,
    sendEmailOtp,
    verifyEmailOtp,
    resetPassword,
  } = useAuth();

  // Progress steps: 1 = Contact & Verification, 2 = Delivery & Payment
  const [step, setStep] = useState<1 | 2>(1);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Unauthenticated Contact Form State
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactError, setContactError] = useState<string | null>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  // Inline Checkout Flow State: 'initial' | 'existing_password' | 'existing_email_otp' | 'new_verify_email' | 'new_verify_phone' | 'new_create_account'
  const [authFlowState, setAuthFlowState] = useState<
    'initial' | 'existing_password' | 'existing_email_otp' | 'new_verify_email' | 'new_verify_phone' | 'new_create_account'
  >('initial');

  // Existing Customer Authentication State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // OTP Verification States (6-digit)
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0);
  const [phoneOtpCooldown, setPhoneOtpCooldown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // New Customer Account Creation State
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Saved Addresses for Logged-In User
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Delivery Address Form State
  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    postOffice: '',
    label: 'Home',
    country: 'India',
  });

  const [postOffices, setPostOffices] = useState<Array<{ name: string; branchType?: string; deliveryStatus?: string }>>([]);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // OTP Input Refs
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timers
  useEffect(() => {
    if (emailOtpCooldown <= 0) return;
    const timer = setInterval(() => setEmailOtpCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [emailOtpCooldown]);

  useEffect(() => {
    if (phoneOtpCooldown <= 0) return;
    const timer = setInterval(() => setPhoneOtpCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [phoneOtpCooldown]);

  // Load profile data into form if authenticated
  useEffect(() => {
    if (user || profile) {
      const email = profile?.email || user?.email || '';
      const phone = profile?.phone || '';
      const name = profile?.fullName || '';

      if (email && !contactEmail) setContactEmail(email);
      if (phone && !contactPhone) setContactPhone(phone);
      if (name && !addressData.fullName) {
        setAddressData((prev) => ({
          ...prev,
          fullName: name,
          phone: phone || prev.phone,
        }));
      }

      if (profile?.phone_verified || profile?.isPhoneVerified) {
        setPhoneVerified(true);
      }
    }
  }, [user, profile, contactEmail, contactPhone, addressData.fullName]);

  // Fetch saved addresses from Supabase when user is authenticated
  useEffect(() => {
    async function loadAddresses() {
      if (!user?.id) return;
      setIsLoadingAddresses(true);
      try {
        const res = await fetch(`/api/addresses?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.addresses) && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: any) => a.is_default) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id || null);
            setAddressData({
              fullName: defaultAddr.full_name || defaultAddr.fullName,
              phone: defaultAddr.phone,
              street: defaultAddr.street,
              landmark: defaultAddr.landmark || '',
              city: defaultAddr.city,
              state: defaultAddr.state,
              postalCode: defaultAddr.postal_code || defaultAddr.postalCode,
              postOffice: defaultAddr.postOffice || '',
              label: defaultAddr.label || 'Home',
              country: defaultAddr.country || 'India',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load saved addresses:', err);
      } finally {
        setIsLoadingAddresses(false);
      }
    }

    if (user?.id) {
      loadAddresses();
    }
  }, [user?.id]);

  // PIN code lookup logic
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
        if (res.ok) data = await res.json();
      } catch (err) {}

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

        const sortedPOs = [...poList].sort((a: any, b: any) => {
          if (a.deliveryStatus === 'Delivery' && b.deliveryStatus !== 'Delivery') return -1;
          if (a.deliveryStatus !== 'Delivery' && b.deliveryStatus === 'Delivery') return 1;
          return a.name.localeCompare(b.name);
        });

        setPostOffices(sortedPOs);
        setAddressData((prev) => {
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
          setPincodeMessage(`${poList.length} post offices found in this PIN code.`);
        } else {
          setPincodeMessage(null);
        }
      } else {
        setPostOffices([]);
        setPincodeMessage('PIN code not found. Please enter City and State manually.');
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
    setAddressData((prev) => ({ ...prev, postalCode: val }));
    if (val.length === 6) {
      lookupPincode(val);
    } else {
      if (postOffices.length > 0) setPostOffices([]);
      if (pincodeMessage) setPincodeMessage(null);
    }
  };

  // Google OAuth button from Checkout
  const handleGoogleCheckout = async () => {
    setContactError(null);
    const res = await signInWithGoogle('/checkout');
    if (res.error) setContactError(res.error);
  };

  // Step 1: Initial "CONTINUE TO DELIVERY" Click
  const handleContactContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    // If customer is already authenticated
    if (user) {
      const isPhoneVer = Boolean(profile?.phone_verified || profile?.isPhoneVerified);
      if (!isPhoneVer) {
        // Prompt for Twilio Phone OTP inline
        setAuthFlowState('new_verify_phone');
        handleSendTwilioOtp();
        return;
      }
      // Proceed to Step 2
      setStep(2);
      return;
    }

    // Validate inputs
    const cleanEmail = contactEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setContactError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = normalizePhoneNumber(contactPhone);
    if (!cleanPhone || !isValidPhoneNumber(cleanPhone)) {
      setContactError('Please enter a valid phone number with country code (e.g. +91 98765 43210).');
      return;
    }

    setIsCheckingAccount(true);
    const { exists, error: lookupErr } = await checkEmailExists(cleanEmail);
    setIsCheckingAccount(false);

    if (lookupErr) {
      setContactError(lookupErr);
      return;
    }

    if (exists) {
      // Existing customer detected -> show inline password / email OTP options
      setAuthFlowState('existing_password');
    } else {
      // New customer -> start inline email & phone verification
      setAuthFlowState('new_verify_email');
      await sendEmailOtp(cleanEmail);
      setEmailOtpCooldown(60);
    }
  };

  // Existing Customer: Password Login Inline
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);
    setIsAuthenticating(true);

    const res = await signIn(contactEmail.trim().toLowerCase(), password);
    setIsAuthenticating(false);

    if (res.error) {
      setContactError(res.error.includes('credentials') ? 'Incorrect password. Try again or use Email OTP.' : res.error);
      return;
    }

    // Authentication succeeded!
    setAuthFlowState('initial');
    // If phone unverified, prompt phone OTP; otherwise advance to delivery
    setTimeout(() => {
      setStep(2);
    }, 400);
  };

  // Existing Customer: Switch to Email OTP
  const handleSwitchToEmailOtp = async () => {
    setContactError(null);
    setAuthFlowState('existing_email_otp');
    await sendEmailOtp(contactEmail.trim().toLowerCase());
    setEmailOtpCooldown(60);
  };

  // Existing Customer: Forgot Password
  const handleForgotPassword = async () => {
    setContactError(null);
    const res = await resetPassword(contactEmail.trim().toLowerCase());
    if (res.error) {
      setContactError(res.error);
    } else {
      setForgotPasswordSent(true);
      setTimeout(() => setForgotPasswordSent(false), 8000);
    }
  };

  // OTP Handling (Digit by digit input)
  const handleOtpChange = (
    val: string,
    idx: number,
    type: 'email' | 'phone'
  ) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const arr = type === 'email' ? [...emailOtp] : [...phoneOtp];
    arr[idx] = digit;

    if (type === 'email') {
      setEmailOtp(arr);
      if (digit && idx < 5) emailInputRefs.current[idx + 1]?.focus();
      if (arr.every((d) => d.length === 1)) {
        handleVerifyEmailOtpCode(arr.join(''));
      }
    } else {
      setPhoneOtp(arr);
      if (digit && idx < 5) phoneInputRefs.current[idx + 1]?.focus();
      if (arr.every((d) => d.length === 1)) {
        handleVerifyPhoneOtpCode(arr.join(''));
      }
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
    type: 'email' | 'phone'
  ) => {
    if (e.key === 'Backspace') {
      const arr = type === 'email' ? [...emailOtp] : [...phoneOtp];
      if (!arr[idx] && idx > 0) {
        if (type === 'email') emailInputRefs.current[idx - 1]?.focus();
        else phoneInputRefs.current[idx - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>, type: 'email' | 'phone') => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const arr = pasted.split('');
    while (arr.length < 6) arr.push('');

    if (type === 'email') {
      setEmailOtp(arr);
      if (pasted.length === 6) handleVerifyEmailOtpCode(pasted);
    } else {
      setPhoneOtp(arr);
      if (pasted.length === 6) handleVerifyPhoneOtpCode(pasted);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtpCode = async (codeString?: string) => {
    const code = codeString || emailOtp.join('');
    if (code.length !== 6) {
      setContactError('Please enter all 6 digits of the email verification code.');
      return;
    }

    setContactError(null);
    setIsVerifyingEmail(true);

    const res = await verifyEmailOtp(contactEmail.trim().toLowerCase(), code);
    setIsVerifyingEmail(false);

    if (res.error) {
      setContactError(res.error.includes('expired') ? 'Verification code has expired. Please request a new one.' : 'Incorrect email verification code.');
      return;
    }

    setEmailVerified(true);

    // If existing customer logging in via email OTP, check phone verification status
    if (authFlowState === 'existing_email_otp') {
      setAuthFlowState('initial');
      setStep(2);
      return;
    }

    // For new customer, advance to Phone verification
    setAuthFlowState('new_verify_phone');
    handleSendTwilioOtp();
  };

  // Send Twilio Phone OTP
  const handleSendTwilioOtp = async () => {
    setContactError(null);
    setIsSendingPhoneOtp(true);
    const normalized = normalizePhoneNumber(contactPhone);
    const res = await sendPhoneOtp(normalized);
    setIsSendingPhoneOtp(false);

    if (res.error) {
      setContactError(res.error);
    } else {
      setPhoneOtpCooldown(60);
    }
  };

  // Verify Twilio Phone OTP
  const handleVerifyPhoneOtpCode = async (codeString?: string) => {
    const code = codeString || phoneOtp.join('');
    if (code.length !== 6) {
      setContactError('Please enter all 6 digits of the SMS verification code.');
      return;
    }

    setContactError(null);
    setIsVerifyingPhone(true);
    const normalized = normalizePhoneNumber(contactPhone);
    const res = await verifyPhoneOtp(normalized, code);
    setIsVerifyingPhone(false);

    if (res.error) {
      setContactError(res.error);
      return;
    }

    setPhoneVerified(true);

    // If user was already logged in (fixing unverified phone), advance to delivery
    if (user) {
      setAuthFlowState('initial');
      setStep(2);
      return;
    }

    // New customer: advance to account creation (password & delivery address)
    setAuthFlowState('new_create_account');
  };

  // New Customer: Create Account & Continue to Delivery
  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    if (!newFullName.trim()) {
      setContactError('Please enter your full recipient name.');
      return;
    }

    if (newPassword.length < 8) {
      setContactError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== newConfirmPassword) {
      setContactError('Passwords do not match. Please verify.');
      return;
    }

    if (!addressData.street || !addressData.city || !addressData.postalCode) {
      setContactError('Please complete your delivery address details.');
      return;
    }

    setIsCreatingAccount(true);
    const cleanEmail = contactEmail.trim().toLowerCase();
    const cleanPhone = normalizePhoneNumber(contactPhone);

    const signupRes = await signUp(cleanEmail, newPassword, newFullName.trim(), cleanPhone);
    if (signupRes.error) {
      setIsCreatingAccount(false);
      setContactError(signupRes.error);
      return;
    }

    // Save initial address in public.addresses
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.user.id,
            label: addressData.label || 'Home',
            fullName: newFullName.trim(),
            phone: cleanPhone,
            street: addressData.street,
            landmark: addressData.landmark,
            city: addressData.city,
            state: addressData.state || 'Karnataka',
            postalCode: addressData.postalCode,
            country: 'India',
            isDefault: true,
          }),
        });
      }
    } catch (e) {}

    setIsCreatingAccount(false);
    setAuthFlowState('initial');
    setStep(2);
  };

  // Step 2: Handle Complete Payment via Razorpay
  const handleCompletePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    const totalOrderAmount = cartTotal + (cartTotal >= BRAND.freeShippingThreshold ? 0 : 150);
    const amountInPaise = Math.round(totalOrderAmount * 100);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error(
          'Could not load Razorpay payment gateway. Please check your connection or disable ad-blockers and try again.'
        );
      }

      // Create internal order record in store
      const newOrder = createOrder({
        userId: user?.id || undefined,
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
          name: addressData.fullName || profile?.fullName || 'Patron',
          email: contactEmail || profile?.email || user?.email || '',
          phone: contactPhone || profile?.phone || '',
        },
        shippingAddress: {
          fullName: addressData.fullName,
          phone: addressData.phone,
          street: addressData.street,
          landmark: addressData.landmark,
          city: addressData.city,
          state: addressData.state || 'Karnataka',
          postalCode: addressData.postalCode,
          postOffice: addressData.postOffice || undefined,
          country: 'India',
        },
        payment: {
          method: 'razorpay',
          transactionId: '',
          status: 'pending',
          paidAt: '',
        },
      });

      // Call backend to create Razorpay Order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          customer: {
            name: addressData.fullName,
            email: contactEmail,
            phone: contactPhone,
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

      // Open Razorpay Standard Checkout
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TdtCpOjDeqd3Mg',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SuperSnake',
        description: `Order #${newOrder.orderNumber}`,
        order_id: orderData.order_id,
        prefill: {
          name: addressData.fullName,
          email: contactEmail,
          contact: contactPhone,
        },
        theme: {
          color: '#04fc21',
          backdrop_color: 'rgba(0, 0, 0, 0.85)',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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

  // Cart Recovery Handler
  const [isRecovering, setIsRecovering] = useState(false);
  const [hasAttemptedRecovery, setHasAttemptedRecovery] = useState(false);

  useEffect(() => {
    if (!isLoaded || cart.length > 0 || hasAttemptedRecovery) return;

    const attemptRecovery = async () => {
      setIsRecovering(true);

      const syncCart = loadCartFromStorageSync();
      if (syncCart.length > 0) {
        setCart(syncCart);
        setIsRecovering(false);
        setHasAttemptedRecovery(true);
        return;
      }

      const asyncCart = await loadCartFromStorageAsync();
      if (asyncCart.length > 0) {
        setCart(asyncCart);
        setIsRecovering(false);
        setHasAttemptedRecovery(true);
        return;
      }

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
            if (fetched) found = fetched.find((p) => p.slug === paramSlug || p.id === paramProductId);
          } catch (e) {}
        }

        if (found) {
          const color =
            found.colors.find((c) => c.name.toLowerCase() === (paramColorName || '').toLowerCase()) ||
            (paramColorName ? { name: paramColorName, hex: paramColorHex || '#0a0a0a' } : found.colors[0]);
          const size = paramSize || found.sizes[2] || found.sizes[0] || 'L';
          setCartItem(found, size, color, isNaN(paramQty) ? 1 : paramQty);
          setIsRecovering(false);
          setHasAttemptedRecovery(true);
          return;
        }
      }

      const lastCheckout = loadLastCheckout();
      if (lastCheckout && (lastCheckout.slug || lastCheckout.productId)) {
        let found = products.find((p) => p.slug === lastCheckout.slug || p.id === lastCheckout.productId) || lastCheckout.product;
        if (!found) {
          try {
            const fetched = await fetchProductsFromSupabase();
            if (fetched) found = fetched.find((p) => p.slug === lastCheckout.slug || p.id === lastCheckout.productId);
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
          className="px-8 py-3.5 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white transition-colors"
        >
          SHOP T-SHIRTS
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen pt-28 pb-24 px-4 sm:px-6 md:px-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
        <div className="lg:hidden mb-6 bg-[#0c0c0c] border border-white/10 rounded overflow-hidden">
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
            01. CONTACT &amp; VERIFICATION
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
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-white/10 rounded p-5 sm:p-8 space-y-8">
            {/* Global Error Banner */}
            {contactError && (
              <div className="p-3.5 bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono flex items-start gap-2 rounded">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{contactError}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 1: CONTACT & INLINE AUTH / VERIFICATION              */}
            {/* ========================================================= */}
            {step === 1 && (
              <div className="space-y-6">
                {/* 1. Logged In Customer State */}
                {user ? (
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
                          AUTHENTICATED PATRON
                        </span>
                        <h3 className="text-base font-display font-medium text-white">
                          {profile?.fullName?.toUpperCase() || 'REGISTERED PATRON'}
                        </h3>
                        <p className="text-xs font-mono text-neutral-400">{profile?.email || user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-snake-green bg-snake-green/10 border border-snake-green/30 px-2 py-0.5 rounded">
                          <Check size={12} />
                          SESSION ACTIVE
                        </span>
                      </div>
                    </div>

                    {/* Phone verification check for logged in user */}
                    <div className="p-4 bg-[#111] border border-white/10 rounded space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-neutral-400 uppercase">MOBILE PHONE NUMBER</span>
                        {phoneVerified || profile?.phone_verified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-snake-green font-semibold">
                            <Check size={12} /> VERIFIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400">
                            UNVERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-mono text-white">
                        {formatPhoneDisplay(profile?.phone || contactPhone) || 'Not provided'}
                      </p>

                      {/* If unverified, prompt inline Twilio SMS OTP */}
                      {(!phoneVerified && !profile?.phone_verified) && (
                        <div className="pt-2 border-t border-white/10 space-y-3">
                          <p className="text-xs font-mono text-neutral-400">
                            Please verify your phone number via SMS to complete your order.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSendTwilioOtp}
                              disabled={isSendingPhoneOtp || phoneOtpCooldown > 0}
                              className="px-4 py-2 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase font-semibold disabled:opacity-50 transition-colors"
                            >
                              {isSendingPhoneOtp
                                ? 'SENDING...'
                                : phoneOtpCooldown > 0
                                ? `RESEND IN ${phoneOtpCooldown}S`
                                : 'SEND SMS OTP'}
                            </button>
                          </div>

                          {/* OTP Input */}
                          <div className="space-y-2 pt-2">
                            <label className="text-[10px] font-mono uppercase text-neutral-400">
                              ENTER 6-DIGIT SMS CODE
                            </label>
                            <div className="flex gap-2">
                              {phoneOtp.map((digit, idx) => (
                                <input
                                  key={idx}
                                  ref={(el) => {
                                    phoneInputRefs.current[idx] = el;
                                  }}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(e.target.value, idx, 'phone')}
                                  onKeyDown={(e) => handleOtpKeyDown(e, idx, 'phone')}
                                  onPaste={(e) => handleOtpPaste(e, 'phone')}
                                  className="w-10 h-12 bg-black border border-white/20 text-center font-mono text-lg text-white focus:outline-none focus:border-snake-green rounded"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      CONTINUE TO DELIVERY <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  /* 2. Unauthenticated Flow */
                  <div className="space-y-6">
                    {/* Google OAuth Option */}
                    {authFlowState === 'initial' && (
                      <>
                        <button
                          type="button"
                          onClick={handleGoogleCheckout}
                          className="w-full bg-[#121212] hover:bg-white hover:text-black border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-widest py-3.5 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.99]"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span>CONTINUE WITH GOOGLE</span>
                        </button>

                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                          </div>
                          <div className="relative flex justify-center text-[10px] uppercase font-mono">
                            <span className="bg-[#0c0c0c] px-3 text-neutral-500">OR ENTER DETAILS</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Initial Contact Inputs */}
                    {authFlowState === 'initial' && (
                      <form onSubmit={handleContactContinue} className="space-y-4 text-xs font-mono">
                        <div className="space-y-1.5">
                          <label className="text-neutral-400 uppercase">EMAIL ADDRESS *</label>
                          <input
                            type="email"
                            required
                            autoComplete="email"
                            inputMode="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="e.g. aditya@example.com"
                            className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-neutral-400 uppercase">PHONE NUMBER (FOR SMS TRACKING) *</label>
                          <input
                            type="tel"
                            required
                            autoComplete="tel"
                            inputMode="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isCheckingAccount}
                          className="w-full min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                        >
                          {isCheckingAccount ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              VERIFYING ACCOUNT...
                            </>
                          ) : (
                            <>
                              CONTINUE TO DELIVERY <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* CASE A: Existing Customer Password Login Inline */}
                    {authFlowState === 'existing_password' && (
                      <div className="space-y-5 bg-[#111] p-5 sm:p-6 border border-white/15 rounded">
                        <div className="border-b border-white/10 pb-3">
                          <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
                            WELCOME BACK
                          </span>
                          <h4 className="text-lg font-display font-medium text-white">
                            SIGN IN TO YOUR ACCOUNT
                          </h4>
                          <p className="text-xs font-mono text-neutral-400 mt-1">
                            We found an existing SuperSnake account for <span className="text-white">{contactEmail}</span>.
                          </p>
                        </div>

                        {forgotPasswordSent && (
                          <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono">
                            Password reset link sent to your email.
                          </div>
                        )}

                        <form onSubmit={handlePasswordLogin} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-neutral-400 text-xs font-mono uppercase">PASSWORD</label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-sm font-mono text-white rounded focus:outline-none focus:border-snake-green pr-11"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isAuthenticating}
                            className="w-full py-3.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isAuthenticating ? 'AUTHENTICATING...' : 'CONTINUE'}
                          </button>
                        </form>

                        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2 text-[11px] font-mono text-neutral-400 border-t border-white/10">
                          <button
                            type="button"
                            onClick={handleSwitchToEmailOtp}
                            className="text-snake-green hover:underline text-left"
                          >
                            USE EMAIL OTP INSTEAD →
                          </button>
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="hover:text-white text-left"
                          >
                            Forgot Password?
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setAuthFlowState('initial')}
                          className="text-[10px] font-mono text-neutral-500 hover:text-white underline block"
                        >
                          Use a different email address
                        </button>
                      </div>
                    )}

                    {/* CASE B: Existing Customer Email OTP Login Inline */}
                    {authFlowState === 'existing_email_otp' && (
                      <div className="space-y-5 bg-[#111] p-5 sm:p-6 border border-white/15 rounded">
                        <div className="border-b border-white/10 pb-3">
                          <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
                            VERIFY YOUR EMAIL
                          </span>
                          <h4 className="text-lg font-display font-medium text-white">
                            ENTER 6-DIGIT CODE
                          </h4>
                          <p className="text-xs font-mono text-neutral-400 mt-1">
                            We've sent a 6-digit confirmation code to <span className="text-white">{contactEmail}</span>.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex gap-2 justify-center py-2">
                            {emailOtp.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => {
                                  emailInputRefs.current[idx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target.value, idx, 'email')}
                                onKeyDown={(e) => handleOtpKeyDown(e, idx, 'email')}
                                onPaste={(e) => handleOtpPaste(e, 'email')}
                                className="w-11 h-14 bg-black border border-white/20 text-center font-mono text-xl text-white focus:outline-none focus:border-snake-green rounded"
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleVerifyEmailOtpCode()}
                            disabled={isVerifyingEmail || emailOtp.some((d) => !d)}
                            className="w-full py-3.5 bg-snake-green text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                          >
                            {isVerifyingEmail ? 'VERIFYING...' : 'VERIFY EMAIL'}
                          </button>

                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-2 border-t border-white/10">
                            <span>Didn't receive it?</span>
                            <button
                              type="button"
                              onClick={() => {
                                sendEmailOtp(contactEmail);
                                setEmailOtpCooldown(60);
                              }}
                              disabled={emailOtpCooldown > 0}
                              className="text-snake-green hover:underline disabled:opacity-50"
                            >
                              {emailOtpCooldown > 0 ? `RESEND IN ${emailOtpCooldown}S` : 'RESEND CODE'}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setAuthFlowState('existing_password')}
                            className="text-[10px] font-mono text-neutral-500 hover:text-white underline block"
                          >
                            Use password instead
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CASE C: New Customer Email Verification */}
                    {authFlowState === 'new_verify_email' && (
                      <div className="space-y-5 bg-[#111] p-5 sm:p-6 border border-white/15 rounded">
                        <div className="border-b border-white/10 pb-3">
                          <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
                            STEP 1 OF 3 • EMAIL VERIFICATION
                          </span>
                          <h4 className="text-lg font-display font-medium text-white">
                            VERIFY YOUR EMAIL ADDRESS
                          </h4>
                          <p className="text-xs font-mono text-neutral-400 mt-1">
                            We've sent a 6-digit confirmation code to <span className="text-white">{contactEmail}</span>.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex gap-2 justify-center py-2">
                            {emailOtp.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => {
                                  emailInputRefs.current[idx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target.value, idx, 'email')}
                                onKeyDown={(e) => handleOtpKeyDown(e, idx, 'email')}
                                onPaste={(e) => handleOtpPaste(e, 'email')}
                                className="w-11 h-14 bg-black border border-white/20 text-center font-mono text-xl text-white focus:outline-none focus:border-snake-green rounded"
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleVerifyEmailOtpCode()}
                            disabled={isVerifyingEmail || emailOtp.some((d) => !d)}
                            className="w-full py-3.5 bg-snake-green text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                          >
                            {isVerifyingEmail ? 'VERIFYING...' : 'VERIFY EMAIL'}
                          </button>

                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-2 border-t border-white/10">
                            <span>Didn't receive it?</span>
                            <button
                              type="button"
                              onClick={() => {
                                sendEmailOtp(contactEmail);
                                setEmailOtpCooldown(60);
                              }}
                              disabled={emailOtpCooldown > 0}
                              className="text-snake-green hover:underline disabled:opacity-50"
                            >
                              {emailOtpCooldown > 0 ? `RESEND IN ${emailOtpCooldown}S` : 'RESEND CODE'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CASE D: New Customer Phone Verification */}
                    {authFlowState === 'new_verify_phone' && (
                      <div className="space-y-5 bg-[#111] p-5 sm:p-6 border border-white/15 rounded">
                        <div className="border-b border-white/10 pb-3">
                          <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
                            STEP 2 OF 3 • PHONE VERIFICATION
                          </span>
                          <h4 className="text-lg font-display font-medium text-white">
                            VERIFY YOUR MOBILE NUMBER
                          </h4>
                          <p className="text-xs font-mono text-neutral-400 mt-1">
                            We've sent a 6-digit SMS verification code to{' '}
                            <span className="text-white">{maskPhoneNumber(contactPhone)}</span>.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex gap-2 justify-center py-2">
                            {phoneOtp.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => {
                                  phoneInputRefs.current[idx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target.value, idx, 'phone')}
                                onKeyDown={(e) => handleOtpKeyDown(e, idx, 'phone')}
                                onPaste={(e) => handleOtpPaste(e, 'phone')}
                                className="w-11 h-14 bg-black border border-white/20 text-center font-mono text-xl text-white focus:outline-none focus:border-snake-green rounded"
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleVerifyPhoneOtpCode()}
                            disabled={isVerifyingPhone || phoneOtp.some((d) => !d)}
                            className="w-full py-3.5 bg-snake-green text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                          >
                            {isVerifyingPhone ? 'VERIFYING...' : 'VERIFY PHONE'}
                          </button>

                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-2 border-t border-white/10">
                            <span>Didn't receive code?</span>
                            <button
                              type="button"
                              onClick={handleSendTwilioOtp}
                              disabled={phoneOtpCooldown > 0 || isSendingPhoneOtp}
                              className="text-snake-green hover:underline disabled:opacity-50"
                            >
                              {phoneOtpCooldown > 0 ? `RESEND IN ${phoneOtpCooldown}S` : 'RESEND SMS'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CASE E: New Customer Account Creation & Delivery Address */}
                    {authFlowState === 'new_create_account' && (
                      <form onSubmit={handleCreateAccountSubmit} className="space-y-6">
                        <div className="border-b border-white/10 pb-3">
                          <span className="text-[10px] font-mono text-snake-green uppercase tracking-widest">
                            STEP 3 OF 3 • ACCOUNT CREATION &amp; DELIVERY
                          </span>
                          <h4 className="text-lg font-display font-medium text-white">
                            CREATE YOUR SUPERSNAKE ACCOUNT
                          </h4>
                          <p className="text-xs font-mono text-neutral-400 mt-1">
                            Set your patron password and delivery destination to complete checkout.
                          </p>
                        </div>

                        {/* Verified badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 bg-black border border-snake-green/40 rounded flex items-center justify-between">
                            <span className="text-neutral-400">EMAIL</span>
                            <span className="text-snake-green font-semibold flex items-center gap-1">
                              <Check size={12} /> {contactEmail}
                            </span>
                          </div>
                          <div className="p-3 bg-black border border-snake-green/40 rounded flex items-center justify-between">
                            <span className="text-neutral-400">PHONE</span>
                            <span className="text-snake-green font-semibold flex items-center gap-1">
                              <Check size={12} /> {formatPhoneDisplay(contactPhone)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs font-mono">
                          <div>
                            <label className="text-neutral-400 uppercase block mb-1">FULL LEGAL NAME *</label>
                            <input
                              type="text"
                              required
                              value={newFullName}
                              onChange={(e) => setNewFullName(e.target.value)}
                              placeholder="Aditya Sharma"
                              className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-white rounded focus:outline-none focus:border-snake-green"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-neutral-400 uppercase block mb-1">PASSWORD *</label>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? 'text' : 'password'}
                                  required
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="Min. 8 characters"
                                  className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-white rounded focus:outline-none focus:border-snake-green pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                                >
                                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-neutral-400 uppercase block mb-1">CONFIRM PASSWORD *</label>
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                required
                                value={newConfirmPassword}
                                onChange={(e) => setNewConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-white rounded focus:outline-none focus:border-snake-green"
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 space-y-4">
                            <h5 className="text-xs font-mono text-neutral-300 uppercase tracking-wider font-semibold">
                              DELIVERY DESTINATION
                            </h5>

                            <div>
                              <label className="text-neutral-400 uppercase block mb-1">STREET ADDRESS &amp; FLAT *</label>
                              <input
                                type="text"
                                required
                                value={addressData.street}
                                onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                                placeholder="House / Flat / Street details"
                                className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-white rounded focus:outline-none focus:border-snake-green"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-neutral-400 uppercase block mb-1">LANDMARK (OPTIONAL)</label>
                                <input
                                  type="text"
                                  value={addressData.landmark}
                                  onChange={(e) => setAddressData({ ...addressData, landmark: e.target.value })}
                                  placeholder="Near Metro Station"
                                  className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-white rounded focus:outline-none focus:border-snake-green"
                                />
                              </div>

                              <div>
                                <label className="text-neutral-400 uppercase flex items-center justify-between mb-1">
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
                                  required
                                  inputMode="numeric"
                                  maxLength={6}
                                  value={addressData.postalCode}
                                  onChange={handlePincodeChange}
                                  placeholder="e.g. 560001"
                                  className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-white rounded focus:outline-none focus:border-snake-green"
                                />
                                {pincodeMessage && (
                                  <p className="text-[10px] text-snake-green mt-1">{pincodeMessage}</p>
                                )}
                              </div>
                            </div>

                            {postOffices.length > 1 && (
                              <div>
                                <label className="text-neutral-400 uppercase block mb-1">SELECT POST OFFICE *</label>
                                <div className="relative">
                                  <select
                                    required
                                    value={addressData.postOffice}
                                    onChange={(e) => setAddressData({ ...addressData, postOffice: e.target.value })}
                                    className="w-full min-h-[48px] bg-[#111] border border-snake-green/60 px-4 py-3 text-white rounded focus:outline-none focus:border-snake-green appearance-none pr-10 cursor-pointer font-mono"
                                  >
                                    <option value="" disabled>-- SELECT POST OFFICE --</option>
                                    {postOffices.map((po) => (
                                      <option key={po.name} value={po.name} className="bg-neutral-900">
                                        {po.name}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-snake-green pointer-events-none" />
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-neutral-400 uppercase block mb-1">CITY / DISTRICT *</label>
                                <input
                                  type="text"
                                  required
                                  value={addressData.city}
                                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                                  placeholder="Bengaluru"
                                  className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-white rounded focus:outline-none focus:border-snake-green"
                                />
                              </div>

                              <div>
                                <label className="text-neutral-400 uppercase block mb-1">STATE *</label>
                                <input
                                  type="text"
                                  required
                                  value={addressData.state}
                                  onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                                  placeholder="Karnataka"
                                  className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-white rounded focus:outline-none focus:border-snake-green"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isCreatingAccount}
                          className="w-full min-h-[48px] py-4 bg-snake-green text-black font-mono text-xs tracking-widest font-bold uppercase hover:bg-white active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isCreatingAccount ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              CREATING ACCOUNT &amp; CONTINUING...
                            </>
                          ) : (
                            <>
                              CONTINUE TO DELIVERY <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: DELIVERY ADDRESS SELECTION & PAYMENT               */}
            {/* ========================================================= */}
            {step === 2 && (
              <div className="space-y-6">
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

                {/* Saved Address Cards for Authenticated Customers */}
                {user && savedAddresses.length > 0 && !isAddingNewAddress && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-neutral-400 uppercase">SAVED DESTINATIONS</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(true)}
                        className="text-xs font-mono text-snake-green hover:underline flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>ADD NEW ADDRESS</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id || null);
                              setAddressData({
                                fullName: addr.full_name || addr.fullName,
                                phone: addr.phone,
                                street: addr.street,
                                landmark: addr.landmark || '',
                                city: addr.city,
                                state: addr.state,
                                postalCode: addr.postal_code || addr.postalCode,
                                postOffice: addr.postOffice || '',
                                label: addr.label || 'Home',
                                country: addr.country || 'India',
                              });
                            }}
                            className={`p-4 border rounded cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#141414] border-snake-green shadow-[0_0_15px_rgba(4,252,33,0.15)]'
                                : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-neutral-300 uppercase rounded flex items-center gap-1">
                                {addr.label === 'Work' ? <Briefcase size={10} /> : <Home size={10} />}
                                {addr.label || 'Home'}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-mono text-snake-green font-bold flex items-center gap-1">
                                  <Check size={12} /> SELECTED
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-display font-medium text-white mb-1">
                              {addr.full_name || addr.fullName}
                            </p>
                            <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
                              {addr.street}
                              {addr.landmark ? `, ${addr.landmark}` : ''}
                              <br />
                              {addr.city}, {addr.state} - {addr.postal_code || addr.postalCode}
                            </p>
                            <p className="text-[10px] font-mono text-neutral-500 mt-2">
                              Phone: {formatPhoneDisplay(addr.phone)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form to Add New Address or manual address for new customer */}
                {(isAddingNewAddress || (!user && authFlowState === 'initial') || (user && savedAddresses.length === 0)) && (
                  <div className="space-y-4 text-xs font-mono">
                    {user && isAddingNewAddress && (
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-white font-semibold uppercase">NEW ADDRESS DETAILS</span>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewAddress(false)}
                          className="text-neutral-400 hover:text-white underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-neutral-400 uppercase">FULL RECIPIENT NAME *</label>
                      <input
                        type="text"
                        required
                        value={addressData.fullName}
                        onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                        placeholder="Full recipient name"
                        className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-neutral-400 uppercase">STREET ADDRESS &amp; APARTMENT *</label>
                      <input
                        type="text"
                        required
                        value={addressData.street}
                        onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                        placeholder="Building, flat, and street details"
                        className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-neutral-400 uppercase">LANDMARK (OPTIONAL)</label>
                        <input
                          type="text"
                          value={addressData.landmark}
                          onChange={(e) => setAddressData({ ...addressData, landmark: e.target.value })}
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
                          required
                          inputMode="numeric"
                          maxLength={6}
                          value={addressData.postalCode}
                          onChange={handlePincodeChange}
                          placeholder="e.g. 560001"
                          className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green font-mono"
                        />
                        {pincodeMessage && (
                          <p className="text-[10px] text-snake-green font-mono">{pincodeMessage}</p>
                        )}
                      </div>
                    </div>

                    {postOffices.length > 1 && (
                      <div className="space-y-1.5">
                        <label className="text-neutral-400 uppercase block">SELECT POST OFFICE / AREA *</label>
                        <div className="relative">
                          <select
                            required
                            value={addressData.postOffice}
                            onChange={(e) => setAddressData({ ...addressData, postOffice: e.target.value })}
                            className="w-full min-h-[48px] bg-[#111] border border-snake-green/60 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green appearance-none pr-10 cursor-pointer font-mono"
                          >
                            <option value="" disabled>-- SELECT POST OFFICE --</option>
                            {postOffices.map((po) => (
                              <option key={po.name} value={po.name} className="bg-neutral-900 text-white">
                                {po.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-snake-green pointer-events-none" />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-neutral-400 uppercase">CITY / DISTRICT *</label>
                        <input
                          type="text"
                          required
                          value={addressData.city}
                          onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                          placeholder="Bengaluru"
                          className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-neutral-400 uppercase">STATE *</label>
                        <input
                          type="text"
                          required
                          value={addressData.state}
                          onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                          placeholder="Karnataka"
                          className="w-full min-h-[48px] bg-black border border-white/15 px-4 py-3 text-base sm:text-xs text-white rounded focus:outline-none focus:border-snake-green"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms agreement */}
                <div className="text-[11px] font-mono text-neutral-500 leading-relaxed pt-1">
                  By completing this transaction, you agree to our{' '}
                  <Link href="/terms" target="_blank" className="text-neutral-300 hover:text-snake-green underline">
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="text-neutral-300 hover:text-snake-green underline">
                    Privacy Policy
                  </Link>
                  .
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="min-h-[48px] py-4 px-6 border border-white/20 text-neutral-300 font-mono text-xs uppercase hover:border-white active:scale-[0.99] transition-all"
                  >
                    BACK
                  </button>
                  <button
                    type="button"
                    onClick={handleCompletePayment}
                    disabled={isProcessing || !addressData.fullName || !addressData.street || !addressData.city || !addressData.postalCode}
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
              </div>
            )}
          </div>

          {/* Right: Order Summary Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 bg-[#0d0d0d] border border-white/10 rounded p-6 space-y-6">
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
