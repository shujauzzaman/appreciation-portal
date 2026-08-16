"use client";
import React, { useState } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image'; 

export default function CelebrationSection() {
  const [wishMessage, setWishMessage] = useState(
    "Congratulations Muhammad Muhammad!So happy to have you around—wishing you continued success and many more achievements ahead."
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= LEFT SIDE: MAIN CELEBRATION CARD ================= */}
        <div className="md:col-span-8 bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-md flex flex-col justify-between">
          
          {/* Header Banner Block */}
          <div className="h-48 md:h-56 w-full relative flex items-end justify-end p-6 overflow-hidden">
            
            {/* Direct String Path from Public Folder */}
            <Image
              src="/congra-bg.png" // Public folder se direct pick karega
              alt="Congratulation Background"
              fill
              priority
              unoptimized // Isko lagane se Next.js image caching ka issue bypass ho jata hai
              className="object-cover z-0"
            />

            {/* Content Overlay */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2 mb-2 mr-2 z-10">
              
              {/* Circular Avatar Frame */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white overflow-hidden bg-sky-100 relative shadow-lg">
                <div className="absolute inset-0 bg-sky-200"></div>
                <div className="absolute bottom-0 w-full h-10 bg-[#8cb811] rounded-t-full"></div>
                <div className="absolute bottom-0 w-full h-6 bg-[#6a9106] rounded-t-full transform translate-y-1 scale-110"></div>
                <div className="absolute top-5 left-7 w-10 h-7 bg-white opacity-90 rounded-full blur-[0.5px]"></div>
                <div className="absolute top-7 left-12 w-8 h-5 bg-white opacity-90 rounded-full blur-[0.5px]"></div>
              </div>

              {/* Name & Greeting Typography */}
              <div className="text-white drop-shadow-md">
                <p className="text-xs md:text-sm font-black uppercase tracking-wider text-white opacity-90">
                  Muhammad Muhammad
                </p>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wide leading-none mt-1">
                  Congratulation!
                </h2>
              </div>

            </div>
          </div>

          {/* Card Body Container */}
          <div className="p-6 space-y-4 flex-grow bg-white">
            <div className="flex items-center gap-4">
              <span className='w-9 h-9'>
                 <img src='trophy.png' className=''/>
              </span>
              
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  It's time to celebrate!
                </h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                  It's time to celebrate!
                </p>
              </div>
            </div>

            <div className="border-2 border-blue-800 rounded-xl p-4 bg-white shadow-sm relative group focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <textarea 
                rows={3}
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                placeholder="Write a sweet message..."
                className="w-full text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none resize-none bg-transparent leading-relaxed"
              />
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <button type="button" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                  <ImageIcon className="w-5 h-5 stroke-[2]" />
                </button>
                <button type="button" className="bg-[#001c7f] hover:bg-blue-900 text-white font-black px-5 py-2 rounded-lg text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all active:scale-95">
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5 fill-white text-[#001c7f]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: CELEBRATIONS SIDEBAR ================= */}
        <div className="md:col-span-4 bg-white border-2 border-gray-100 rounded-xl p-6 shadow-md flex flex-col">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4 pb-3 border-b-2 border-gray-100">
            Celebrations
          </h3>
          <div className="space-y-4">
            {[
              { title: "Congratulate on 3 years!", subtitle: "~ 3 days away" },
              { title: "Send a birthday wish", subtitle: "~ 6 days away" },
              { title: "Congratulate on 5 years!", subtitle: "~ 14 days away" }
            ].map((event, index) => (
              <div key={index} className="border-2 border-gray-100 hover:border-blue-800/20 bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.01]">
                <div className="w-12 h-12 rounded-full border-2 border-gray-200 overflow-hidden bg-sky-50 relative flex-shrink-0">
                  <div className="absolute inset-0 bg-sky-200/50"></div>
                  <div className="absolute bottom-0 w-full h-4 bg-green-500 rounded-t-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-gray-900 truncate tracking-tight">
                    {event.title}
                  </h4>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">
                    {event.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}