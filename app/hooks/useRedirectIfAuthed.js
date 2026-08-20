"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

/**
 * Guard for "logged-out only" pages (login, register, forgot-password,
 * otp-verification). If a session already exists, redirects to /home
 * instead of rendering the page. This is the mirror image of
 * useRequireAuth, which protects pages that require a session.
 */
export function useRedirectIfAuthed(redirectTo = "/home") {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace(redirectTo);
        return;
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router, redirectTo]);

  return { checkingAuth };
}
