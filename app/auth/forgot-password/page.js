"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPassword() {
  const router = useRouter();
  const [resetEmail, setResetEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = resetEmail.trim().toLowerCase();
    if (!email || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Unable to send verification code.');
        return;
      }

      router.push('/auth/forgot-password/verify');
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0c108c] tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-xs font-bold text-[#0c108c] mt-2 leading-relaxed">
              No worries! Enter your email address, and we'll send you a verification code to reset your password.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-full bg-red-50 border-2 border-red-400 text-red-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="your.email@company.com"
              className="w-full border-2 border-[#0c108c] rounded-full px-6 py-3 text-sm font-bold text-[#0c108c] text-center focus:outline-none focus:ring-2 focus:ring-[#0c108c]/30 transition-all"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#0c108c] hover:bg-[#070a66] text-white font-black text-sm uppercase py-3 rounded-full tracking-wider transition-all duration-150 active:scale-[0.99] shadow-md text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? "SENDING..." : "SEND RESET CODE"}
            </button>
          </div>

          <div className="text-center pt-1">
            <p className="text-xs font-bold text-[#0c108c]">
              Back to{' '}
              <Link href="/auth/login-form" className="underline font-black hover:opacity-80 transition-opacity">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
