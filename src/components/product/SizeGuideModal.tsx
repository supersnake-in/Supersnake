'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  fitType: string;
}

export function SizeGuideModal({ isOpen, onClose, fitType }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  const sizeChart = [
    { size: 'XS', chest: unit === 'inches' ? '38"' : '96 cm', length: unit === 'inches' ? '27"' : '68 cm', shoulder: unit === 'inches' ? '18"' : '46 cm', sleeve: unit === 'inches' ? '8.5"' : '21.5 cm' },
    { size: 'S', chest: unit === 'inches' ? '40"' : '102 cm', length: unit === 'inches' ? '28"' : '71 cm', shoulder: unit === 'inches' ? '19"' : '48 cm', sleeve: unit === 'inches' ? '9.0"' : '23.0 cm' },
    { size: 'M', chest: unit === 'inches' ? '42"' : '107 cm', length: unit === 'inches' ? '29"' : '74 cm', shoulder: unit === 'inches' ? '20"' : '51 cm', sleeve: unit === 'inches' ? '9.5"' : '24.0 cm' },
    { size: 'L', chest: unit === 'inches' ? '44"' : '112 cm', length: unit === 'inches' ? '30"' : '76 cm', shoulder: unit === 'inches' ? '21"' : '53 cm', sleeve: unit === 'inches' ? '10.0"' : '25.5 cm' },
    { size: 'XL', chest: unit === 'inches' ? '47"' : '119 cm', length: unit === 'inches' ? '31"' : '79 cm', shoulder: unit === 'inches' ? '22"' : '56 cm', sleeve: unit === 'inches' ? '10.5"' : '26.5 cm' },
    { size: 'XXL', chest: unit === 'inches' ? '50"' : '127 cm', length: unit === 'inches' ? '32"' : '81 cm', shoulder: unit === 'inches' ? '23"' : '58 cm', sleeve: unit === 'inches' ? '11.0"' : '28.0 cm' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl bg-[#0e0e0e] border border-white/10 rounded-lg p-6 sm:p-8 shadow-2xl text-neutral-200"
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Ruler size={18} className="text-snake-green" />
              <h3 className="font-mono text-sm tracking-widest uppercase text-white font-bold">
                SIZE GUIDE — {fitType.toUpperCase()} FIT
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex justify-between items-center mb-6 text-xs font-mono">
            <span className="text-neutral-400">MEASUREMENTS IN:</span>
            <div className="flex bg-neutral-900 border border-white/10 rounded p-0.5">
              <button
                onClick={() => setUnit('inches')}
                className={`px-3 py-1 rounded transition-colors ${
                  unit === 'inches' ? 'bg-snake-green text-black font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                INCHES
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded transition-colors ${
                  unit === 'cm' ? 'bg-snake-green text-black font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                CM
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400">
                  <th className="py-2.5 px-3">SIZE</th>
                  <th className="py-2.5 px-3">CHEST</th>
                  <th className="py-2.5 px-3">LENGTH</th>
                  <th className="py-2.5 px-3">SHOULDER</th>
                  <th className="py-2.5 px-3">SLEEVE</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr
                    key={row.size}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-3 text-white font-bold">{row.size}</td>
                    <td className="py-3 px-3 text-neutral-300">{row.chest}</td>
                    <td className="py-3 px-3 text-neutral-300">{row.length}</td>
                    <td className="py-3 px-3 text-neutral-300">{row.shoulder}</td>
                    <td className="py-3 px-3 text-neutral-300">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fit Tip */}
          <div className="mt-6 p-3.5 bg-neutral-900 border border-white/5 rounded text-[11px] font-mono text-neutral-400 space-y-1">
            <p className="text-white font-medium">HOW WE FIT:</p>
            <p>
              Our {fitType} cut is designed with intentional drop shoulders and architectural chest room. If you prefer a closer, traditional fit, we recommend sizing down one size.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
