"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

import {
  Camera, Search, ChevronDown, Paperclip, Smile, Image as ImageIcon, Send, Lock, X,
  ArrowRight, User, LogOut, Mail, Phone, KeyRound, BarChart3,
} from 'lucide-react';
import Link from 'next/link';

import { useEmployeeData, useEmployeeDirectory } from "../../hooks/useEmployees";
import { usePostsFeed } from "../../hooks/usePosts";
import { updateEmployeePhoto } from "@/app/services/employees";

import Announcements from "@/app/components/Announcements";
import Leaderboard from "@/app/components/Leaderboard";
import WeeklyPoll from "@/app/components/WeeklyPoll";
import Post from "@/app/components/Post";
import { BADGE_OPTIONS, getBadgeById } from "@/app/constants/badges";

const LEVEL_OPTIONS = [
  { label: "Thank You!", emoji: "💖" },
  { label: "Good Job!", emoji: "👍" },
  { label: "Impressive!", emoji: "⭐" },
  { label: "Exceptional!", emoji: "🏆" },
];

const MAX_DROPDOWN_RESULTS = 8;

export default function Home() {
  const router = useRouter();

  // ===================== AUTH =====================
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth/login-form');
        return;
      }
      setCurrentUser(user);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  // ===================== DATA (via hooks) =====================
  const { employeeData, setEmployeeData } = useEmployeeData(currentUser?.uid);
  const { allEmployees, loadingEmployees } = useEmployeeDirectory(currentUser?.uid);
  const { posts, loadingPosts } = usePostsFeed(!!currentUser);

  // ===================== PROFILE PHOTO UPLOAD =====================
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uid", currentUser.uid);

      const res = await fetch("/api/upload-profile-picture", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      await updateEmployeePhoto(currentUser.uid, data.url);
      setEmployeeData((prev) => ({ ...prev, photoURL: data.url }));
    } catch (err) {
      console.error("Error uploading profile photo:", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ===================== PORTAL DROPDOWN (Profile / Logout) =====================
  const [showPortalDropdown, setShowPortalDropdown] = useState(false);
  const portalDropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (portalDropdownRef.current && !portalDropdownRef.current.contains(e.target)) {
        setShowPortalDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login-form');
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Failed to log out. Please try again.");
    }
  };

  // ===================== PROFILE EDIT MODAL =====================
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const openProfileModal = () => {
    setProfileForm({
      firstName: employeeData?.firstName || '',
      lastName: employeeData?.lastName || '',
      email: currentUser?.email || '',
      phone: employeeData?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPortalDropdown(false);
    setIsProfileModalOpen(true);
  };

  const handleProfileFieldChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      alert("Please enter your first and last name.");
      return;
    }
    if (!profileForm.email.trim()) {
      alert("Please enter a valid email.");
      return;
    }
    const trimmedPhone = profileForm.phone.trim();
    if (trimmedPhone && !/^[0-9+\-\s()]{6,20}$/.test(trimmedPhone)) {
      alert("Please enter a valid phone number.");
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const emailChanged = profileForm.email.trim() !== currentUser.email;
    const changingPassword = !!profileForm.newPassword;

    // Both updateEmail() and updatePassword() are "sensitive" Firebase Auth
    // operations — they throw auth/requires-recent-login unless the user
    // signed in within roughly the last few minutes. Rather than let that
    // throw (and force a full logout/login), ask for their current
    // password up front and re-authenticate right before either call.
    if (emailChanged || changingPassword) {
      if (!profileForm.currentPassword) {
        alert("Please enter your current password to change your email or password.");
        return;
      }
    }

    setSavingProfile(true);

    // Each piece is updated independently, with its own try/catch, so:
    //  - one failure (e.g. a Firestore rules rejection on a specific field)
    //    doesn't silently swallow/skip the others
    //  - the alert the user sees actually says which part failed, instead
    //    of a single generic "Failed to update profile"
    const failures = [];

    try {
      await updateDoc(doc(db, "employees", currentUser.uid), {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: trimmedPhone,
      });
      setEmployeeData((prev) => ({
        ...prev,
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: trimmedPhone,
      }));
    } catch (err) {
      console.error("Error updating employee profile doc:", err);
      if (err.code === "permission-denied") {
        failures.push(
          "Profile details (name/phone) — permission denied. This field may not be allowed by the current Firestore rules."
        );
      } else {
        failures.push(`Profile details (name/phone) — ${err.message || "failed to save"}.`);
      }
    }

    // Re-authenticate once, up front, if either sensitive change was requested.
    let reauthOk = true;
    if (emailChanged || changingPassword) {
      try {
        const credential = EmailAuthProvider.credential(currentUser.email, profileForm.currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      } catch (err) {
        console.error("Error re-authenticating:", err);
        reauthOk = false;
        if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
          failures.push("Current password is incorrect — email/password were not changed.");
        } else {
          failures.push(`Re-authentication failed — ${err.message || "email/password were not changed."}`);
        }
      }
    }

    if (emailChanged && reauthOk) {
      try {
        await updateEmail(currentUser, profileForm.email.trim());
      } catch (err) {
        console.error("Error updating auth email:", err);
        failures.push(`Email — ${err.message || "failed to save"}.`);
      }
    }

    if (changingPassword && reauthOk) {
      try {
        await updatePassword(currentUser, profileForm.newPassword);
      } catch (err) {
        console.error("Error updating auth password:", err);
        failures.push(`Password — ${err.message || "failed to save"}.`);
      }
    }

    setSavingProfile(false);

    if (failures.length > 0) {
      alert(`Some changes could not be saved:\n\n${failures.join("\n")}`);
      return;
    }

    setIsProfileModalOpen(false);
    alert("Profile updated successfully!");
  };

  // ===================== APPRECIATION MODAL =====================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('recognize');
  const [selectedLevel, setSelectedLevel] = useState('Good Job!');
  const [appreciateMessage, setAppreciateMessage] = useState('');
  const [sendingPost, setSendingPost] = useState(false);

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // ===== Nominate tab state =====
  const [selectedBadge, setSelectedBadge] = useState('Initiative');
  const [nominateSearch, setNominateSearch] = useState('');
  const [nominateRecipient, setNominateRecipient] = useState(null);
  const [showNominateDropdown, setShowNominateDropdown] = useState(false);

  const filteredEmployees = allEmployees.filter((emp) => {
    const search = employeeSearch.toLowerCase();
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const department = (emp.department || '').toLowerCase();
    return fullName.includes(search) || department.includes(search);
  });
  const visibleEmployees = filteredEmployees.slice(0, MAX_DROPDOWN_RESULTS);
  const hasMoreResults = filteredEmployees.length > MAX_DROPDOWN_RESULTS;

  const filteredNominateEmployees = allEmployees.filter((emp) => {
    const search = nominateSearch.toLowerCase();
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const department = (emp.department || '').toLowerCase();
    return fullName.includes(search) || department.includes(search);
  });
  const visibleNominateEmployees = filteredNominateEmployees.slice(0, MAX_DROPDOWN_RESULTS);

  const openModalWithTab = (tabName) => {
    setActiveTab(tabName);
    setIsModalOpen(true);
  };

  const handleSendPost = async () => {
    if (activeTab === 'nominate') {
      if (!nominateRecipient) return alert("Please select who you'd like to nominate.");

      const badgeInfo = getBadgeById(selectedBadge);

      setSendingPost(true);
      try {
        const idToken = await currentUser.getIdToken();
        const res = await fetch("/api/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            type: "nominate",
            recipientId: nominateRecipient.id,
            badge: badgeInfo?.id || selectedBadge,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send.");

        setNominateRecipient(null);
        setNominateSearch('');
        setSelectedBadge('Initiative');
        setIsModalOpen(false);
      } catch (err) {
        console.error("Error saving nomination:", err);
        alert(err.message || "Failed to send. Please try again.");
      } finally {
        setSendingPost(false);
      }
      return;
    }

    if (activeTab !== 'recognize') {
      setIsModalOpen(false);
      return;
    }
    if (!selectedRecipient) return alert("Please select who you'd like to appreciate.");
    if (!appreciateMessage.trim()) return alert("Please write a message.");

    setSendingPost(true);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          type: "recognize",
          recipientId: selectedRecipient.id,
          level: selectedLevel,
          message: appreciateMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send.");

      setSelectedRecipient(null);
      setAppreciateMessage('');
      setEmployeeSearch('');
      setSelectedLevel('Good Job!');
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving post:", err);
      alert(err.message || "Failed to send. Please try again.");
    } finally {
      setSendingPost(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-[#001c7f] font-black uppercase tracking-wider text-sm">Loading...</p>
      </div>
    );
  }

  const displayName = employeeData
    ? `${employeeData.firstName || ''} ${employeeData.lastName || ''}`.trim().toUpperCase()
    : "LOADING...";

  // NOTE: adjust this check to match your Firestore field for admin role
  // (e.g. employeeData?.role === "admin" or employeeData?.isAdmin === true)
  const isAdmin = employeeData?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50 pb-10 relative">
      {/* Header */}
      <div className="w-full h-16 bg-[#001c7f] flex items-center justify-between px-6 shadow-md">
        <div className="relative" ref={portalDropdownRef}>
          <span
            onClick={() => setShowPortalDropdown((prev) => !prev)}
            className="text-white font-black text-lg tracking-widest uppercase cursor-pointer flex items-center gap-1.5 select-none"
          >
            Portal
            <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${showPortalDropdown ? 'rotate-180' : ''}`} />
          </span>

          {showPortalDropdown && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white border-2 border-[#001c7f] rounded-lg shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-black text-[#001c7f] uppercase truncate">{displayName}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate">{currentUser?.email}</p>
              </div>
              <button
                onClick={openProfileModal}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wider hover:bg-blue-50 hover:text-[#001c7f] transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              {isAdmin && (
                <button
                  onClick={() => { setShowPortalDropdown(false); router.push('/analytics'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wider hover:bg-blue-50 hover:text-[#001c7f] transition-colors border-t border-gray-100"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-xs font-black text-red-600 uppercase tracking-wider hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        <Link
          href="/hall-of-fame"
          className="text-white font-black text-xs md:text-sm tracking-wider uppercase border-2 border-white/20 hover:border-white px-4 py-2 rounded-full transition-all duration-150 flex items-center gap-1.5 bg-white/5 hover:bg-white/10"
        >
          <span>🏆</span>
          <span>Hall of Fame</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

          {/* LEFT SIDEBAR */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col space-y-6">
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-[#001c7f] text-white rounded-lg p-5 flex flex-col items-center border-2 border-[#001c7f] relative shadow-sm">
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-sky-200 relative cursor-pointer group"
                >
                  {employeeData?.photoURL ? (
                    <img src={employeeData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-sky-300"></div>
                      <div className="absolute bottom-0 w-full h-12 bg-green-500 rounded-t-full"></div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                    {uploadingPhoto ? (
                      <span className="text-white text-[10px] font-black uppercase">Uploading...</span>
                    ) : (
                      <Camera className="w-7 h-7 text-white" />
                    )}
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-black tracking-wider text-center leading-tight">{displayName}</h2>
              </div>

              <Announcements />
              <Leaderboard />
            </div>

            <WeeklyPoll />
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col space-y-6">
            <div className="bg-white border-4 border-[#001c7f] rounded-lg p-5 shadow-sm">
              <div className="flex gap-4 text-sm font-black uppercase tracking-wider text-white bg-[#001c7f] p-2.5 px-5 rounded-md w-max">
                <span onClick={() => openModalWithTab('recognize')} className="cursor-pointer hover:underline">Appreciate</span>
                <span>|</span>
                <span onClick={() => openModalWithTab('nominate')} className="cursor-pointer hover:underline">Nominate</span>
              </div>
              <div onClick={() => openModalWithTab('recognize')} className="flex items-center gap-4 mt-5 cursor-pointer">
                <div className="w-14 h-14 rounded-full border-2 border-[#001c7f] overflow-hidden bg-sky-200 relative flex-shrink-0">
                  {employeeData?.photoURL ? (
                    <img src={employeeData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-sky-300"></div>
                      <div className="absolute bottom-0 w-full h-7 bg-green-500 rounded-t-full"></div>
                    </>
                  )}
                </div>
                <input type="text" disabled placeholder="START APPRECIATING HERE..." className="w-full text-sm font-bold text-gray-500 cursor-pointer focus:outline-none placeholder-gray-400 bg-transparent" />
              </div>
            </div>

            <div className="flex justify-end items-center gap-1.5 text-xs font-black text-[#001c7f] uppercase cursor-pointer py-1 pr-1">
              <span>View By All</span>
              <ChevronDown className="w-4 h-4" />
            </div>

            {loadingPosts ? (
              <div className="bg-white border-4 border-[#001c7f] rounded-lg p-10 text-center">
                <p className="text-[#001c7f] font-black uppercase text-sm">Loading feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border-4 border-[#001c7f] rounded-lg p-10 text-center">
                <p className="text-gray-500 font-bold text-sm">No appreciations yet. Be the first to recognize someone!</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-10">
                {posts.map((post) => <Post key={post.id} post={post} currentUserUid={currentUser?.uid} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-[6px] border-[#001c7f] rounded-xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsProfileModalOpen(false)} className="absolute -top-4 -right-4 bg-white border-4 border-[#001c7f] text-[#001c7f] p-1.5 rounded-full hover:bg-gray-100 shadow-md z-10">
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            <div className="bg-[#001c7f] text-white text-sm font-black uppercase tracking-wider text-center py-4 rounded-t-lg">
              Edit Profile
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => handleProfileFieldChange('firstName', e.target.value)}
                    className="w-full mt-1 border-2 border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-700 focus:border-[#001c7f] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => handleProfileFieldChange('lastName', e.target.value)}
                    className="w-full mt-1 border-2 border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-700 focus:border-[#001c7f] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                  className="w-full mt-1 border-2 border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-700 focus:border-[#001c7f] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full mt-1 border-2 border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-700 focus:border-[#001c7f] outline-none"
                />
              </div>

              {(profileForm.email.trim() !== currentUser?.email || profileForm.newPassword) && (
                <div className="border-t border-gray-100 pt-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Current Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => handleProfileFieldChange('currentPassword', e.target.value)}
                    placeholder="Required to change email or password"
                    className="w-full mt-1 border-2 border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-700 focus:border-[#001c7f] outline-none"
                  />
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> New Password (optional)
                </label>
                <input
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => handleProfileFieldChange('newPassword', e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full mt-1 border-2 border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-700 focus:border-[#001c7f] outline-none"
                />
              </div>

              {profileForm.newPassword && (
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => handleProfileFieldChange('confirmPassword', e.target.value)}
                    className="w-full mt-1 border-2 border-gray-300 rounded-md px-3 py-2 text-sm font-bold text-gray-700 focus:border-[#001c7f] outline-none"
                  />
                </div>
              )}

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full bg-[#001c7f] hover:bg-blue-900 text-white font-black py-3 rounded-lg text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appreciation Modal — still inline; extract to AppreciationModal.jsx next if desired */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-[6px] border-[#001c7f] rounded-xl w-full max-w-4xl shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute -top-4 -right-4 bg-white border-4 border-[#001c7f] text-[#001c7f] p-1.5 rounded-full hover:bg-gray-100 shadow-md z-10">
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            <div className="grid grid-cols-2 bg-[#001c7f] text-white text-xs md:text-sm font-black uppercase tracking-wider text-center border-b-[4px] border-[#001c7f]">
              {['recognize', 'nominate'].map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-r-2 border-[#001c7f] last:border-r-0 cursor-pointer transition-colors duration-150 ${activeTab === tab ? 'bg-white text-[#001c7f]' : 'hover:bg-blue-800/50'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              ))}
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-gray-50/50">
              {activeTab === 'recognize' && (
                <>
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-gray-900 uppercase tracking-wider">Who are you appreciating?</h4>
                    {selectedRecipient && (
                      <div className="border-2 border-gray-300 rounded-md p-2 flex items-center gap-2 flex-wrap bg-white">
                        <span className="bg-[#001c7f] text-white font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2">
                          {selectedRecipient.firstName} {selectedRecipient.lastName}
                          <span className="text-blue-200 normal-case font-bold">· {selectedRecipient.department}</span>
                          <button type="button" onClick={() => setSelectedRecipient(null)} className="ml-1 hover:opacity-70">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </div>
                    )}
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                      <input
                        type="text"
                        value={employeeSearch}
                        onChange={(e) => { setEmployeeSearch(e.target.value); setShowEmployeeDropdown(true); }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 150)}
                        placeholder="Search by name or department..."
                        className="w-full border-2 border-gray-300 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-gray-700 focus:border-[#001c7f] outline-none bg-white"
                      />
                      {showEmployeeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 border-2 border-gray-200 rounded-lg max-h-64 overflow-y-auto bg-white divide-y divide-gray-100 shadow-lg z-20">
                          {loadingEmployees ? (
                            <p className="text-xs font-bold text-gray-400 text-center py-4">Loading employees...</p>
                          ) : visibleEmployees.length === 0 ? (
                            <p className="text-xs font-bold text-gray-400 text-center py-4">No employees found.</p>
                          ) : (
                            <>
                              {visibleEmployees.map((emp) => (
                                <button
                                  key={emp.id}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => { setSelectedRecipient(emp); setEmployeeSearch(''); setShowEmployeeDropdown(false); }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                                >
                                  <span className="text-xs font-black text-[#001c7f] uppercase">{emp.firstName} {emp.lastName}</span>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase ml-auto">{emp.department}</span>
                                </button>
                              ))}
                              {hasMoreResults && (
                                <p className="text-[10px] font-bold text-gray-400 text-center py-2 uppercase tracking-wide">
                                  Keep typing to narrow results ({filteredEmployees.length} matches)
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-base font-black text-gray-900 uppercase tracking-wider">Select a Level</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {LEVEL_OPTIONS.map((level, i) => {
                        const isSelected = selectedLevel === level.label;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedLevel(level.label)}
                            className={`border-2 rounded-full py-2 px-3 flex items-center justify-center gap-2 text-xs font-black uppercase transition-all duration-150 ${isSelected ? 'border-[#001c7f] bg-blue-50 text-[#001c7f] ring-2 ring-[#001c7f]' : 'border-gray-300 text-gray-600 hover:border-[#001c7f] hover:bg-blue-50/50'}`}
                          >
                            <span>{level.emoji}</span>
                            <span>{level.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-base font-black text-gray-900 uppercase tracking-wider">Write a message</h4>
                    <div className="border-2 border-purple-500 rounded-lg p-3 relative bg-white">
                      <textarea
                        rows={5}
                        value={appreciateMessage}
                        onChange={(e) => setAppreciateMessage(e.target.value)}
                        placeholder="Make it meaningful! Describe their actions and how they impacted you or the business."
                        className="w-full text-sm font-bold text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
                      />
                      <div className="flex justify-end items-center gap-3 border-t border-gray-100 pt-2.5 mt-2 text-gray-400">
                        <Smile className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                        <Paperclip className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                        <ImageIcon className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                        <span className="text-[10px] border-2 border-gray-400 rounded px-1 py-0.5 font-black uppercase tracking-widest cursor-pointer hover:text-gray-600">GIF</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================== */}
              {/* NOMINATE TAB — avatars/search, then single scalloped badge  */}
              {/* row, then a description box for the selected badge          */}
              {/* ========================================================== */}
              {activeTab === 'nominate' && (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm relative max-w-5xl mx-auto">

                  {/* 1. Profile → Recipient photos */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-full border-2 border-gray-300 bg-sky-100 overflow-hidden relative">
                        {employeeData?.photoURL ? (
                          <img src={employeeData.photoURL} alt="You" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-sky-200"></div>
                            <div className="absolute bottom-0 w-full h-7 bg-green-500 rounded-t-full"></div>
                          </>
                        )}
                      </div>
                      <ArrowRight className="w-6 h-6 text-blue-800 stroke-[3]" />
                      <div className="w-14 h-14 rounded-full border-2 border-gray-300 bg-sky-100 overflow-hidden relative">
                        {nominateRecipient?.photoURL ? (
                          <img src={nominateRecipient.photoURL} alt="Recipient" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-sky-200"></div>
                            <div className="absolute bottom-0 w-full h-7 bg-green-500 rounded-t-full"></div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 2. "Search for who you are nominating" */}
                    <h3 className="text-sm md:text-base font-black text-gray-800 tracking-wide">
                      {nominateRecipient ? (
                        <>
                          You are nominating{' '}
                          <span className="text-[#001c7f] underline decoration-blue-300 decoration-2">
                            {nominateRecipient.firstName} {nominateRecipient.lastName}!
                          </span>
                        </>
                      ) : (
                        'Search for who you are nominating'
                      )}
                    </h3>

                    <div className="relative w-full mt-3">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                      <input
                        type="text"
                        value={nominateSearch}
                        onChange={(e) => { setNominateSearch(e.target.value); setShowNominateDropdown(true); }}
                        onFocus={() => setShowNominateDropdown(true)}
                        onBlur={() => setTimeout(() => setShowNominateDropdown(false), 150)}
                        placeholder="Search by name or department..."
                        className="w-full border-2 border-gray-300 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-gray-700 focus:border-[#001c7f] outline-none bg-white"
                      />
                      {showNominateDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 border-2 border-gray-200 rounded-lg max-h-56 overflow-y-auto bg-white divide-y divide-gray-100 shadow-lg z-20 text-left">
                          {loadingEmployees ? (
                            <p className="text-xs font-bold text-gray-400 text-center py-4">Loading employees...</p>
                          ) : visibleNominateEmployees.length === 0 ? (
                            <p className="text-xs font-bold text-gray-400 text-center py-4">No employees found.</p>
                          ) : (
                            visibleNominateEmployees.map((emp) => (
                              <button
                                key={emp.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => { setNominateRecipient(emp); setNominateSearch(''); setShowNominateDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                              >
                                <span className="text-xs font-black text-[#001c7f] uppercase">{emp.firstName} {emp.lastName}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase ml-auto">{emp.department}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <div className="w-full border-b border-gray-200 my-4"></div>
                  </div>

                  {/* 3. Badge selection — single row of 5 scalloped seals */}
                  <div className="flex flex-nowrap justify-center items-start gap-2 sm:gap-6 px-1">
                    {BADGE_OPTIONS.map((badge) => {
                      const isSelected = selectedBadge === badge.id;
                      return (
                        <div
                          key={badge.id}
                          onClick={() => setSelectedBadge(badge.id)}
                          className="relative flex flex-col items-center text-center cursor-pointer group flex-1 min-w-0 max-w-[9rem]"
                        >
                          {/* Hover tooltip with the badge description */}
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 sm:w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30">
                            <div className="bg-gray-800 text-white text-[10px] font-semibold leading-snug rounded-lg px-3 py-2 shadow-lg">
                              {badge.description}
                            </div>
                            <div className="w-2 h-2 bg-gray-800 rotate-45 mx-auto -mt-1"></div>
                          </div>

                          <img
                            src={badge.image}
                            alt={badge.label}
                            className={`w-full h-auto object-contain transition-transform duration-150 ${isSelected ? 'scale-110' : 'group-hover:scale-105 opacity-90 group-hover:opacity-100'}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 bg-transparent">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <span>This post is public.</span>
                </div>
                <button
                  onClick={handleSendPost}
                  disabled={sendingPost}
                  className="bg-[#001c7f] hover:bg-blue-900 text-white font-black px-6 py-2.5 rounded-lg text-sm uppercase tracking-widest flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{sendingPost ? "Sending..." : "Send"}</span>
                  <Send className="w-4 h-4 fill-white text-[#001c7f]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}