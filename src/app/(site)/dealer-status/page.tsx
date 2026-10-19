'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DealerStatusPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dealer, setDealer] = useState<any>(null);
  const [error, setError] = useState('');

  // Handle Input with Auto-Formatting for CNIC or Normal Text for Email/Phone
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Check if input looks like a CNIC (Starts with digits and contains 13 digits)
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length > 10 && !val.includes('@')) {
      let formatted = digitsOnly;
      if (digitsOnly.length > 13) formatted = digitsOnly.slice(0, 13);

      if (formatted.length > 5 && formatted.length <= 12) {
        formatted = `${formatted.slice(0, 5)}-${formatted.slice(5)}`;
      } else if (formatted.length > 12) {
        formatted = `${formatted.slice(0, 5)}-${formatted.slice(5, 12)}-${formatted.slice(12)}`;
      }
      setQuery(formatted);
    } else {
      setQuery(val);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDealer(null);

    if (!query.trim()) {
      setError('Please enter a valid CNIC, Email, or Phone Number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/dealer?query=${encodeURIComponent(query.trim())}`);
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'No record found.');
      } else {
        setDealer(result.data);
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500 px-4 py-1.5 rounded-full font-bold uppercase text-xs">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-500/20 text-red-300 border border-red-500 px-4 py-1.5 rounded-full font-bold uppercase text-xs">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500 px-4 py-1.5 rounded-full font-bold uppercase text-xs">
            Pending Review
          </span>
        );
    }
  };

  const inputStyle =
    'w-full bg-slate-900/90 border border-indigo-500/40 rounded-2xl px-4 py-3.5 text-white !text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition caret-white dark:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s] text-sm';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 py-16 px-4 text-white flex items-center justify-center">
      <div className="w-full max-w-xl mt-[100px] bg-slate-800/90 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/20">
        
        {/* Header Section */}
        <div className="text-center mb-6">
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text font-bold text-xs tracking-widest uppercase">
            Dealer Status Track
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Check Application Status
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-2">
            Enter your registered CNIC, Email Address, or Phone Number to view your application status.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleCheckStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-white mb-1.5">
              CNIC, Email, or Phone Number *
            </label>
            <input
              type="text"
              required
              maxLength={50}
              style={{ color: '#ffffff' }}
              value={query}
              onChange={handleQueryChange}
              placeholder="e.g., 33303-3332783-9, john@example.com, or +923001234567"
              className={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold rounded-2xl transition duration-300 shadow-lg shadow-indigo-500/30 text-white disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Searching Record...' : 'Check Status'}
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-2xl text-red-100 text-xs font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Status Display Card */}
        {dealer && (
          <div className="mt-8 p-6 bg-slate-900/95 rounded-2xl border border-indigo-500/40 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-indigo-500/20 pb-3">
              <span className="text-xs text-white/70 font-semibold uppercase">
                Application Status
              </span>
              {getStatusBadge(dealer.status)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-2">
              <div>
                <span className="text-gray-400 block text-[11px] uppercase">Applicant Name:</span>
                <span className="font-semibold text-white">{dealer.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px] uppercase">Company Name:</span>
                <span className="font-semibold text-white">{dealer.companyName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px] uppercase">Email Address:</span>
                <span className="font-semibold text-white break-all">{dealer.email}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px] uppercase">CNIC Number:</span>
                <span className="font-semibold text-white">{dealer.cnicNumber}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px] uppercase">Phone Number:</span>
                <span className="font-semibold text-white">{dealer.phoneNumber}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px] uppercase">Submitted Date:</span>
                <span className="font-semibold text-white">
                  {dealer.createdAt ? new Date(dealer.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center text-xs text-white/80">
          <Link
            href="/dealer"
            className="text-indigo-300 underline font-semibold hover:text-white transition"
          >
            &larr; Back to Dealer Registration Form
          </Link>
        </div>
      </div>
    </div>
  );
}