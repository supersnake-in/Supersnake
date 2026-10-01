/**
 * SuperSnake Order Verification & Risk Engine
 * Separates authentication from delivery verification and prevents repetitive OTP friction.
 */

export interface OrderVerificationInput {
  total: number;
  paymentMethod?: string;
  isPreBooking?: boolean;
  itemCount?: number;
  addressRiskFlag?: boolean;
  isFlaggedRisk?: boolean;
}

export interface CustomerVerificationInput {
  phone?: string;
  phoneVerified?: boolean;
  email?: string;
  orderCount?: number;
  recentUnverifiedOrderCount?: number;
}

export interface VerificationRequirement {
  required: boolean;
  reason?: string;
  riskScore?: number;
}

/**
 * Configurable order value threshold above which phone verification is triggered
 * Defaults to ₹25,000, configurable via process.env.PHONE_VERIFICATION_THRESHOLD
 */
export const PHONE_VERIFICATION_THRESHOLD =
  typeof process !== 'undefined' && process.env.PHONE_VERIFICATION_THRESHOLD
    ? Number(process.env.PHONE_VERIFICATION_THRESHOLD) || 25000
    : 25000;

/**
 * Determines whether an order strictly requires phone verification.
 *
 * Architectural Principles:
 * 1. Low-Friction Checkout: Standard prepaid orders proceed directly without OTP interruptions.
 * 2. Retention: Once a patron's phone is legitimately verified, they are never asked again.
 * 3. Extensible Risk Engine: Multi-factor risk evaluation (order value, payment method, velocity, risk flags).
 */
export function requiresPhoneVerification(
  order: OrderVerificationInput,
  customer?: CustomerVerificationInput
): VerificationRequirement {
  // 1. If the patron's phone is already verified, verification is never required again
  if (customer?.phoneVerified) {
    return { required: false, riskScore: 0 };
  }

  let riskScore = 0;
  const reasons: string[] = [];

  // 2. High-value order evaluation
  if (order.total >= PHONE_VERIFICATION_THRESHOLD) {
    riskScore += 50;
    reasons.push(
      `High-value atelier orders (₹${PHONE_VERIFICATION_THRESHOLD.toLocaleString('en-IN')}+) require verified phone coordinates prior to dispatch.`
    );
  }

  // 3. Payment method risk (e.g. COD if ever enabled)
  if (order.paymentMethod === 'cod') {
    riskScore += 60;
    reasons.push('Cash on delivery requires contact number verification to prevent unconfirmed dispatches.');
  }

  // 4. Order velocity check (e.g., patron attempting multiple rapid unverified orders)
  if ((customer?.recentUnverifiedOrderCount || 0) >= 3) {
    riskScore += 40;
    reasons.push('Multiple recent unverified orders detected.');
  }

  // 5. Explicit fraud / risk flags (e.g. address anomaly)
  if (order.isFlaggedRisk || order.addressRiskFlag) {
    riskScore += 50;
    reasons.push('Delivery coordinate verification flagged for security.');
  }

  // Threshold: if cumulative risk score >= 50, require verification
  if (riskScore >= 50) {
    return {
      required: true,
      reason: reasons[0] || 'Phone verification required before proceeding.',
      riskScore,
    };
  }

  // Default: Low-friction flow for standard prepaid orders
  return { required: false, riskScore };
}
