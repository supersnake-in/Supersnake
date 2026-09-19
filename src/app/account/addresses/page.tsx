'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Check, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { Address } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export default function AccountAddressesPage() {
  const { profile } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [postOffices, setPostOffices] = useState<Array<{ name: string; branchType?: string; deliveryStatus?: string }>>([]);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('supersnake_user_addresses');
      if (saved) {
        setAddresses(JSON.parse(saved));
      } else if (profile?.fullName) {
        // Initial empty or placeholder
        setAddresses([]);
      }
    } catch (e) {}
  }, [profile]);

  const lookupPincode = async (code: string) => {
    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setPostOffices([]);
      setPincodeMessage(null);
      return;
    }

    setIsFetchingPincode(true);
    setPincodeMessage(null);

    try {
      let data: any = null;
      try {
        const res = await fetch(`/api/pincode/${cleanCode}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {}

      if (!data || !data.success) {
        try {
          const directRes = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`);
          if (directRes.ok) {
            const directData = await directRes.json();
            if (Array.isArray(directData) && directData[0]?.Status === 'Success' && directData[0]?.PostOffice?.length) {
              const rawPOs = directData[0].PostOffice;
              data = {
                success: true,
                district: rawPOs[0].District || rawPOs[0].Division || '',
                state: rawPOs[0].State || '',
                postOffices: rawPOs.map((po: any) => ({
                  name: po.Name,
                  branchType: po.BranchType || '',
                  deliveryStatus: po.DeliveryStatus || '',
                })),
              };
            }
          }
        } catch (directErr) {}
      }

      if (data && data.success && Array.isArray(data.postOffices) && data.postOffices.length > 0) {
        const district = data.district || '';
        const stateName = data.state || '';
        const poList = data.postOffices;

        // Prioritize delivery post offices, then alphabetical
        const sortedPOs = [...poList].sort((a: any, b: any) => {
          if (a.deliveryStatus === 'Delivery' && b.deliveryStatus !== 'Delivery') return -1;
          if (a.deliveryStatus !== 'Delivery' && b.deliveryStatus === 'Delivery') return 1;
          return a.name.localeCompare(b.name);
        });

        setPostOffices(sortedPOs);
        if (district) setCity(district);
        if (stateName) setState(stateName);

        if (sortedPOs.length === 1) {
          setPostOffice(sortedPOs[0].name);
        } else if (!sortedPOs.some((p: any) => p.name === postOffice)) {
          setPostOffice('');
        }

        if (poList.length > 1) {
          setPincodeMessage(`${poList.length} post offices found. Select yours from the dropdown.`);
        } else {
          setPincodeMessage(null);
        }
      } else {
        setPostOffices([]);
        setPincodeMessage('PIN code not found. You can enter City and State manually.');
      }
    } catch (error) {
      console.error('Failed to lookup PIN code:', error);
      setPincodeMessage(null);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPostalCode(val);
    if (val.length === 6) {
      lookupPincode(val);
    } else {
      if (postOffices.length > 0) setPostOffices([]);
      if (pincodeMessage) setPincodeMessage(null);
    }
  };

  const saveAddressesToStorage = (list: Address[]) => {
    setAddresses(list);
    try {
      localStorage.setItem('supersnake_user_addresses', JSON.stringify(list));
    } catch (e) {}
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFullName(profile?.fullName || '');
    setPhone(profile?.phone || '');
    setStreet('');
    setLandmark('');
    setCity('');
    setState('');
    setPostalCode('');
    setPostOffice('');
    setPostOffices([]);
    setPincodeMessage(null);
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingId(addr.id || null);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setPostOffice(addr.postOffice || '');
    setPostOffices([]);
    setPincodeMessage(null);
    setIsDefault(addr.isDefault || false);
    if (addr.postalCode && addr.postalCode.length === 6) {
      lookupPincode(addr.postalCode);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    const next = addresses.filter((a) => a.id !== id);
    saveAddressesToStorage(next);
  };

  const handleSetDefault = (id?: string) => {
    if (!id) return;
    const next = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddressesToStorage(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAddr: Address = {
      id: editingId || `addr-${Date.now()}`,
      fullName,
      phone,
      street,
      landmark,
      city,
      state,
      postalCode,
      postOffice: postOffice || undefined,
      isDefault,
    };

    let nextList: Address[] = [];
    if (editingId) {
      nextList = addresses.map((a) => (a.id === editingId ? newAddr : a));
    } else {
      nextList = [...addresses, newAddr];
    }

    if (isDefault) {
      nextList = nextList.map((a) => ({
        ...a,
        isDefault: a.id === newAddr.id,
      }));
    }

    saveAddressesToStorage(nextList);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-snake-green uppercase">
            LOGISTICS DIRECTORY
          </span>
          <h2 className="text-xl md:text-2xl font-display font-medium text-white">
            SAVED ADDRESSES ({addresses.length})
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-white hover:bg-snake-green text-black font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>ADD NEW</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/10 p-12 text-center space-y-4 rounded-sm">
          <MapPin size={32} className="mx-auto text-neutral-600" />
          <h3 className="text-base font-display text-white font-medium">NO SAVED ADDRESSES</h3>
          <p className="text-xs font-mono text-neutral-500 max-w-sm mx-auto">
            Store your delivery destinations for rapid checkout and express atelier dispatch.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-block mt-2 px-6 py-3 bg-white/10 hover:bg-snake-green hover:text-black text-white font-mono text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            ADD FIRST ADDRESS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-[#0a0a0a] border p-5 rounded-sm space-y-4 relative transition-colors ${
                addr.isDefault ? 'border-snake-green/60' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {addr.isDefault && (
                <span className="absolute top-4 right-4 text-[9px] font-mono px-2 py-0.5 bg-snake-green/10 text-snake-green border border-snake-green/30 uppercase tracking-widest">
                  DEFAULT
                </span>
              )}

              <div className="space-y-1 text-xs font-mono">
                <p className="text-white font-semibold text-sm font-display">{addr.fullName}</p>
                <p className="text-neutral-400">{addr.street}</p>
                {addr.landmark && <p className="text-neutral-500">{addr.landmark}</p>}
                <p className="text-neutral-400">
                  {addr.postOffice ? `${addr.postOffice}, ` : ''}{addr.city}, {addr.state} - {addr.postalCode}
                </p>
                <p className="text-neutral-500 pt-1">Phone: {addr.phone}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-neutral-500 hover:text-snake-green transition-colors text-[11px]"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-snake-green text-[11px] flex items-center gap-1">
                    <Check size={12} /> Default Address
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/10 p-6 md:p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display font-medium text-white text-base">
                {editingId ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">
                  Street Address / Studio
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  placeholder="Apartment, building, street"
                  className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near..."
                    className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1 flex items-center justify-between">
                    <span>PIN Code *</span>
                    {isFetchingPincode && (
                      <span className="text-[9px] text-snake-green font-mono flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" />
                        Detecting...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={handlePostalCodeChange}
                    required
                    maxLength={6}
                    placeholder="560094"
                    className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green font-mono"
                  />
                </div>
              </div>

              {pincodeMessage && (
                <p className={`text-[10px] font-mono ${postOffices.length > 1 ? 'text-snake-green' : 'text-neutral-400'}`}>
                  {pincodeMessage}
                </p>
              )}

              {/* Post Office Dropdown when 2 or more exist */}
              {postOffices.length > 1 && (
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white mb-1 flex items-center justify-between">
                    <span>Select Post Office / Area *</span>
                    <span className="text-[9px] text-snake-green font-mono">{postOffices.length} found</span>
                  </label>
                  <div className="relative">
                    <select
                      value={postOffice}
                      onChange={(e) => setPostOffice(e.target.value)}
                      required
                      className="w-full bg-[#121212] border border-snake-green/60 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green appearance-none pr-8 cursor-pointer"
                    >
                      <option value="" disabled className="bg-black text-neutral-500">
                        -- Select Post Office --
                      </option>
                      {postOffices.map((po) => (
                        <option key={po.name} value={po.name} className="bg-neutral-900 text-white">
                          {po.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-snake-green pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Single Post Office display if 1 found */}
              {postOffices.length === 1 && (
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1 flex items-center justify-between">
                    <span>Post Office / Area</span>
                    <span className="text-[9px] text-snake-green font-mono">Auto-detected</span>
                  </label>
                  <input
                    type="text"
                    value={postOffice}
                    onChange={(e) => setPostOffice(e.target.value)}
                    className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1 flex items-center justify-between">
                    <span>City / District *</span>
                    {city && <span className="text-[9px] text-snake-green font-mono">Auto-filled</span>}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1 flex items-center justify-between">
                    <span>State *</span>
                    {state && <span className="text-[9px] text-snake-green font-mono">Auto-filled</span>}
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full bg-[#121212] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-snake-green"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded-none bg-[#121212] border-white/20 text-snake-green focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-neutral-300">
                    Set as default delivery address
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 border border-white/20 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-white hover:bg-snake-green text-black font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  SAVE ADDRESS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
