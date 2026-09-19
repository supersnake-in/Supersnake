'use client';

import React from 'react';
import Link from 'next/link';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { Droplets, Wind, Sun, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

const TOC = [
  { id: 'golden-rule', title: '1. Primary Directive: Garment Label' },
  { id: 'washing', title: '2. Washing Protocol (Cold Wash Inside Out)' },
  { id: 'drying', title: '3. Drying Guidance (Flat Dry in Shade)' },
  { id: 'ironing', title: '4. Ironing & Graphic Preservation' },
  { id: 'collar-care', title: '5. Ribbed Collar & Structural Preservation' },
  { id: 'prohibitions', title: '6. Prohibitions: Bleach, Dry Cleaning, Wringing' },
];

const RELATED = [
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'Returns & Defects', href: '/returns' },
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Contact Us', href: '/contact' },
];

export default function CareGuidePage() {
  return (
    <PolicyLayout
      category="CUSTOMER CARE"
      title="CARE GUIDE"
      description="Essential garment preservation instructions to maintain fabric weight, structure, dye intensity, and graphic print longevity."
      tableOfContents={TOC}
      relatedLinks={RELATED}
    >
      {/* Primary Directive Banner */}
      <div className="p-5 bg-[#0e0e0e] border border-white/10 rounded-sm space-y-2">
        <div className="flex items-center gap-2 text-snake-green text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck size={16} />
          <span>PRIMARY CARE DIRECTIVE</span>
        </div>
        <p className="text-white text-xs sm:text-sm font-display font-medium uppercase tracking-tight">
          ALWAYS FOLLOW THE CARE INSTRUCTIONS PROVIDED ON THE GARMENT LABEL.
        </p>
        <p className="text-neutral-400 text-xs leading-relaxed">
          Each SuperSnake piece features an internal satin care label tailored to its specific fabric blend, dye technique, and graphic finish. The label instructions supersede general guidelines.
        </p>
      </div>

      {/* Section 1: Golden Rule */}
      <section id="golden-rule" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          1. Primary Directive: Garment Label
        </h2>
        <p>
          Proper care extends the lifespan of premium cotton, preserves reactive dye brilliance, and maintains architectural drape over years of wear. Because distinct fabric compositions and print methods have unique requirements, your garment&apos;s sewn-in care label is your definitive guide.
        </p>
      </section>

      {/* Section 2: Washing */}
      <section id="washing" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          2. Washing Protocol (Cold Wash Inside Out)
        </h2>
        <div className="p-5 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-3">
          <div className="flex items-center gap-2 text-snake-green">
            <Droplets size={18} />
            <span className="font-semibold text-white uppercase text-xs">COLD WATER (MAXIMUM 30°C / 86°F)</span>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Always turn garments inside out prior to loading into the machine. Wash in cold water on a gentle cycle with similar dark colors using mild, phosphate-free liquid detergent.
          </p>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Cold water prevents thermal shock to natural cotton fibers, limits shrinkage, and protects reactive dye bonds from leaching.
          </p>
        </div>
      </section>

      {/* Section 3: Drying */}
      <section id="drying" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          3. Drying Guidance (Flat Dry in Shade)
        </h2>
        <div className="p-5 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-3">
          <div className="flex items-center gap-2 text-snake-green">
            <Wind size={18} />
            <span className="font-semibold text-white uppercase text-xs">AVOID TUMBLE DRYING</span>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Do not tumble dry in machine dryers. Tumble dryer heat breaks down cotton elastane, warps collar ribbing, and accelerates surface fuzzing.
          </p>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Reshape the garment gently while damp and lay it flat on a clean drying rack in a shaded, well-ventilated space. Avoid direct exposure to harsh midday sunlight, which can bleach rich black and deep pigment dyes.
          </p>
        </div>
      </section>

      {/* Section 4: Ironing */}
      <section id="ironing" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          4. Ironing & Graphic Preservation
        </h2>
        <div className="p-5 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-3">
          <div className="flex items-center gap-2 text-snake-green">
            <Sun size={18} />
            <span className="font-semibold text-white uppercase text-xs">COOL IRON INSIDE OUT</span>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed">
            If pressing is desired, iron inside out on a low-to-medium cotton setting. Never apply a hot iron soleplate directly over high-density screen prints, silicone emblems, heat transfers, or external labels.
          </p>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Direct iron contact on prints will melt polymers and damage the graphic surface permanently.
          </p>
        </div>
      </section>

      {/* Section 5: Collar Care */}
      <section id="collar-care" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          5. Ribbed Collar & Structural Preservation
        </h2>
        <p>
          Our heavyweight ribbed collars are engineered to retain their snug, architectural contour. To prevent neck opening stretching:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
          <li>When using hangers, always insert the hanger from the bottom hem upwards rather than forcing it down through the neck hole;</li>
          <li>Alternatively, store garments folded flat in a drawer or on a shelf to eliminate hanger shoulder bumps;</li>
          <li>Never yank or pull forcefully at the collar when donning or removing garments.</li>
        </ul>
      </section>

      {/* Section 6: Prohibitions */}
      <section id="prohibitions" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          6. Prohibitions: Bleach, Dry Cleaning, Wringing
        </h2>
        <div className="p-5 bg-[#0a0a0a] border border-red-900/30 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase">
            <AlertTriangle size={16} />
            <span>STRICT ATELIER PROHIBITIONS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-black/60 border border-white/5 rounded-sm">
              <strong className="text-white block">NO CHLORINE BLEACH</strong>
              <p className="text-neutral-500 text-[11px] mt-1">Bleaching agents strip dyes and degrade natural cotton fibers.</p>
            </div>
            <div className="p-3 bg-black/60 border border-white/5 rounded-sm">
              <strong className="text-white block">NO CHEMICAL DRY CLEANING</strong>
              <p className="text-neutral-500 text-[11px] mt-1">Petroleum solvents erode silicone finishes and soften graphic bonds.</p>
            </div>
            <div className="p-3 bg-black/60 border border-white/5 rounded-sm">
              <strong className="text-white block">NO HARD WRINGING</strong>
              <p className="text-neutral-500 text-[11px] mt-1">Twisting wet heavyweight cotton shears twin-needle hem stitching.</p>
            </div>
          </div>
        </div>
      </section>
    </PolicyLayout>
  );
}
