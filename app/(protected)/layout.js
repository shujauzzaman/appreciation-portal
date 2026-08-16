"use client";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";

export default function ProtectedLayout({ children }) {
  const { checkingAuth } = useRequireAuth();

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-[#001c7f] font-black uppercase tracking-wider text-sm">Loading...</p>
      </div>
    );
  }

  return children;
}
