'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { Ruler, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Size } from '@/lib/types';

interface MeasurementRow {
  size: Size;
  chestIn: number;
  chestCm: number;
  lengthIn: number;
  lengthCm: number;
  shoulderIn: number;
  shoulderCm: number;
  sleeveIn: number;
  sleeveCm: number;
}

const MEN_MEASUREMENTS: MeasurementRow[] = [
  { size: 'XS', chestIn: 38, chestCm: 96, lengthIn: 27, lengthCm: 68, shoulderIn: 18, shoulderCm: 46, sleeveIn: 8.5, sleeveCm: 21 },
  { size: 'S', chestIn: 40, chestCm: 102, lengthIn: 28, lengthCm: 71, shoulderIn: 19, shoulderCm: 48, sleeveIn: 9.0, sleeveCm: 23 },
  { size: 'M', chestIn: 42, chestCm: 107, lengthIn: 29, lengthCm: 74, shoulderIn: 20, shoulderCm: 51, sleeveIn: 9.5, sleeveCm: 24 },
  { size: 'L', chestIn: 44, chestCm: 112, lengthIn: 30, lengthCm: 76, shoulderIn: 21, shoulderCm: 53, sleeveIn: 10.0, sleeveCm: 25 },
  { size: 'XL', chestIn: 47, chestCm: 119, lengthIn: 31, lengthCm: 79, shoulderIn: 22, shoulderCm: 56, sleeveIn: 10.5, sleeveCm: 27 },
  { size: 'XXL', chestIn: 50, chestCm: 127, lengthIn: 32, lengthCm: 81, shoulderIn: 23, shoulderCm: 58, sleeveIn: 11.0, sleeveCm: 28 },
];

const WOMEN_MEASUREMENTS: MeasurementRow[] = [
  { size: 'XS', chestIn: 34, chestCm: 86, lengthIn: 24, lengthCm: 61, shoulderIn: 16, shoulderCm: 41, sleeveIn: 7.0, sleeveCm: 18 },
  { size: 'S', chestIn: 36, chestCm: 91, lengthIn: 25, lengthCm: 63, shoulderIn: 17, shoulderCm: 43, sleeveIn: 7.5, sleeveCm: 19 },
  { size: 'M', chestIn: 38, chestCm: 96, lengthIn: 26, lengthCm: 66, shoulderIn: 18, shoulderCm: 46, sleeveIn: 8.0, sleeveCm: 20 },
  { size: 'L', chestIn: 41, chestCm: 104, lengthIn: 27, lengthCm: 68, shoulderIn: 19, shoulderCm: 48, sleeveIn: 8.5, sleeveCm: 21 },
  { size: 'XL', chestIn: 44, chestCm: 112, lengthIn: 28, lengthCm: 71, shoulderIn: 20, shoulderCm: 51, sleeveIn: 9.0, sleeveCm: 23 },
  { size: 'XXL', chestIn: 47, chestCm: 119, lengthIn: 29, lengthCm: 74, shoulderIn: 21, shoulderCm: 53, sleeveIn: 9.5, sleeveCm: 24 },
];

const TOC = [
  { id: 'sizing-chart', title: '1. Standard Sizing Matrix' },
  { id: 'how-to-measure', title: '2. How to Measure Your Best-Fitting Tee' },
  { id: 'fit-silhouettes', title: '3. Silhouette Profiles (Oversized, Boxy, Relaxed)' },
  { id: 'tolerance-disclaimer', title: '4. Manufacturing Tolerances & Product Pages' },
];

const RELATED = [
  { label: 'Care Guide', href: '/care-guide' },
  { label: 'Returns & Defects', href: '/returns' },
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Contact Us', href: '/contact' },
];

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [gender, setGender] = useState<'men' | 'women'>('men');

  const data = gender === 'men' ? MEN_MEASUREMENTS : WOMEN_MEASUREMENTS;

  return (
    <PolicyLayout
      category="CUSTOMER CARE"
      title="SIZE GUIDE"
      description="Architectural garment measurements, silhouette contours, and measuring instructions to ensure the perfect fit before ordering."
      tableOfContents={TOC}
      relatedLinks={RELATED}
    >
      {/* Important Notice */}
      <div className="p-4 bg-[#0e0e0e] border border-white/10 rounded-sm space-y-2">
        <div className="flex items-center gap-2 text-snake-green text-xs font-semibold uppercase tracking-wider">
          <AlertCircle size={15} />
          <span>PRODUCT-SPECIFIC MEASUREMENTS</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Because SuperSnake follows a strict no-return policy for ordinary purchases and size selections, please check individual product pages for piece-specific garment dimensions before purchasing.
        </p>
      </div>

      {/* Section 1: Sizing Chart */}
      <section id="sizing-chart" className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          {/* Gender Pills */}
          <div className="flex items-center gap-1 bg-[#0a0a0a] border border-white/10 p-1 rounded text-xs font-mono">
            <button
              onClick={() => setGender('men')}
              className={`px-4 py-1.5 rounded transition-colors uppercase ${
                gender === 'men'
                  ? 'bg-neutral-800 text-snake-green font-semibold'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              MEN / UNISEX
            </button>
            <button
              onClick={() => setGender('women')}
              className={`px-4 py-1.5 rounded transition-colors uppercase ${
                gender === 'women'
                  ? 'bg-neutral-800 text-snake-green font-semibold'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              WOMEN
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-neutral-500 text-[10px] uppercase">UNITS:</span>
            <div className="flex items-center gap-1 bg-[#0a0a0a] border border-white/10 p-1 rounded">
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded transition-colors uppercase ${
                  unit === 'in'
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                INCHES (IN)
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded transition-colors uppercase ${
                  unit === 'cm'
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                CENTIMETERS (CM)
              </button>
            </div>
          </div>
        </div>

        {/* Measurements Table */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="py-4 px-6 font-medium">SIZE</th>
                <th className="py-4 px-6 font-medium">CHEST (PIT-TO-PIT)</th>
                <th className="py-4 px-6 font-medium">BODY LENGTH</th>
                <th className="py-4 px-6 font-medium">SHOULDER WIDTH</th>
                <th className="py-4 px-6 font-medium">SLEEVE LENGTH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row) => (
                <tr key={row.size} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-display font-medium text-white text-sm">
                    {row.size}
                  </td>
                  <td className="py-4 px-6 text-neutral-300">
                    {unit === 'in' ? `${row.chestIn}"` : `${row.chestCm} cm`}
                  </td>
                  <td className="py-4 px-6 text-neutral-300">
                    {unit === 'in' ? `${row.lengthIn}"` : `${row.lengthCm} cm`}
                  </td>
                  <td className="py-4 px-6 text-neutral-300">
                    {unit === 'in' ? `${row.shoulderIn}"` : `${row.shoulderCm} cm`}
                  </td>
                  <td className="py-4 px-6 text-neutral-300">
                    {unit === 'in' ? `${row.sleeveIn}"` : `${row.sleeveCm} cm`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: How to Measure */}
      <section id="how-to-measure" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          2. How to Measure Your Best-Fitting Tee
        </h2>
        <p>
          For maximum accuracy, lay your favorite T-shirt flat on a hard surface and measure using a flexible tailoring tape:
        </p>
        <div className="space-y-3 text-xs font-mono text-neutral-300 pt-2">
          <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-sm">
            <strong className="text-snake-green font-semibold">1. CHEST (PIT-TO-PIT): </strong>
            <span>Measure straight across from underarm seam to underarm seam, then double the figure for full circumference.</span>
          </div>
          <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-sm">
            <strong className="text-snake-green font-semibold">2. BODY LENGTH: </strong>
            <span>Measure from the highest point of the shoulder seam where it meets the collar down to the bottom hemline.</span>
          </div>
          <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-sm">
            <strong className="text-snake-green font-semibold">3. SHOULDER WIDTH: </strong>
            <span>Measure horizontally across the back from the tip of one shoulder seam to the tip of the opposite shoulder seam.</span>
          </div>
          <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-sm">
            <strong className="text-snake-green font-semibold">4. SLEEVE LENGTH: </strong>
            <span>Measure from the outer shoulder seam point down to the edge of the sleeve cuff.</span>
          </div>
        </div>
      </section>

      {/* Section 3: Fit Silhouettes */}
      <section id="fit-silhouettes" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          3. Silhouette Profiles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-1">
            <span className="text-white font-medium block uppercase tracking-wider">OVERSIZED FIT</span>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Dropped shoulders, elongated sleeves, expansive chest, and substantial vertical drape. Order true to size for signature drape.
            </p>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-1">
            <span className="text-white font-medium block uppercase tracking-wider">BOXY CUT</span>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Slightly cropped torso, broader shoulder stance, structured neckline, street-inspired modern architecture.
            </p>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-sm space-y-1">
            <span className="text-white font-medium block uppercase tracking-wider">RELAXED ESSENTIAL</span>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Balanced everyday silhouette. Ample room across chest and arms with classic body length.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Manufacturing Tolerances & Product Pages */}
      <section id="tolerance-disclaimer" className="space-y-4 pt-4">
        <h2 className="text-base sm:text-lg font-display font-medium text-white uppercase tracking-wider border-b border-white/10 pb-2">
          4. Manufacturing Tolerances & Product Pages
        </h2>
        <p>
          Garments are cut and sewn with precision; however, standard commercial textile tolerances of approximately +/- 0.5 inches (1.25 cm) may occur due to manual craftsmanship, seam tension, and natural organic cotton elasticity.
        </p>
        <p>
          Individual product lines may feature unique tailoring variations or specialized silhouettes. Always consult the dedicated specifications on each product page prior to order confirmation.
        </p>
      </section>
    </PolicyLayout>
  );
}
