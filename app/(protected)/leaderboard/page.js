"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getLeaderboard } from '@/app/services/leaderboard';

function splitName(name) {
  if (!name) return ["—", ""];
  const parts = name.trim().split(/\s+/);
  return [parts[0], parts.slice(1).join(" ")];
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('month');
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard(activeTab)
      .then((data) => { if (!cancelled) setRankings(data); })
      .catch((err) => console.error("Error loading leaderboard:", err));
    return () => { cancelled = true; };
  }, [activeTab]);

  const first = rankings[0];
  const second = rankings[1];
  const third = rankings[2];
  const fourth = rankings[3];
  const fifth = rankings[4];
  const [firstLine1, firstLine2] = splitName(first?.name);
  const [secondLine1, secondLine2] = splitName(second?.name);
  const [thirdLine1, thirdLine2] = splitName(third?.name);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Top Header Bar */}
      <div className="w-full h-16 bg-[#001c7f] flex items-center px-6">
        {/* Back to Home Button */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold hover:underline">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-4xl mx-auto p-4 mt-6 space-y-6">
        
        {/* 1. Header Information Box */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-100 shadow-lg shadow-gray-100/50">
          <h2 className="text-[#001c7f] font-black text-xl tracking-wide">
            Leaderboard
          </h2>
          <p className="text-gray-500 font-bold text-sm mt-1.5 leading-relaxed">
            Check latest ranking based upon reward, recogniton and employee engagement
          </p>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="bg-white rounded-xl border-2 border-gray-100 shadow-lg shadow-gray-100/50 flex justify-around items-center overflow-hidden">
          {[
            { id: 'month', label: 'This Month' },
            { id: 'quarter', label: 'This Quarter' },
            { id: 'year', label: 'This Year' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full py-4 text-center font-black text-sm md:text-base tracking-wider uppercase transition-all relative ${
                activeTab === tab.id 
                  ? 'text-[#001c7f]' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-[#001c7f] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* 3. Top 3 Winners Podium Container */}
        <div className="bg-white rounded-xl border-2 border-gray-100 shadow-xl shadow-gray-100/50 p-6 md:p-10">
          <div className="flex items-end justify-center max-w-2xl mx-auto mt-4">
            
            {/* SECOND PLACE */}
            <div className="flex-1 text-center -mr-2 z-10">
              <div className="bg-[#001c7f] text-white rounded-l-2xl rounded-r-none py-6 px-4 shadow-md border-r border-blue-900/40">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-sky-200 relative shadow-inner">
                    {second?.photoURL ? (
                      <img src={second.photoURL} alt={second.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-sky-300"></div>
                        <div className="absolute top-2 left-4 w-10 h-6 bg-white opacity-40 rounded-full"></div>
                        <div className="absolute bottom-0 w-full h-8 bg-green-500 rounded-t-full"></div>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-[#C0C0C0] text-white font-black text-xs sm:text-sm rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    2
                  </div>
                </div>
                <h3 className="mt-4 font-black text-xs sm:text-sm md:text-base tracking-wider uppercase leading-tight">
                  {secondLine1}<br />{secondLine2}
                </h3>
              </div>
            </div>

            {/* FIRST PLACE */}
            <div className="flex-1 text-center z-20 transform -translate-y-2 sm:-translate-y-4 scale-105">
              <div className="bg-[#001473] text-white rounded-2xl py-8 px-4 shadow-2xl border-2 border-white/10">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-sky-200 relative shadow-lg">
                    {first?.photoURL ? (
                      <img src={first.photoURL} alt={first.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-sky-300"></div>
                        <div className="absolute top-2 left-6 w-12 h-7 bg-white opacity-40 rounded-full"></div>
                        <div className="absolute bottom-0 w-full h-10 bg-green-500 rounded-t-full"></div>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-1 w-7 h-7 sm:w-8 sm:h-8 bg-[#FFD000] text-white font-black text-xs sm:text-sm rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    1
                  </div>
                </div>
                <h3 className="mt-4 font-black text-sm sm:text-base md:text-lg tracking-wider uppercase leading-tight">
                  {firstLine1}<br />{firstLine2}
                </h3>
              </div>
            </div>

            {/* THIRD PLACE */}
            <div className="flex-1 text-center -ml-2 z-10">
              <div className="bg-[#001c7f] text-white rounded-r-2xl rounded-l-none py-6 px-4 shadow-md border-l border-blue-900/40">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-sky-200 relative shadow-inner">
                    {third?.photoURL ? (
                      <img src={third.photoURL} alt={third.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-sky-300"></div>
                        <div className="absolute top-2 left-4 w-10 h-6 bg-white opacity-40 rounded-full"></div>
                        <div className="absolute bottom-0 w-full h-8 bg-green-500 rounded-t-full"></div>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-[#CD7F32] text-white font-black text-xs sm:text-sm rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    3
                  </div>
                </div>
                <h3 className="mt-4 font-black text-xs sm:text-sm md:text-base tracking-wider uppercase leading-tight">
                  {thirdLine1}<br />{thirdLine2}
                </h3>
              </div>
            </div>

          </div>
        </div>

        {/* 4. Fourth & Fifth Place List */}
        {(fourth || fifth) && (
          <div className="space-y-3">
            {[fourth, fifth].filter(Boolean).map((emp, i) => {
              const rankNumber = i + 4;
              const initial = (emp.name || "?").trim().charAt(0);
              return (
                <div
                  key={emp.id}
                  className="bg-white rounded-xl border-2 border-gray-100 shadow-lg shadow-gray-100/50 p-4 flex items-center gap-4"
                >
                  <div className="w-8 text-center font-black text-lg text-gray-300">{rankNumber}</div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-sky-200 border-2 border-[#001c7f]/10 flex-shrink-0 flex items-center justify-center">
                    {emp.photoURL ? (
                      <img src={emp.photoURL} alt={emp.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-[#001c7f] text-sm">{initial}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-[#001c7f] text-sm uppercase truncate">{emp.name}</div>
                    {emp.department && (
                      <div className="text-xs text-gray-400 font-bold uppercase truncate">{emp.department}</div>
                    )}
                  </div>
                  <div className="font-black text-[#001c7f] text-sm whitespace-nowrap">{emp.points} pts</div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}