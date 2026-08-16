"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export default function HallOfFamePage() {
  const [byMonth, setByMonth] = useState('By Month');
  const [groupByBadges, setGroupByBadges] = useState('Group by Badges');
  const [department, setDepartment] = useState('All Departments');

  // Badge list mockup with precise custom SVGs
  const badgeRows = [
    {
      id: 1,
      badgeName: "Passion To Win!",
      // Custom SVG matching the rough starburst "WIN!" badge
      badgeIcon: (
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md animate-pulse">
            <path d="M 50 5 L 59 18 L 74 12 L 74 28 L 89 28 L 83 43 L 95 50 L 83 57 L 89 72 L 74 72 L 74 88 L 59 82 L 50 95 L 41 82 L 26 88 L 26 72 L 11 72 L 17 57 L 5 50 L 17 43 L 11 28 L 26 28 L 26 12 L 41 18 Z" fill="#0070f3" />
          </svg>
          <span className="absolute text-white font-black text-xs sm:text-sm tracking-tighter rotate-[-15deg] uppercase">Win!</span>
        </div>
      ),
      users: [
        { name: "Muhammad Muhammad", month: "Dec" },
        { name: "Muhammad Muhammad", month: "Jan" },
        { name: "Muhammad Muhammad", month: "Feb" },
        { name: "Muhammad Muhammad", month: "Mar" }
      ]
    },
    {
      id: 2,
      badgeName: "Creative Mind!",
      // Perfectly aligned concentric structures, orbits, bulb, and sparkles
      badgeIcon: (
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Wavy Badge Background */}
            <path 
              d="M 50 4 C 55.4 4 57.8 8.1 61.8 9.1 C 65.9 10.2 69 6.1 73 9.1 C 77 12.2 76 17.3 79 20.4 C 82 23.5 87.1 23.5 89.1 27.6 C 91.1 31.7 88.1 35.8 89.1 39.9 C 90.1 44 94.2 47.1 94.2 51.2 C 94.2 55.3 90.1 58.4 89.1 62.5 C 88.1 66.6 91.1 70.7 89.1 74.8 C 87.1 78.9 82 78.9 79 82 C 76 85.1 77 90.2 73 93.3 C 69 96.4 65.9 92.3 61.8 93.3 C 57.8 94.3 55.4 98.4 50 98.4 C 44.6 98.4 42.2 94.3 38.2 93.3 C 34.1 92.3 31 96.4 27 93.3 C 23 90.2 24 85.1 21 82 C 18 78.9 12.9 78.9 10.9 74.8 C 8.9 70.7 11.9 66.6 10.9 62.5 C 9.9 58.4 5.8 55.3 5.8 51.2 C 5.8 47.1 9.9 44 10.9 39.9 C 11.9 35.8 8.9 31.7 10.9 27.6 C 12.9 23.5 18 23.5 21 20.4 C 24 17.3 23 12.2 27 9.1 C 31 6.1 34.1 10.2 38.2 9.1 C 42.2 8.1 44.6 4 50 4 Z" 
              fill="#C56CE5" 
            />
            
            {/* Inner Thin Wave Outline */}
            <path 
              d="M 50 9 C 54.4 9 56.8 12.6 60.3 13.5 C 63.9 14.4 66.6 10.8 70.1 13.5 C 73.6 16.2 72.7 20.7 75.3 23.4 C 78 26.1 82.5 26.1 84.2 29.7 C 86 33.3 83.3 36.9 84.2 40.5 C 85.1 44.1 88.7 46.8 88.7 50.4 C 88.7 54 85.1 56.7 84.2 60.3 C 83.3 63.9 86 67.5 84.2 71.1 C 82.5 74.7 78 74.7 75.3 77.4 C 72.7 80.1 73.6 84.6 70.1 87.3 C 66.6 90 63.9 86.4 60.3 87.3 C 56.8 88.2 54.4 91.8 50 91.8 C 45.6 91.8 43.2 88.2 39.7 87.3 C 36.1 86.4 33.4 90 29.9 87.3 C 26.4 84.6 27.3 80.1 24.7 77.4 C 22 74.7 17.5 74.7 15.8 71.1 C 14 67.5 16.7 63.9 15.8 60.3 C 14.9 56.7 11.3 54 11.3 50.4 C 11.3 46.8 14.9 44.1 15.8 40.5 C 16.7 36.9 14 33.3 15.8 29.7 C 17.5 26.1 22 26.1 24.7 23.4 C 27.3 20.7 26.4 16.2 29.9 13.5 C 33.4 10.8 36.1 14.4 39.7 13.5 C 43.2 12.6 45.6 9 50 9 Z" 
              stroke="white" 
              strokeWidth="1.5" 
              strokeOpacity="0.8"
            />

            {/* Orbiting Atomic Rings (Perfectly Centered at 50, 50) */}
            <g>
              <ellipse cx="50" cy="50" rx="27" ry="10" transform="rotate(-40 50 50)" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <ellipse cx="50" cy="50" rx="27" ry="10" transform="rotate(40 50 50)" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Center Lightbulb Layer (Centered precisely at x=50) */}
            <g>
              {/* Main Glass Dome and Body */}
              <path 
                d="M36 47 C36 39.27 42.27 33 50 33 C57.73 33 64 39.27 64 47 C64 51.5 61.5 55.5 58.5 58 L58 C59 62 56.5 64 50 64 C43.5 64 41 62 42 58 L41.5 58 C38.5 55.5 36 51.5 36 47 Z" 
                fill="#C56CE5" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinejoin="round" 
              />
              {/* Screw Base Bottom Details */}
              <line x1="45" y1="67.5" x2="55" y2="67.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="47.5" y1="71" x2="52.5" y2="71" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* Lightbulb Internal Filaments */}
              <path d="M41.5 42.5 C43 39 47 37.5 50 37.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Horizontal Lateral Rays */}
              <line x1="31.5" y1="47" x2="34" y2="47" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="66" y1="47" x2="68.5" y2="47" stroke="white" strokeWidth="2" strokeLinecap="round" />
              
              {/* Top Vertical Ray */}
              <line x1="50" y1="28" x2="50" y2="30.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Four Crisp Sparkles in the corners */}
            {/* Top Left Sparkle */}
            <g transform="translate(26, 26)">
              <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill="white" />
            </g>
            {/* Top Right Sparkle */}
            <g transform="translate(74, 26)">
              <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill="white" />
            </g>
            {/* Bottom Left Sparkle */}
            <g transform="translate(26, 74)">
              <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill="white" />
            </g>
            {/* Bottom Right Sparkle */}
            <g transform="translate(74, 74)">
              <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill="white" />
            </g>
          </svg>
        </div>
      ),
      users: [
        { name: "Muhammad Muhammad", month: "Dec" },
        { name: "Muhammad Muhammad", month: "Jan" },
        { name: "Muhammad Muhammad", month: "Feb" },
        { name: "Muhammad Muhammad", month: "Mar" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Top Header Bar */}
      <div className="w-full h-16 bg-[#001c7f] flex items-center px-6">
        <Link
          href="/home"
          className="text-white font-black text-lg tracking-widest uppercase flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Hall Of Fame Main Card */}
      <div className="w-full max-w-6xl mx-auto p-4 mt-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-xl p-6 md:p-8 space-y-8">
          
          {/* Header Title */}
          <div>
            <h1 className="text-gray-900 font-black text-2xl md:text-3xl tracking-wider uppercase">
              Hall of Fame
            </h1>
            <hr className="border-t border-gray-200 mt-4" />
          </div>

          {/* 1. Yearly Winners (Top Row) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto py-4">
            {[2023, 2024, 2025].map((year) => (
              <div key={year} className="flex items-center gap-4 justify-center md:justify-start">
                {/* Profile Placeholder Avatar */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-100 overflow-hidden bg-sky-200 shadow-md flex-shrink-0">
                  <div className="absolute inset-0 bg-sky-300"></div>
                  <div className="absolute bottom-0 w-full h-10 bg-green-500 rounded-t-full"></div>
                  <div className="absolute top-2 left-4 w-10 h-6 bg-white opacity-40 rounded-full"></div>
                </div>
                {/* Profile Details */}
                <div className="text-left">
                  <h3 className="font-black text-gray-900 text-sm sm:text-base leading-tight uppercase">
                    Muhammad<br />Muhammad
                  </h3>
                  <p className="text-gray-500 font-bold text-xs sm:text-sm mt-1">
                    Year {year}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-t border-gray-200" />

          {/* 2. Dropdown Filters Row */}
          <div className="flex flex-wrap gap-3">
            {/* By Month Dropdown */}
            <div className="relative">
              <button className="bg-[#001c7f] text-white px-5 py-2.5 rounded-full font-black text-xs md:text-sm tracking-wider uppercase flex items-center gap-2 shadow-md min-w-[140px] justify-between">
                <span>{byMonth}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Group by Badges Dropdown */}
            <div className="relative">
              <button className="bg-[#001c7f] text-white px-5 py-2.5 rounded-full font-black text-xs md:text-sm tracking-wider uppercase flex items-center gap-2 shadow-md min-w-[170px] justify-between">
                <span>{groupByBadges}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* All Departments Dropdown */}
            <div className="relative">
              <button className="bg-[#001c7f] text-white px-5 py-2.5 rounded-full font-black text-xs md:text-sm tracking-wider uppercase flex items-center gap-2 shadow-md min-w-[170px] justify-between">
                <span>{department}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Badge Winners Grid Rows */}
          <div className="space-y-8 pt-4">
            {badgeRows.map((row) => (
              <div key={row.id} className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  
                  {/* Left Column: Badge Icon & Badge Name */}
                  <div className="flex items-center gap-4 w-full md:w-56 flex-shrink-0">
                    {row.badgeIcon}
                    <h3 className="font-black text-gray-900 text-sm sm:text-base uppercase leading-snug">
                      {row.badgeName}
                    </h3>
                  </div>

                  {/* Right Column: List of Winners for this badge */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                    {row.users.map((user, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {/* Winner's Avatar */}
                        <div className="relative w-12 h-12 rounded-full border-2 border-gray-100 overflow-hidden bg-sky-200 shadow-sm flex-shrink-0">
                          <div className="absolute inset-0 bg-sky-300"></div>
                          <div className="absolute bottom-0 w-full h-5 bg-green-500 rounded-t-full"></div>
                        </div>
                        {/* Winner Details */}
                        <div className="text-left">
                          <h4 className="font-black text-gray-900 text-[10px] sm:text-xs uppercase leading-tight">
                            Muhammad<br />Muhammad
                          </h4>
                          <span className="text-gray-400 font-bold text-[9px] sm:text-[10px] uppercase block mt-0.5">
                            {user.month}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}