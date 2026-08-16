"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Unable to reset password.');
        return;
      }

      setDone(true);
      setTimeout(() => router.push('/auth/login-form'), 1500);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto text-center">
          <h1 className="text-2xl font-extrabold text-[#0c108c] tracking-tight">
            Password reset successfully!
          </h1>
          <p className="text-xs font-bold text-[#0c108c] mt-2">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <h1 className="text-3xl font-extrabold text-[#0c108c] tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs font-bold text-[#0c108c] leading-relaxed">
            Choose a new password for your account.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-full bg-red-50 border-2 border-red-400 text-red-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="NEW PASSWORD"
            className="w-full px-4 py-3 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
          />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="CONFIRM NEW PASSWORD"
            className="w-full px-4 py-3 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#0c108c] hover:bg-[#070a66] text-white font-black text-sm uppercase py-3 rounded-full tracking-wider transition-all duration-150 active:scale-[0.99] shadow-md text-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "SAVING..." : "RESET PASSWORD"}
          </button>

          <div className="text-center pt-1">
            <p className="text-xs font-bold text-[#0c108c]">
              <Link href="/auth/login-form" className="underline font-black hover:opacity-80 transition-opacity">
                Back to Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
