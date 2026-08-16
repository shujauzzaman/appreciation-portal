"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('month');

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
                    <div className="absolute inset-0 bg-sky-300"></div>
                    <div className="absolute top-2 left-4 w-10 h-6 bg-white opacity-40 rounded-full"></div>
                    <div className="absolute bottom-0 w-full h-8 bg-green-500 rounded-t-full"></div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-[#C0C0C0] text-white font-black text-xs sm:text-sm rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    2
                  </div>
                </div>
                <h3 className="mt-4 font-black text-xs sm:text-sm md:text-base tracking-wider uppercase leading-tight">
                  Muhammad<br />Muhammad
                </h3>
              </div>
            </div>

            {/* FIRST PLACE */}
            <div className="flex-1 text-center z-20 transform -translate-y-2 sm:-translate-y-4 scale-105">
              <div className="bg-[#001473] text-white rounded-2xl py-8 px-4 shadow-2xl border-2 border-white/10">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-sky-200 relative shadow-lg">
                    <div className="absolute inset-0 bg-sky-300"></div>
                    <div className="absolute top-2 left-6 w-12 h-7 bg-white opacity-40 rounded-full"></div>
                    <div className="absolute bottom-0 w-full h-10 bg-green-500 rounded-t-full"></div>
                  </div>
                  <div className="absolute bottom-0 right-1 w-7 h-7 sm:w-8 sm:h-8 bg-[#FFD000] text-white font-black text-xs sm:text-sm rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    1
                  </div>
                </div>
                <h3 className="mt-4 font-black text-sm sm:text-base md:text-lg tracking-wider uppercase leading-tight">
                  Muhammad<br />Muhammad
                </h3>
              </div>
            </div>

            {/* THIRD PLACE */}
            <div className="flex-1 text-center -ml-2 z-10">
              <div className="bg-[#001c7f] text-white rounded-r-2xl rounded-l-none py-6 px-4 shadow-md border-l border-blue-900/40">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-sky-200 relative shadow-inner">
                    <div className="absolute inset-0 bg-sky-300"></div>
                    <div className="absolute top-2 left-4 w-10 h-6 bg-white opacity-40 rounded-full"></div>
                    <div className="absolute bottom-0 w-full h-8 bg-green-500 rounded-t-full"></div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-[#CD7F32] text-white font-black text-xs sm:text-sm rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    3
                  </div>
                </div>
                <h3 className="mt-4 font-black text-xs sm:text-sm md:text-base tracking-wider uppercase leading-tight">
                  Muhammad<br />Muhammad
                </h3>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}