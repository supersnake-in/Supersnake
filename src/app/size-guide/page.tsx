'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ruler, ArrowRight, Check } from 'lucide-react';
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

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [gender, setGender] = useState<'men' | 'women'>('men');

  const data = gender === 'men' ? MEN_MEASUREMENTS : WOMEN_MEASUREMENTS;

  return (
    <div className="bg-black text-white min-h-screen pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-mono tracking-[0.3em] text-snake-green uppercase">
            ARCHITECTURAL MEASUREMENTS
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-medium uppercase tracking-tight text-white">
            SIZE & FIT GUIDE
          </h1>
          <p className="text-xs md:text-sm font-mono text-neutral-400">
            Engineered patterns based on anatomical proportions. All measurements represent finished garment dimensions.
          </p>
        </div>

        {/* Controls Bar */}
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

        {/* Measurement Guide Diagram Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-4">
            <h3 className="text-base font-display font-medium text-white uppercase tracking-wider">
              HOW TO MEASURE YOUR BEST-FITTING TEE
            </h3>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              For optimal accuracy, lay your favorite T-shirt flat on a hard surface and measure using a flexible tape:
            </p>
            <div className="space-y-3 text-xs font-mono text-neutral-300 pt-2">
              <div>
                <span className="text-snake-green font-semibold">1. CHEST: </span>
                <span>Measure straight across from underarm seam to underarm seam, then double the number.</span>
              </div>
              <div>
                <span className="text-snake-green font-semibold">2. LENGTH: </span>
                <span>Measure from the highest point of the shoulder seam down to the bottom hemline.</span>
              </div>
              <div>
                <span className="text-snake-green font-semibold">3. SHOULDER: </span>
                <span>Measure horizontally from shoulder seam point to shoulder seam point.</span>
              </div>
              <div>
                <span className="text-snake-green font-semibold">4. SLEEVE: </span>
                <span>Measure from the shoulder seam down to the sleeve edge.</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-4">
            <h3 className="text-base font-display font-medium text-white uppercase tracking-wider">
              FIT MATRIX
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-[#121212] border border-white/5 rounded-sm">
                <span className="text-white font-medium block">OVERSIZED FIT</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Dropped shoulders, relaxed chest, heavier drape. Order true to size.
                </p>
              </div>
              <div className="p-3 bg-[#121212] border border-white/5 rounded-sm">
                <span className="text-white font-medium block">BOXY CUT</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Slightly cropped torso, broader shoulder stance, street-inspired silhouette.
                </p>
              </div>
              <div className="p-3 bg-[#121212] border border-white/5 rounded-sm">
                <span className="text-white font-medium block">RELAXED ESSENTIAL</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Balanced everyday comfort. Structured collar that stays crisp throughout the day.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            <span>SHOP COLLECTION NOW</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
