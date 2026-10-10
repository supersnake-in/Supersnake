import { Collection } from '../types';

export const COLLECTIONS_DATA: Collection[] = [
  {
    id: 'col-black-panther',
    name: 'THE BLACK PANTHER',
    slug: 'the-black-panther',
    badge: 'CHAPTER 01 // SHADOW PREDATOR',
    tagline: 'Power, stealth, and feline elegance engineered in deep shadow tones.',
    description:
      'Inspired by the raw power, stealth, confidence, and quiet elegance of the panther. The Black Panther series explores nocturnal dominance through rich obsidian and mineral charcoal fabrics, precision tonal high-density embroidery, and restrained neon-green signature accents. Every garment embodies a predator’s calculated grace—unspoken authority, tailored monolithic drape, and uncompromising tactile presence.',
    artworkMood:
      'Subtle panther chest crest, micro-embossed feline silhouette, tonal neck embroidery, restrained neon-green bar-tacks.',
    fabricSpecs: '280–300 GSM Heavyweight Supima® Cotton & French Terry, Preshrunk Boxy Contour.',
    heroImage: '/collection-black-panther-hero.jpg',
    cardImage: '/collection-black-panther-card.jpg',
    moodPalette: [
      { name: 'Obsidian Black', hex: '#0a0a0a' },
      { name: 'Panther Charcoal', hex: '#1c1c1c' },
      { name: 'Shadow Mineral', hex: '#2b2b2b' },
      { name: 'Restrained Venom', hex: '#04fc21' },
    ],
    accentColor: '#04fc21',
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'col-the-royals',
    name: 'THE ROYALS',
    slug: 'the-royals',
    badge: 'CHAPTER 02 // IMPERIAL ARCHIVE',
    tagline: 'Heritage, prestige, and timeless luxury. Sovereignty in pure heavyweight drape.',
    description:
      'Inspired by dynastic heritage, sovereign prestige, and timeless aristocratic luxury. The Royals series marries classical heraldic emblems with ultra-refined typography, creating an aura of supreme status without gaudy ostentation. Tailored in deep royal hues with subtle metallic and tonal threadwork, this chapter is designed for those who command respect through restraint.',
    artworkMood:
      'Refined serif typography, sovereign serpent crest with imperial crown emblem, gilded tonal embroidery, bespoke heritage interior neck tape.',
    fabricSpecs:
      '280 GSM Compact Supima® Combed Cotton, Zero-Sag Ribbed Collar, Architectural Dropped Shoulders.',
    heroImage: '/collection-the-royals-hero.jpg',
    cardImage: '/collection-the-royals-card.jpg',
    moodPalette: [
      { name: 'Midnight Navy', hex: '#0d1527' },
      { name: 'Imperial Gold', hex: '#c5a059' },
      { name: 'Vintage Burgundy', hex: '#3b1219' },
      { name: 'Bone Ivory', hex: '#e6dfd5' },
    ],
    accentColor: '#c5a059',
    displayOrder: 2,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-08-05',
  },
  {
    id: 'col-the-serpent',
    name: 'THE SERPENT',
    slug: 'the-serpent',
    badge: 'CHAPTER 03 // PRIMAL IDENTITY',
    tagline: 'Instinct, mystery, and metamorphosis. The core pulse of SUPER SNAKE.',
    description:
      'Centred on instinct, mystery, transformation, and our foundational snake identity. The Serpent series translates the hypnotic poise and lethal strike of the viper into distinctive graphic language, micro-textured reptilian scale motifs, and signature neon-green accents. It is the purest visual manifestation of wearing your instinct.',
    artworkMood:
      'Micro-density tactile snake crest, coiled serpent spine back placement, emerald and venom green contrast bar-tacks.',
    fabricSpecs:
      '260–280 GSM Organic French Terry & Heavy Jersey, Reinforced Bar-Tacks, Pre-Enzyme Wash.',
    heroImage: '/hero-object-supersnake-tee.png',
    cardImage: '/hero2.png',
    moodPalette: [
      { name: 'Venom Green', hex: '#04fc21' },
      { name: 'Obsidian Black', hex: '#0a0a0a' },
      { name: 'Serpent Emerald', hex: '#0d381e' },
      { name: 'Smoked Ash', hex: '#383838' },
    ],
    accentColor: '#04fc21',
    displayOrder: 3,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-08-10',
  },
  {
    id: 'col-the-aura',
    name: 'THE AURA',
    slug: 'the-aura',
    badge: 'CHAPTER 04 // QUIET LUXURY',
    tagline: 'Radical minimalism, clean silhouettes, and whispered sophistication.',
    description:
      'A study in quiet luxury, architectural minimalism, and supreme everyday wearability. The Aura series strips away exterior distraction to focus purely on tactile excellence, flawless tailoring, unbleached organic textures, and microscopic branding. Designed to be felt before it is seen.',
    artworkMood:
      'Invisible Japanese blind hems, tone-on-tone micro-branding at nape, zero-exterior stitch noise.',
    fabricSpecs:
      '240–280 GSM Unbleached Organic Supima® Cotton, Ultra-Soft Silicone Wash, Fluid Relaxed Silhouette.',
    heroImage: '/brand-pillar-fit.png',
    cardImage: '/women-collection.png',
    moodPalette: [
      { name: 'Chalk White', hex: '#f2f2f2' },
      { name: 'Bone Ivory', hex: '#e6dfd5' },
      { name: 'Misty Oat', hex: '#cfc6b8' },
      { name: 'Quiet Clay', hex: '#8a7d6d' },
    ],
    accentColor: '#e6dfd5',
    displayOrder: 4,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-08-15',
  },
  {
    id: 'col-the-signature',
    name: 'THE SIGNATURE',
    slug: 'the-signature',
    badge: 'CHAPTER 05 // CORE FOUNDATION',
    tagline: 'Our permanent core collection featuring timeless SUPER SNAKE essentials.',
    description:
      'The immortal cornerstone of SUPER SNAKE. Featuring the exact, uncompromised master brand symbol and engineered around the demands of daily life. The Signature collection showcases our heavyweight 280 GSM Supima® cotton, 1-inch zero-sag reinforced collar, and tailored boxy architecture. Timeless essentials built to wear forever.',
    artworkMood:
      'The pristine original SUPER SNAKE master symbol, signature neon-green accent label, embroidered serpent monogram.',
    fabricSpecs:
      '280 GSM 100% Long-Staple Supima® Combed Cotton, Zero-Sag Collar, Twin-Needle Reinforcement.',
    heroImage: '/signature-tee-spotlight.png',
    cardImage: '/hero-object-supersnake-tee.png',
    moodPalette: [
      { name: 'Obsidian Black', hex: '#0a0a0a' },
      { name: 'Chalk White', hex: '#f2f2f2' },
      { name: 'Washed Charcoal', hex: '#262626' },
      { name: 'Signature Green', hex: '#04fc21' },
    ],
    accentColor: '#04fc21',
    displayOrder: 5,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-08-01',
  },
];
