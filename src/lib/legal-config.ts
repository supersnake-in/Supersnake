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
  legalBusinessName: 'SuperSnake Apparel India Pvt Ltd',
  registeredAddress: 'Bengaluru, Karnataka 560094, India',
  jurisdiction: 'Bengaluru, Karnataka, India',
  gstin: null, // Official GSTIN
  generalEmail: OFFICIAL_EMAILS.general,
  supportEmail: OFFICIAL_EMAILS.support,
  officeEmail: OFFICIAL_EMAILS.office,
  noreplyEmail: OFFICIAL_EMAILS.noreply,
  customerCareHours: 'Monday – Saturday, 10:00 AM – 7:00 PM IST',
  grievanceOfficerName: 'Grievance Redressal Officer',
  grievanceDesignation: 'Grievance Redressal Officer',
  grievanceEmail: OFFICIAL_EMAILS.support,
  grievanceAddress: 'SuperSnake Atelier, Bengaluru, Karnataka 560094, India',
  grievancePhone: null,
  shippingDescription: 'Tracked delivery through our authorised courier partners.',
  shippingProcessingTime: '1–2 Business Days',
  deliveryEstimate: '4–7 Business Days',
  freeShippingThreshold: 1999,
  standardShippingFee: 99,
  paymentDescription: 'Payments are processed through authorised payment service providers using appropriate security measures.',
  refundProcessingTime: '5–7 Business Days',
  policyEffectiveDate: '19 September 2026',
  policyLastUpdated: '19 September 2026',
  socialLinks: {
    instagram: 'https://instagram.com/supersnake.in',
    x: 'https://x.com/supersnake_in',
    linkedin: null,
    youtube: 'https://youtube.com/@supersnake_in',
  },
};

const DEFAULT_FALLBACKS: Record<string, string> = {
  SHIPPING_PROCESSING_TIME: '1–2 Business Days',
  DELIVERY_ESTIMATE: '4–7 Business Days',
  LEGAL_JURISDICTION: 'Bengaluru, Karnataka, India',
  GRIEVANCE_EMAIL: 'support@supersnake.in',
  GRIEVANCE_OFFICER_NAME: 'Grievance Redressal Officer',
  SUPPORT_EMAIL: 'support@supersnake.in',
  DATE: '19 September 2026',
};

/**
 * Returns the configured value, or a clean default human-readable value
 * when the value is null or unspecified.
 */
export function getLegalValue(
  value: string | null | undefined,
  fallbackKey: string = 'CONFIGURATION REQUIRED'
): string {
  if (value && value.trim().length > 0) {
    return value;
  }
  return DEFAULT_FALLBACKS[fallbackKey] || value || '';
}
