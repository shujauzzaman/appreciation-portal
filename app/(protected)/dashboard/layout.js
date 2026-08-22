"use client";

import { useRequireAdmin } from "@/app/hooks/useRequireAdmin";

export default function DashboardLayout({ children }) {
  const { checkingAdmin } = useRequireAdmin();

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-[#001c7f] font-black uppercase tracking-wider text-sm">
          Checking permissions...
        </p>
      </div>
    );
  }

  return children;
}