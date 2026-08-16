"use client";
import React from "react";
import Link from 'next/link';

export default function EmployeeRecognitionLanding() {
  return (
    <div className="min-h-screen bg-[#e9eaf0] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#e9eaf0] rounded-2xl overflow-hidden shadow-sm">
        
        {/* ================= HEADER BLUE SECTION ================= */}
        <div className="bg-[#1a0dc9] relative pt-10 pb-10 px-8">
          
          {/* Pepsi Logo Circle - Top Right */}
          <div className="absolute top-6 -right-1 sm:right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-md overflow-hidden border-2 border-gray-100 z-20">
            <img
              src="/pepsi.png"
              alt="Pepsi"
              className="w-full h-full object-cover scale-110"
            />
          </div>

          {/* Title */}
          <h1 className="text-white font-extrabold text-2xl sm:text-4xl text-center leading-tight tracking-tight px-2 sm:px-20">
            Employee Recognition Portal
          </h1>

          {/* Subheading pill */}
          <div className="mt-5 max-w-sm mx-auto border-2 border-purple-400 rounded-md py-2 px-4">
            <p className="text-white text-center font-bold text-base">
              Subheading/tagline etc.
            </p>
          </div>
        </div>

        {/* ================= FEATURE ICONS (no card box, sits below header on grey bg) ================= */}
        <div className="px-8 pt-8">
          <div className="grid grid-cols-3 gap-4">
            
            {/* Appreciate */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 overflow-hidden rounded-2xl">
                <img
                  src="/appericate.png"
                  alt="Appreciate"
                  className="w-full h-full object-cover scale-110 translate-y-1"
                />
              </div>
            </div>

            {/* Nominate */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 overflow-hidden rounded-2xl">
                <img
                  src="/nominate.png"
                  alt="Nominate"
                  className="w-full h-full object-cover scale-110 translate-y-1"
                />
              </div>
            </div>

            {/* Celebrate */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 overflow-hidden rounded-2xl">
                <img
                  src="/cele.png"
                  alt="Celebrate"
                  className="w-full h-full object-cover scale-110 translate-y-1"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="px-8 pt-8 pb-10 flex flex-col gap-5">
          <Link href="/auth/login-form" className="block">
            <button
              type="button"
              className="w-full bg-[#1a0dc9] hover:bg-[#150aa8] text-white font-bold text-sm tracking-wide py-4 rounded-full shadow-sm transition-colors duration-150"
            >
              LOG IN TO YOUR ACCOUNT
            </button>
          </Link>

          <Link href="/auth/register" className="block">
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-50 text-[#1a0dc9] font-bold text-sm tracking-wide py-4 rounded-full border-2 border-[#1a0dc9] shadow-sm transition-colors duration-150"
            >
              CREATE YOUR ACCOUNT
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}