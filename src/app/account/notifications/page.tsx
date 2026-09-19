'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Mail, MessageSquare, Sparkles } from 'lucide-react';

export default function AccountNotificationsPage() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [dropAlerts, setDropAlerts] = useState(true);
  const [restockAlerts, setRestockAlerts] = useState(true);
  const [atelierInvites, setAtelierInvites] = useState(false);
  const [smsDelivery, setSmsDelivery] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('supersnake_user_notifications');
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        setOrderUpdates(parsed.orderUpdates ?? true);
        setDropAlerts(parsed.dropAlerts ?? true);
        setRestockAlerts(parsed.restockAlerts ?? true);
        setAtelierInvites(parsed.atelierInvites ?? false);
        setSmsDelivery(parsed.smsDelivery ?? true);
      }
    } catch (e) {}
  }, []);

  const handleSave = () => {
    const prefs = {
      orderUpdates,
      dropAlerts,
      restockAlerts,
      atelierInvites,
      smsDelivery,
    };
    try {
      localStorage.setItem('supersnake_user_notifications', JSON.stringify(prefs));
    } catch (e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
          DISPATCH & ALERTS
        </span>
        <h2 className="text-xl md:text-2xl font-display font-medium text-white">
          NOTIFICATION PREFERENCES
        </h2>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm space-y-6">
        <p className="text-xs font-mono text-neutral-400">
          SuperSnake operates on strict silence. We only send notifications for events that genuinely matter.
        </p>

        {saved && (
          <div className="p-3 bg-snake-green/10 border border-snake-green/30 text-snake-green text-xs font-mono flex items-center gap-2">
            <Check size={15} />
            <span>Notification preferences updated.</span>
          </div>
        )}

        <div className="divide-y divide-white/5 space-y-4">
          {/* Order Updates */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-display font-medium text-white block">
                ORDER & TRANSIT UPDATES
              </span>
              <p className="text-xs font-mono text-neutral-400">
                Receive real-time notifications when your garment is packed, dispatched, and out for delivery.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={orderUpdates}
                onChange={(e) => setOrderUpdates(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#161616] border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-snake-green peer-checked:after:bg-black" />
            </label>
          </div>

          {/* Limited Drop Announcements */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-display font-medium text-white block">
                LIMITED DROP RELEASES
              </span>
              <p className="text-xs font-mono text-neutral-400">
                15-minute early access window before new heavyweight T-shirt cuts launch to the public.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dropAlerts}
                onChange={(e) => setDropAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#161616] border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-snake-green peer-checked:after:bg-black" />
            </label>
          </div>

          {/* Restock Alerts */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-display font-medium text-white block">
                WISHLIST RESTOCK ALERTS
              </span>
              <p className="text-xs font-mono text-neutral-400">
                Immediate ping if an archived piece on your wishlist receives an atelier restock.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={restockAlerts}
                onChange={(e) => setRestockAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#161616] border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-snake-green peer-checked:after:bg-black" />
            </label>
          </div>

          {/* SMS Delivery Alerts */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-display font-medium text-white block">
                SMS DISPATCH PINGS
              </span>
              <p className="text-xs font-mono text-neutral-400">
                Receive courier OTPs and delivery notifications via SMS to your registered phone.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsDelivery}
                onChange={(e) => setSmsDelivery(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#161616] border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-snake-green peer-checked:after:bg-black" />
            </label>
          </div>

          {/* Private Atelier Invites */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-display font-medium text-white block">
                PRIVATE ATELIER INVITATIONS
              </span>
              <p className="text-xs font-mono text-neutral-400">
                Invitations to private exhibitions, physical fitting rooms, and runway showcases in Bengaluru.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={atelierInvites}
                onChange={(e) => setAtelierInvites(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#161616] border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-snake-green peer-checked:after:bg-black" />
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            SAVE PREFERENCES
          </button>
        </div>
      </div>
    </div>
  );
}
