"use client";
import React, { useState, useEffect } from 'react';
import { fetchAnnouncements, formatAnnouncementDate } from "@/app/services/announcements";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAnnouncements()
      .then((data) => {
        if (!cancelled) setAnnouncements(data);
      })
      .catch((err) => {
        console.error('Failed to load announcements:', err);
        if (!cancelled) setError('Could not load announcements.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white border-2 border-[#001c7f] rounded-lg p-5 shadow-sm">
      <h3 className="text-[#001c7f] font-black text-base tracking-wider uppercase border-b-2 border-dashed border-[#001c7f]/30 pb-2 mb-3">
        Announcements
      </h3>
      <div className="space-y-4 text-xs text-gray-800 font-bold">
        {isLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : announcements.length === 0 ? (
          <p className="text-gray-400">No announcements yet.</p>
        ) : (
          announcements.map((a, i) => (
            <div key={a.id} className={i > 0 ? "border-t border-[#001c7f]/20 pt-3" : ""}>
              <p className="text-[#001c7f] text-sm leading-relaxed">{a.message}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1.5">
                {formatAnnouncementDate(a.createdAt)}{a.authorName ? ` · ${a.authorName}` : ''}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}