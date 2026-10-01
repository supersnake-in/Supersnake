/**
 * SuperSnake Order Verification & Risk Engine
 * Separates authentication from delivery verification and prevents repetitive OTP friction.
 */

export interface OrderVerificationInput {
  total: number;
  paymentMethod?: string;
  isPreBooking?: boolean;
  itemCount?: number;
}

export interface CustomerVerificationInput {
  phone?: string;
  phoneVerified?: boolean;
  email?: string;
  orderCount?: number;
}

export interface VerificationRequirement {
  required: boolean;
  reason?: string;
}

/**
 * Determines whether an order strictly requires phone verification.
 *
 * Architectural Principle:
 * - Standard prepaid e-commerce checkouts NEVER require phone OTP or verification to place an order.
 * - Once a phone number has been legitimately verified, retain that verification state and NEVER repeatedly ask for OTP.
 * - High-risk or extreme high-value transactions (e.g. orders exceeding ₹25,000) can conditionally flag for verification.
 */
export function requiresPhoneVerification(
  order: OrderVerificationInput,
  customer?: CustomerVerificationInput
): VerificationRequirement {
  // If the patron's phone is already verified, verification is never required again
  if (customer?.phoneVerified) {
    return { required: false };
  }

  // High-value threshold check (₹25,000+)
  if (order.total >= 25000) {
    return {
      required: true,
      reason: 'High-value atelier orders (₹25,000+) require verified phone coordinates prior to atelier dispatch.',
    };
  }

  // Cash on delivery (if enabled in future) requires contact verification
  if (order.paymentMethod === 'cod') {
    return {
      required: true,
      reason: 'Cash on delivery requires phone verification to prevent unconfirmed dispatches.',
    };
  }

  // Default: zero friction for standard prepaid orders
  return { required: false };
}
