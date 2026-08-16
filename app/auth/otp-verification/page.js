"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MailCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function Page() {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showSuccessPopup, setShowSuccessPopup] =
    useState(false);

  const inputRefs = useRef([]);

  // --------------------------------
  // OTP input handling
  // --------------------------------

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      setOtp((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });
      return;
    }

    // Handle pasted/multiple digits
    if (numericValue.length > 1) {
      const digits = numericValue.slice(0, 6).split("");

      setOtp((prev) => {
        const updated = [...prev];

        digits.forEach((digit, i) => {
          if (index + i < 6) {
            updated[index + i] = digit;
          }
        });

        return updated;
      });

      const nextIndex = Math.min(
        index + digits.length,
        5
      );

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    setOtp((prev) => {
      const updated = [...prev];
      updated[index] = numericValue;
      return updated;
    });

    // Move to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // --------------------------------
  // Backspace handling
  // --------------------------------

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --------------------------------
  // Paste OTP
  // --------------------------------

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const digits = pastedData.split("");

    setOtp((prev) => {
      const updated = [...prev];

      digits.forEach((digit, index) => {
        updated[index] = digit;
      });

      return updated;
    });

    inputRefs.current[
      Math.min(digits.length, 6) - 1
    ]?.focus();
  };

  // --------------------------------
  // Verify OTP
  // --------------------------------

  const handleVerify = async (e) => {
    e?.preventDefault();

    console.log("VERIFY BUTTON CLICKED");

    const enteredOtp = otp.join("");

    console.log("OTP ENTERED:", enteredOtp);

    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      console.log("CALLING VERIFY API...");

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          otp: enteredOtp,
        }),
      });

      console.log(
        "VERIFY API STATUS:",
        response.status
      );

      const data = await response.json();

      console.log(
        "VERIFY API RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Invalid verification code."
        );
        return;
      }

      console.log(
        "REGISTRATION SUCCESSFUL:",
        data.uid
      );

      setShowSuccessPopup(true);

    } catch (error) {
      console.error(
        "VERIFY REQUEST ERROR:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  // --------------------------------
  // Resend OTP
  // --------------------------------

  const handleResend = async () => {
    if (timer > 0 || resending) return;

    setError("");
    setResending(true);

    try {
      /*
       * We don't have the registration data in
       * JavaScript anymore because it is stored
       * inside an HTTP-only cookie.
       *
       * Therefore the resend API will read the
       * cookie on the server.
       */

      const response = await fetch(
        "/api/auth/resend-otp",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to resend verification code."
        );
        return;
      }

      setTimer(60);

      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      inputRefs.current[0]?.focus();

    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      setError(
        "Unable to resend verification code."
      );
    } finally {
      setResending(false);
    }
  };

  // --------------------------------
  // Countdown
  // --------------------------------

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // --------------------------------
  // Redirect after success
  // --------------------------------

  useEffect(() => {
    if (!showSuccessPopup) return;

    const timeout = setTimeout(() => {
      router.push("/auth/login-form");
    }, 2200);

    return () => clearTimeout(timeout);
  }, [showSuccessPopup, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-gray-50">

      <div className="w-full max-w-md mx-auto">

        {/* Header */}

        <div className="flex flex-col items-center text-center gap-4 mb-8">

          <div className="w-16 h-16 rounded-full bg-[#0c108c]/10 flex items-center justify-center">

            <MailCheck className="w-8 h-8 text-[#0c108c]" />

          </div>

          <div>

            <h1 className="text-3xl font-extrabold text-[#0c108c] tracking-tight">
              Verify Your Email
            </h1>

            <p className="text-xs font-bold text-[#0c108c] mt-2 leading-relaxed">
              We've sent a 6-digit verification
              code to your company email.
              <br />
              Enter the code below to complete
              your registration.
            </p>

          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 px-4 py-2 rounded-full bg-red-50 border-2 border-red-400 text-red-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* OTP Form */}

        <form
          onSubmit={handleVerify}
          className="space-y-6"
        >

          {/* OTP boxes */}

          <div
            className="flex justify-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >

            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleOtpChange(
                    index,
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-black text-[#0c108c] border-2 border-[#0c108c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c108c]/30"
                aria-label={`OTP digit ${
                  index + 1
                }`}
              />
            ))}

          </div>

          {/* Verify button */}

          <button
            type="submit"
            disabled={verifying}
            className="w-full bg-[#0c108c] hover:bg-[#070a66] text-white font-black text-sm uppercase py-3 rounded-full tracking-wider transition-all duration-150 active:scale-[0.99] shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >

            {verifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}

          </button>

          {/* Resend */}

          <div className="text-center">

            <p className="text-xs font-bold text-[#0c108c]">

              Didn't receive the code?{" "}

              <button
                type="button"
                onClick={handleResend}
                disabled={
                  timer > 0 || resending
                }
                className={`underline font-black ${
                  timer > 0 || resending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-80"
                }`}
              >

                {resending
                  ? "Sending..."
                  : timer > 0
                  ? `Resend in ${timer}s`
                  : "Resend OTP"}

              </button>

            </p>

          </div>

        </form>

      </div>

      {/* SUCCESS POPUP */}

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center gap-3">

            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">

              <CheckCircle2 className="w-10 h-10 text-emerald-500" />

            </div>

            <h2 className="text-xl font-extrabold text-[#0c108c] tracking-tight">
              Registration Complete!
            </h2>

            <p className="text-xs font-bold text-gray-500 leading-relaxed">
              Your email has been verified and
              your account has been created.
              <br />
              Taking you to the login page...
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/auth/login-form"
                )
              }
              className="mt-2 w-full bg-[#0c108c] hover:bg-[#070a66] text-white font-black text-xs uppercase py-2.5 rounded-full tracking-wider transition-all duration-150 active:scale-[0.99] shadow-md"
            >
              Continue to Login
            </button>

          </div>

        </div>
      )}

    </div>
  );
}