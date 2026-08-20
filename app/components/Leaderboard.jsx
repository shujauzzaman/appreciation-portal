"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllTimeLeaderboard } from '@/app/services/leaderboard';

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getAllTimeLeaderboard(6)
      .then((data) => { if (!cancelled) setEntries(data); })
      .catch((err) => console.error("Error loading leaderboard:", err));
    return () => { cancelled = true; };
  }, []);

  const rows = entries.length > 0
    ? entries.map((emp, i) => ({ rank: MEDALS[i] || "", name: emp.name || "EMPLOYEE NAME" }))
    : Array.from({ length: 6 }, (_, i) => ({ rank: MEDALS[i] || "", name: "—" }));

  return (
    <Link href="/leaderboard" className="block cursor-pointer hover:scale-[1.01] transition-transform duration-150">
      <div className="bg-[#001c7f] text-white rounded-lg p-5 shadow-sm border-2 border-[#001c7f]">
        <h3 className="text-center font-black tracking-wider text-base uppercase mb-4 flex items-center justify-center gap-2">
          Leaderboard <span className="text-[10px] font-bold text-blue-300 normal-case">(Click to view)</span>
        </h3>
        <div className="space-y-2.5">
          {rows.map((emp, i) => (
            <div key={i} className="bg-white text-[#001c7f] font-black text-sm py-2 px-4 rounded-full flex items-center justify-between shadow-inner border border-[#001c7f]/10">
              <span className="flex items-center gap-2">
                {emp.rank && <span className="text-base">{emp.rank}</span>}
                <span>{emp.name}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}