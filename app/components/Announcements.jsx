"use client";
import React from 'react';

// TODO: switch back to live Firestore data once announcement creation is built.
// When ready, replace this static array with:
//   import { fetchAnnouncements } from "@/app/services/announcements";
//   const [announcements, setAnnouncements] = useState([]);
//   useEffect(() => { fetchAnnouncements().then(setAnnouncements); }, []);
const STATIC_ANNOUNCEMENTS = [
  { id: 1, text: "Workshop XX planned on 00-00-0000 at location X, Y, Z." },
  { id: 2, text: "Office will remain closed on 00-00-0000 on the eve of eid" },
];

export default function Announcements() {
  return (
    <div className="bg-white border-2 border-[#001c7f] rounded-lg p-5 shadow-sm">
      <h3 className="text-[#001c7f] font-black text-base tracking-wider uppercase border-b-2 border-dashed border-[#001c7f]/30 pb-2 mb-3">
        Announcements
      </h3>
      <div className="space-y-4 text-xs text-gray-800 font-bold">
        {STATIC_ANNOUNCEMENTS.map((a, i) => (
          <div key={a.id} className={i > 0 ? "border-t border-[#001c7f]/20 pt-3" : ""}>
            <p className="text-[#001c7f] text-sm leading-relaxed">{a.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}