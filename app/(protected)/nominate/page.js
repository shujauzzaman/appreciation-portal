"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
export const dynamic = 'force-dynamic';

// Available badges configuration for the dropdown
const availableBadges = [
  { id: 'innovation', name: 'Innovation Badge', color: 'bg-red-500' },
  { id: 'teamwork', name: 'Teamwork Badge', color: 'bg-cyan-500' },
  { id: 'customers', name: 'Customers Badge', color: 'bg-indigo-500' },
  { id: 'urgency', name: 'Urgency Badge', color: 'bg-orange-500' },
  { id: 'quality', name: 'Quality Badge', color: 'bg-green-500' },
  { id: 'all', name: 'General/All Badge', color: 'bg-blue-500' },
];

// ================= INNER COMPONENT: Actually uses useSearchParams =================
function NominateForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL parameters se selected badge read karna (e.g., ?badge=innovation)
  const badgeFromUrl = searchParams.get('badge') || 'innovation';

  // Form States
  const [selectedBadge, setSelectedBadge] = useState(badgeFromUrl);
  const [nomineeName, setNomineeName] = useState('Muhammad Muhammad'); // Default nominee
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Agar URL mein badge change ho toh state update ho jaye
  useEffect(() => {
    if (badgeFromUrl) {
      setSelectedBadge(badgeFromUrl);
    }
  }, [badgeFromUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for nomination!");
      return;
    }

    // Yahan aap apna API call ya state saving logic likh sakte hain
    setSubmitted(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 mt-10">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">
                Submit Nomination
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Recognize your teammate's great work.
              </p>
              <hr className="border-t border-gray-100 mt-4" />
            </div>

            {/* Nominee Field */}
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                Nominee Name
              </label>
              <input
                type="text"
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-blue-500"
                placeholder="Who are you nominating?"
                required
              />
            </div>

            {/* Dynamic Selected Badge Field */}
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                Selected Badge
              </label>
              <div className="relative">
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-blue-500 appearance-none capitalize"
                >
                  {availableBadges.map((badge) => (
                    <option key={badge.id} value={badge.id}>
                      {badge.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                  ▼
                </div>
              </div>
            </div>

            {/* Reason / Message Area */}
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                Why do they deserve this?
              </label>
              <textarea
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-gray-700 focus:outline-none focus:border-blue-500 placeholder-gray-400"
                placeholder="Share details about their contribution, impact, or teamwork..."
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#001c7f] text-white font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-blue-900 transition-colors"
            >
              Submit Nomination
            </button>
          </form>
        ) : (
          /* Success State after submission */
          <div className="text-center py-8 space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500 drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase">Nomination Sent!</h2>
              <p className="text-gray-500 mt-2 font-medium">
                Thank you for nominating <span className="font-bold text-gray-800">{nomineeName}</span> for the <span className="font-bold text-gray-800 capitalize">{selectedBadge} Badge</span>.
              </p>
            </div>
            <hr className="border-t border-gray-100" />
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setReason('');
                  setSubmitted(false);
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Nominate Someone Else
              </button>
              <Link
                href="/"
                className="w-full py-3 bg-[#001c7f] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors block text-center"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ================= OUTER PAGE: wraps the form in Suspense =================
export default function NominatePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Bar */}
      <div className="w-full h-16 bg-[#001c7f] flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 text-white font-bold hover:underline">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <Suspense fallback={
        <div className="max-w-xl mx-auto px-4 mt-10 text-center text-gray-400 font-bold">
          Loading...
        </div>
      }>
        <NominateForm />
      </Suspense>
    </div>
  );
}