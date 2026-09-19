'use client';

import React, { useState, useMemo } from 'react';
import {
  Mail,
  Search,
  Download,
  Trash2,
  Plus,
  Check,
  UserCheck,
  Calendar,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminMembershipPage() {
  const { subscribers, addSubscriber, deleteSubscriber } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addStatus, setAddStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Filter subscribers based on search query
  const filteredSubscribers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(query));
  }, [subscribers, searchQuery]);

  // Handle Manual Member Add
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsAdding(true);
    setAddStatus('idle');

    try {
      const ok = await addSubscriber(clean);
      if (ok) {
        setAddStatus('success');
        setNewEmail('');
        setTimeout(() => setAddStatus('idle'), 3000);
      } else {
        setAddStatus('error');
      }
    } catch (err) {
      setAddStatus('error');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Delete Member
  const handleDelete = async (id: string, email: string) => {
    if (confirm(`Remove "${email}" from the private membership roster?`)) {
      await deleteSubscriber(id);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('No members available to export.');
      return;
    }

    const headers = ['Email', 'Joined Date', 'Source', 'Status'];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.createdAt}"`,
      `"${s.source || 'Footer Snake Pit Roster'}"`,
      '"ACTIVE"',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supersnake_membership_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-mono max-w-6xl">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail size={16} className="text-snake-green" />
            <span className="text-[10px] tracking-[0.3em] text-snake-green uppercase">
              PATRON ACQUISITION &amp; ROSTER
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            MEMBERSHIP ROSTER
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            All users who registered through the <strong>&ldquo;ENTER THE SNAKE PIT&rdquo;</strong> footer membership space.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-2 transition-colors"
          >
            <Download size={14} className="text-snake-green" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 p-5 rounded-lg space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">
            TOTAL MEMBERS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white">
              {subscribers.length}
            </span>
            <span className="text-[10px] text-snake-green">REGISTERED</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 p-5 rounded-lg space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">
            ROSTER TIER
          </span>
          <div className="flex items-center gap-2">
            <UserCheck size={20} className="text-snake-green" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              SNAKE PIT ACCESS
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0d0d0d] border border-neutral-800/80 p-5 rounded-lg space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">
            LATEST SIGNUP
          </span>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-neutral-500" />
            <span className="text-xs text-white truncate">
              {subscribers.length > 0
                ? new Date(subscribers[0].createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'No members yet'}
            </span>
          </div>
        </div>
      </div>

      {/* Add Member Manually Form */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-5 space-y-3">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Plus size={14} className="text-snake-green" />
          <span>MANUALLY ADD MEMBER</span>
        </span>
        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="patron@example.com"
            required
            className="flex-1 bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 rounded text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="px-5 py-2 bg-snake-green hover:bg-white text-black text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isAdding ? 'ADDING...' : 'ENROLL MEMBER'}
          </button>
        </form>
        {addStatus === 'success' && (
          <span className="text-xs text-snake-green flex items-center gap-1">
            <Check size={12} />
            <span>Member successfully added to the private roster.</span>
          </span>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member email..."
            className="w-full bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 pl-9 rounded text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        </div>

        <span className="text-xs text-neutral-500">
          SHOWING {filteredSubscribers.length} OF {subscribers.length} MEMBERS
        </span>
      </div>

      {/* Members Table */}
      {subscribers.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-16 text-center space-y-3">
          <Mail size={36} className="mx-auto text-neutral-600" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            NO MEMBERS IN ROSTER YET
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            When visitors enter their email address in the footer &ldquo;ENTER THE SNAKE PIT&rdquo; section on the website, their submissions will automatically appear here in real time.
          </p>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg p-12 text-center text-xs text-neutral-500">
          No members matched your search for &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">EMAIL ADDRESS</th>
                <th className="py-3 px-4">JOINED DATE</th>
                <th className="py-3 px-4">ORIGIN</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredSubscribers.map((member) => (
                <tr key={member.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {member.email}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">
                    {new Date(member.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">
                    <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                      {member.source || 'Footer Snake Pit Roster'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-snake-green bg-snake-green/10 border border-snake-green/30 px-2 py-0.5 rounded font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-snake-green" />
                      ACTIVE MEMBER
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(member.id, member.email)}
                      title="Remove Member"
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
