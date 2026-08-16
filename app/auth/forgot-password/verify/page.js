"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyResetOtp() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otp: code }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Verification failed.');
        return;
      }

      router.push('/auth/forgot-password/reset');
    } catch (err) {
      console.error('Error verifying reset code:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');

    try {
      // Note: resend re-uses the email already on the server-side session
      // cookie from the forgot-password step, so we don't need to ask
      // for the email again here — but send-otp expects one in the body,
      // so if you land here directly this will fail and send the user
      // back to re-enter their email.
      router.push('/auth/forgot-password');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-4">
          <div className="flex flex-col items-center select-none">
            <img src="/resend-email.png" alt="Resend Email Icon" className="w-12 h-12 object-contain" />
            <span className="text-xs font-black text-[#0c108c] mt-0.5">{timer}s</span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-[#0c108c] tracking-tight">
              Enter Verification Code
            </h1>
            <p className="text-xs font-bold text-[#0c108c] mt-1 leading-snug">
              We've sent a 6-digit code to your email.<br />
              Enter it below to continue resetting your password.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-full bg-red-50 border-2 border-red-400 text-red-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-4 mt-6">
          <div className="flex justify-center gap-2 sm:gap-3 my-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-14 md:w-14 md:h-14 border-2 border-[#0c108c] rounded-full text-center text-xl font-black text-[#0c108c] focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 transition-all"
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-[#0c108c]">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={timer > 0 || resending}
                className={`underline font-black ${timer > 0 || resending ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
              >
                Start Over
              </button>
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={verifying}
              className="w-full bg-[#0c108c] hover:bg-[#070a66] text-white font-black text-sm uppercase py-3 rounded-full tracking-wider transition-all duration-150 active:scale-[0.99] shadow-md text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {verifying ? "VERIFYING..." : "VERIFY CODE"}
            </button>
          </div>

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
