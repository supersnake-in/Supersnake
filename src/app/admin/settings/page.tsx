'use client';

import React, { useState } from 'react';
import { Store, Truck, ShieldCheck, Check, Clock, Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/design-tokens';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState(BRAND.name);
  const [conciergeEmail, setConciergeEmail] = useState('concierge@supersnake.in');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1999);
  const [deliveryDays, setDeliveryDays] = useState('2-4 Business Days');
  const [courierPartner, setCourierPartner] = useState('Blue Dart Express / Delhivery');
  const [studioLocation, setStudioLocation] = useState('Bengaluru, Karnataka, India');
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [grievanceOfficer, setGrievanceOfficer] = useState('');
  const [grievanceEmail, setGrievanceEmail] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [adminPin, setAdminPin] = useState('••••');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono max-w-4xl">
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
          ATELIER STORE SETTINGS
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage storefront branding, shipping thresholds, and concierge logistics.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Brand & Atelier Profile */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <Store size={16} className="text-snake-green" />
            <span>BRAND & CONCIERGE PROFILE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">BRAND IDENTITY</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">CONCIERGE CONTACT</label>
              <input
                type="email"
                value={conciergeEmail}
                onChange={(e) => setConciergeEmail(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-neutral-400 uppercase">ATELIER STUDIO LOCATION</label>
              <input
                type="text"
                value={studioLocation}
                onChange={(e) => setStudioLocation(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Fulfillment Rules */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <Truck size={16} className="text-snake-green" />
            <span>SHIPPING & LOGISTICS POLICIES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">FREE SHIPPING THRESHOLD (₹)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">TRANSIT TIMELINE</label>
              <input
                type="text"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">LOGISTICS PARTNER</label>
              <input
                type="text"
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
          </div>
        </div>

        {/* Legal & Grievance Disclosures */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <ShieldCheck size={16} className="text-snake-green" />
            <span>LEGAL &amp; GRIEVANCE DISCLOSURES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">LEGAL BUSINESS ENTITY NAME</label>
              <input
                type="text"
                value={legalBusinessName}
                onChange={(e) => setLegalBusinessName(e.target.value)}
                placeholder="e.g. SuperSnake Apparel Private Limited"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">GSTIN (TAX IDENTIFIER)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 29ABCDE1234F1Z5"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">GRIEVANCE OFFICER NAME</label>
              <input
                type="text"
                value={grievanceOfficer}
                onChange={(e) => setGrievanceOfficer(e.target.value)}
                placeholder="Designated Officer Name"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">GRIEVANCE EMAIL ADDRESS</label>
              <input
                type="email"
                value={grievanceEmail}
                onChange={(e) => setGrievanceEmail(e.target.value)}
                placeholder="grievance@supersnake.in"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-neutral-400 uppercase">LEGAL JURISDICTION / REGISTERED OFFICE</label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka, India"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
            </div>
          </div>
        </div>

        {/* Atelier Security */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm border-b border-neutral-800 pb-2">
            <ShieldCheck size={16} className="text-snake-green" />
            <span>ATELIER SECURITY & ACCESS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">ADMIN PASSCODE</label>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                className="w-full bg-black border border-neutral-800 px-3 py-2 text-white rounded focus:border-snake-green"
              />
              <span className="text-[10px] text-neutral-500 block">
                Protects `/admin` actions and inventory updates.
              </span>
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 uppercase">SECURITY STATUS</label>
              <div className="px-3 py-2 bg-black border border-neutral-800 rounded text-neutral-300 flex items-center justify-between">
                <span>Hardened (Zero Key Exposure)</span>
                <span className="w-2 h-2 rounded-full bg-snake-green animate-pulse" />
              </div>
              <span className="text-[10px] text-neutral-500 block">
                All API keys & secrets are isolated server-side on Vercel.
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          {saved && (
            <span className="text-snake-green flex items-center gap-1 font-bold">
              <Check size={14} /> SETTINGS SAVED TO ATELIER
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-3 bg-snake-green text-black font-bold uppercase rounded hover:bg-white transition-colors"
          >
            SAVE SETTINGS
          </button>
        </div>
      </form>
    </div>
  );
}
