"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Cake, CheckCircle2 } from 'lucide-react';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 60 }, (_, i) => currentYear - i);

export default function OnboardingPage() {
  const router = useRouter();

  // Service Start Date state
  const [serviceYear, setServiceYear] = useState(currentYear.toString());
  const [serviceMonth, setServiceMonth] = useState('January');
  const [serviceDay, setServiceDay] = useState('1');

  // Birthday state (no year needed, generally only month/day for recurring birthday reminders)
  const [birthMonth, setBirthMonth] = useState('January');
  const [birthDay, setBirthDay] = useState('1');

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // TODO: Replace with real API call to persist this to the user's profile, e.g.:
    // await fetch('/api/profile', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     serviceStartDate: { year: serviceYear, month: serviceMonth, day: serviceDay },
    //     birthday: { month: birthMonth, day: birthDay }
    //   })
    // });

    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 900);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-[#001c7f] font-black text-2xl md:text-3xl uppercase tracking-wider">
            Welcome Aboard!
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-2">
            Just a couple of details before you get started.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border-4 border-[#001c7f] rounded-lg shadow-sm p-6 md:p-8 space-y-8"
        >
          {/* ============ Service Start Date ============ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#001c7f]" />
              <h2 className="text-[#001c7f] font-black text-sm md:text-base uppercase tracking-wider">
                Date Work Started at [Company]
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-bold">
              Used for service recognition.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* Year */}
              <div className="relative">
                <select
                  value={serviceYear}
                  onChange={(e) => setServiceYear(e.target.value)}
                  className="w-full appearance-none border-2 border-[#001c7f] rounded-md py-2.5 pl-3 pr-8 text-sm font-black text-[#001c7f] bg-white focus:outline-none cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#001c7f] text-xs">▾</span>
              </div>

              {/* Month */}
              <div className="relative">
                <select
                  value={serviceMonth}
                  onChange={(e) => setServiceMonth(e.target.value)}
                  className="w-full appearance-none border-2 border-[#001c7f] rounded-md py-2.5 pl-3 pr-8 text-sm font-black text-[#001c7f] bg-white focus:outline-none cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#001c7f] text-xs">▾</span>
              </div>

              {/* Day */}
              <div className="relative">
                <select
                  value={serviceDay}
                  onChange={(e) => setServiceDay(e.target.value)}
                  className="w-full appearance-none border-2 border-[#001c7f] rounded-md py-2.5 pl-3 pr-8 text-sm font-black text-[#001c7f] bg-white focus:outline-none cursor-pointer"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#001c7f] text-xs">▾</span>
              </div>
            </div>
          </div>

          {/* ============ Birthday ============ */}
          <div className="space-y-3 border-t-2 border-dashed border-[#001c7f]/20 pt-6">
            <div className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-[#001c7f]" />
              <h2 className="text-[#001c7f] font-black text-sm md:text-base uppercase tracking-wider">
                Birthday
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-bold">
              We'll celebrate with you every year!
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Month */}
              <div className="relative">
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="w-full appearance-none border-2 border-[#001c7f] rounded-md py-2.5 pl-3 pr-8 text-sm font-black text-[#001c7f] bg-white focus:outline-none cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#001c7f] text-xs">▾</span>
              </div>

              {/* Day */}
              <div className="relative">
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-full appearance-none border-2 border-[#001c7f] rounded-md py-2.5 pl-3 pr-8 text-sm font-black text-[#001c7f] bg-white focus:outline-none cursor-pointer"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#001c7f] text-xs">▾</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving || isSaved}
            className="w-full bg-[#001c7f] hover:bg-blue-900 disabled:opacity-70 text-white font-black py-3 rounded-lg text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Saved!</span>
              </>
            ) : isSaving ? (
              <span>Saving...</span>
            ) : (
              <span>Continue to Portal</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}