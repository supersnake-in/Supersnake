export const BRAND = {
  name: 'SUPERSNAKE',
  legalName: 'SuperSnake Apparel India Pvt Ltd',
  domain: 'SUPERSNAKE.IN',
  tagline: 'WEAR YOUR INSTINCT.',
  secondaryTagline: 'NOT MADE TO BLEND IN.',
  currency: 'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 1999,
  social: {
    instagram: 'https://instagram.com/supersnake.in',
    twitter: 'https://x.com/supersnake_in',
    hashtag: '#SUPERSNAKE',
  },
  contact: {
    email: 'concierge@supersnake.in',
    phone: '+91 80 4961 8000',
    address: 'SuperSnake Studio, Indiranagar, Bengaluru 560038, India',
  },
  colors: {
    obsidian: '#000000',
    offBlack: '#080808',
    charcoal: '#111111',
    carbon: '#171717',
    border: '#222222',
    snakeGreen: '#04fc21',
    snakeGreenGlow: 'rgba(4, 252, 33, 0.35)',
    white: '#fafafa',
    mutedGray: '#737373',
  },
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
