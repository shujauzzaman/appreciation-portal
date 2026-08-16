"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register({ onNavigate }) {
  const ALLOWED_DOMAIN = "gmail.com";
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    designation: "",
    employeeId: "",
    dob: "",
    joiningDate: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --------------------------------
    // 1. Validate email domain
    // --------------------------------

    const normalizedEmail = formData.email
      .trim()
      .toLowerCase();

    const emailDomain =
      normalizedEmail.split("@")[1];

    if (emailDomain !== ALLOWED_DOMAIN) {
      setError("Not allowed to register.");
      return;
    }

    // --------------------------------
    // 2. Validate passwords
    // --------------------------------

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password should be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      // --------------------------------
      // 3. Send registration data to
      //    Next.js backend
      // --------------------------------

      const response = await fetch(
        "/api/auth/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: normalizedEmail,
            department: formData.department,
            designation: formData.designation,
            employeeId: formData.employeeId,
            dob: formData.dob,
            joiningDate: formData.joiningDate,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to send verification code."
        );
        return;
      }

      // --------------------------------
      // 4. OTP email sent successfully
      // --------------------------------

      if (onNavigate) {
        onNavigate("otp");
      } else {
        router.push(
          "/auth/otp-verification"
        );
      }
    } catch (error) {
      console.error(
        "Registration request error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">

        <h1 className="text-2xl font-extrabold text-[#0c108c] tracking-tight mb-4 text-center">
          Create Account
        </h1>

        {error && (
          <div className="mb-3 px-4 py-2 rounded-full bg-red-50 border-2 border-red-400 text-red-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-2.5"
        >

          {/* First / Last Name */}

          <div className="grid grid-cols-2 gap-2.5">

            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="FIRST NAME"
              className="w-full px-4 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
            />

            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="LAST NAME"
              className="w-full px-4 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
            />

          </div>

          {/* Email */}

          <div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="EMAIL (e.g. name@pepsiisb.com)"
              className="w-full px-4 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
            />
          </div>

          {/* Department / Designation */}

          <div className="grid grid-cols-2 gap-2.5">

            <div className="relative">

              <select
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase appearance-none bg-transparent focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 cursor-pointer"
              >

                <option
                  value=""
                  disabled
                  hidden
                >
                  DEPARTMENT
                </option>

                <option value="IT">
                  IT / Software
                </option>

                <option value="HR">
                  Human Resources
                </option>

                <option value="Management">
                  Management
                </option>

                <option value="Finance">
                  Finance
                </option>

              </select>

              <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center">

                <svg
                  className="w-3.5 h-3.5 fill-[#0c108c]"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>

              </div>

            </div>

            <input
              type="text"
              name="designation"
              required
              value={formData.designation}
              onChange={handleChange}
              placeholder="DESIGNATION"
              className="w-full px-4 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
            />

          </div>

          {/* Employee ID */}

          <div>

            <input
              type="text"
              name="employeeId"
              required
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="EMPLOYEE ID"
              className="w-full px-4 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
            />

          </div>

          {/* Dates */}

          <div className="grid grid-cols-2 gap-2.5">

            <div className="relative flex items-center">

              <input
                type="text"
                name="dob"
                onFocus={(e) =>
                  (e.target.type = "date")
                }
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.type = "text";
                  }
                }}
                required
                value={formData.dob}
                onChange={handleChange}
                placeholder="DATE OF BIRTH"
                className="w-full pl-4 pr-8 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
              />

              <div className="pointer-events-none absolute right-3.5 text-[#0c108c]">

                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>

              </div>

            </div>

            <div className="relative flex items-center">

              <input
                type="text"
                name="joiningDate"
                onFocus={(e) =>
                  (e.target.type = "date")
                }
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.type = "text";
                  }
                }}
                required
                value={formData.joiningDate}
                onChange={handleChange}
                placeholder="JOINING DATE"
                className="w-full pl-4 pr-8 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
              />

              <div className="pointer-events-none absolute right-3.5 text-[#0c108c]">

                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 002 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>

              </div>

            </div>

          </div>

          {/* Password */}

          <div>

            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="CREATE PASSWORD"
              className="w-full px-4 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
            />

          </div>

          {/* Confirm Password */}

          <div>

            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="CONFIRM PASSWORD"
              className="w-full px-4 py-2 rounded-full border-2 border-[#0c108c] text-xs font-bold text-[#0c108c] uppercase focus:outline-none focus:ring-2 focus:ring-[#0c108c]/40 placeholder:text-[#0c108c]/70"
            />

          </div>

          {/* Submit */}

          <div className="pt-2">

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0c108c] hover:bg-[#070a66] text-white font-black text-xs uppercase py-2.5 rounded-full tracking-wider transition-all duration-150 active:scale-[0.99] shadow-md text-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "SENDING OTP..."
                : "CREATE ACCOUNT"}
            </button>

          </div>

          {/* Login */}

          <div className="text-center pt-1">

            <p className="text-[11px] font-bold text-[#0c108c]">

              Already have an account?{" "}

              <Link
                href="/auth/login-form"
                className="underline font-black hover:opacity-80 transition-opacity cursor-pointer"
              >
                Log In
              </Link>

            </p>

          </div>

        </form>

      </div>
    </div>
  );
}