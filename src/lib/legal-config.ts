export interface LegalBusinessConfig {
  brandName: string;
  websiteUrl: string;
  legalBusinessName: string | null;
  registeredAddress: string | null;
  jurisdiction: string | null;
  gstin: string | null;
  supportEmail: string | null;
  customerCareHours: string | null;
  grievanceOfficerName: string | null;
  grievanceEmail: string | null;
  grievanceAddress: string | null;
  grievancePhone: string | null;
  shippingProvider: string | null;
  shippingProcessingTime: string | null;
  deliveryEstimate: string | null;
  freeShippingThreshold: number | null;
  standardShippingFee: number | null;
  refundProcessingTime: string | null;
  policyEffectiveDate: string | null;
  policyLastUpdated: string | null;
  socialLinks: {
    instagram?: string | null;
    x?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
  };
}

export const LEGAL_CONFIG: LegalBusinessConfig = {
  brandName: 'SUPERSNAKE',
  websiteUrl: 'https://supersnake.in',
  legalBusinessName: null, // [CONFIGURE] e.g. "SuperSnake Apparel Private Limited"
  registeredAddress: null, // [CONFIGURE] e.g. "Indiranagar, Bengaluru, Karnataka 560038, India"
  jurisdiction: null, // [CONFIGURE] e.g. "Bengaluru, Karnataka, India"
  gstin: null, // [CONFIGURE] e.g. "29ABCDE1234F1Z5"
  supportEmail: null, // [CONFIGURE] e.g. "concierge@supersnake.in"
  customerCareHours: 'Monday – Saturday, 10:00 AM – 7:00 PM IST',
  grievanceOfficerName: null, // [CONFIGURE] Official Grievance Officer Name
  grievanceEmail: null, // [CONFIGURE] Official Grievance Email
  grievanceAddress: null, // [CONFIGURE] Official Grievance Postal Address
  grievancePhone: null, // [CONFIGURE] Official Grievance Contact Number
  shippingProvider: null, // [CONFIGURE] e.g. "Blue Dart Air Express / Delhivery"
  shippingProcessingTime: null, // [CONFIGURE] e.g. "1–2 Business Days"
  deliveryEstimate: null, // [CONFIGURE] e.g. "2–5 Business Days"
  freeShippingThreshold: 1999, // Current cart threshold
  standardShippingFee: 99, // Current below-threshold fee
  refundProcessingTime: null, // [CONFIGURE] Time for payment provider refund credit
  policyEffectiveDate: '19 September 2026',
  policyLastUpdated: '19 September 2026',
  socialLinks: {
    instagram: 'https://instagram.com/supersnake.in',
    x: 'https://x.com/supersnake_in',
    linkedin: null,
    youtube: 'https://youtube.com/@supersnake_in',
  },
};

/**
 * Returns the configured value, or a clean [CONFIGURATION REQUIRED] placeholder
 * when the value is null or unspecified.
 */
export function getLegalValue(
  value: string | null | undefined,
  fallbackLabel: string = 'CONFIGURATION REQUIRED'
): string {
  if (value && value.trim().length > 0) {
    return value;
  }
  return `[${fallbackLabel}]`;
}
