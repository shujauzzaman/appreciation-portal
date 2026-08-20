"use client";
import { useRedirectIfAuthed } from "@/app/hooks/useRedirectIfAuthed";

export default function AuthLayout({ children }) {
  const { checkingAuth } = useRedirectIfAuthed("/home");

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-[#0c108c] font-black uppercase tracking-wider text-sm">Loading...</p>
      </div>
    );
  }

  return children;
}
