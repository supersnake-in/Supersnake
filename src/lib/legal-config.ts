export const OFFICIAL_EMAILS = {
  general: 'hello@supersnake.in',
  support: 'support@supersnake.in',
  office: 'office@supersnake.in',
  noreply: 'noreply@supersnake.in',
} as const;

export interface LegalBusinessConfig {
  brandName: string;
  websiteUrl: string;
  legalBusinessName: string | null;
  registeredAddress: string | null;
  jurisdiction: string | null;
  gstin: string | null;
  generalEmail: string;
  supportEmail: string;
  officeEmail: string;
  noreplyEmail: string;
  customerCareHours: string;
  grievanceOfficerName: string | null;
  grievanceDesignation: string | null;
  grievanceEmail: string;
  grievanceAddress: string | null;
  grievancePhone: string | null;
  shippingDescription: string;
  shippingProcessingTime: string | null;
  deliveryEstimate: string | null;
  freeShippingThreshold: number;
  standardShippingFee: number;
  paymentDescription: string;
  refundProcessingTime: string | null;
  policyEffectiveDate: string;
  policyLastUpdated: string;
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
  registeredAddress: null, // [CONFIGURE] Registered Office Address
  jurisdiction: null, // [CONFIGURE] e.g. "Bengaluru, Karnataka, India"
  gstin: null, // [CONFIGURE] Official GSTIN
  generalEmail: OFFICIAL_EMAILS.general,
  supportEmail: OFFICIAL_EMAILS.support,
  officeEmail: OFFICIAL_EMAILS.office,
  noreplyEmail: OFFICIAL_EMAILS.noreply,
  customerCareHours: 'Monday – Saturday, 10:00 AM – 7:00 PM IST',
  grievanceOfficerName: null, // [CONFIGURE] Official Grievance Officer Name (Rule 5(9) E-Commerce Rules)
  grievanceDesignation: null, // [CONFIGURE] e.g. "Grievance Redressal Officer"
  grievanceEmail: OFFICIAL_EMAILS.support, // Official channel for complaints & grievances
  grievanceAddress: null, // [CONFIGURE] Official Grievance Postal Address
  grievancePhone: null, // [CONFIGURE] Official Grievance Contact Telephone
  shippingDescription: 'Tracked delivery through our authorised courier partners.',
  shippingProcessingTime: null, // [CONFIGURE] e.g. "1–2 Business Days"
  deliveryEstimate: null, // [CONFIGURE] e.g. "2–5 Business Days"
  freeShippingThreshold: 1999,
  standardShippingFee: 99,
  paymentDescription: 'Payments are processed through authorised payment service providers using appropriate security measures.',
  refundProcessingTime: null, // [CONFIGURE] e.g. "5–7 Business Days"
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
