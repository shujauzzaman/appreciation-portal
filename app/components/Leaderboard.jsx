"use client";
import React from 'react';
import Link from 'next/link';

// TODO: no ranking/points system exists yet. Once one does, replace this
// with a real fetch (e.g. app/services/leaderboard.js) — likely a
// Firestore query ordered by a points field on each employee doc.
const PLACEHOLDER_LEADERBOARD = [
  { rank: "🥇", name: "EMPLOYEE NAME" },
  { rank: "🥈", name: "EMPLOYEE NAME" },
  { rank: "🥉", name: "EMPLOYEE NAME" },
  { rank: "", name: "EMPLOYEE NAME" },
  { rank: "", name: "EMPLOYEE NAME" },
  { rank: "", name: "EMPLOYEE NAME" },
];

export default function Leaderboard() {
  return (
    <Link href="/leaderboard" className="block cursor-pointer hover:scale-[1.01] transition-transform duration-150">
      <div className="bg-[#001c7f] text-white rounded-lg p-5 shadow-sm border-2 border-[#001c7f]">
        <h3 className="text-center font-black tracking-wider text-base uppercase mb-4 flex items-center justify-center gap-2">
          Leaderboard <span className="text-[10px] font-bold text-blue-300 normal-case">(Click to view)</span>
        </h3>
        <div className="space-y-2.5">
          {PLACEHOLDER_LEADERBOARD.map((emp, i) => (
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