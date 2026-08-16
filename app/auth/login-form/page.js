"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "@/firebase/config";

const ALLOWED_DOMAIN = "gmail.com";

export default function LoginForm({ onNavigate }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check 1: domain check — no Firebase call needed for obviously wrong emails
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (emailDomain !== ALLOWED_DOMAIN) {
      setError("No account exists with this email.");
      return;
    }

    setLoading(true);

    try {
      // Set persistence based on "Remember Me" before signing in
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      // Check 2 (implicit): Firebase Auth itself tells us if no account
      // exists for this email via auth/user-not-found / auth/invalid-credential
      await signInWithEmailAndPassword(auth, email, password);

      router.push('/home');
    } catch (err) {
      console.error("Login error:", err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("No account exists with this email, or the password is incorrect.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">

      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">

        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <Link href="/">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/')}
            className="text-xs font-bold text-gray-500 hover:text-[#0c108c] transition-colors flex items-center gap-1 cursor-pointer"
            >
            ← Back to Home
          </button>
            </Link>
          <span className="text-[10px] font-black text-[#0c108c] uppercase tracking-wider">
            Appreciation Portal
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-[#0c108c] uppercase tracking-wide">
            LOGIN
          </h1>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">
            WELCOME BACK, PLEASE LOGIN TO YOUR ACCOUNT
          </p>
        </div>

        {error && (
          <div className="px-4 py-2 rounded-full bg-red-50 border-2 border-red-400 text-red-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-[#0c108c]/20 focus:border-[#0c108c] rounded-full px-6 py-2.5 text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none transition-all uppercase"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-[#0c108c]/20 focus:border-[#0c108c] rounded-full px-6 py-2.5 text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none transition-all uppercase"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#0c108c] cursor-pointer rounded"
              />
              <span className="text-[11px] font-black text-[#0c108c] uppercase tracking-wide">
                REMEMBER ME
              </span>
            </label>
            <Link href="/auth/forgot-password">
            <button
              type="button"
              className="text-[11px] font-black text-[#0c108c] uppercase underline underline-offset-2 hover:opacity-80 transition-opacity tracking-wide cursor-pointer"
              >
              FORGOT PASSWORD?
            </button>
              </Link>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0c108c] hover:bg-[#070a66] text-white font-black text-xs uppercase py-3 rounded-full tracking-wider transition-all duration-150 active:scale-95 shadow-md text-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </div>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs font-semibold text-gray-500">
            Don't have an account?{' '}
            <Link href="/auth/register">
            <button
              type="button"
              className="text-[#0c108c] font-black hover:underline ml-1 cursor-pointer"
              >
              REGISTER HERE
            </button>
              </Link>
          </p>
        </div>

      </div>
    </div>
  );
}