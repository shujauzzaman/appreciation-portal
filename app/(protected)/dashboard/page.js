"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Menu, ChevronDown, Download, X, Calendar, Building2, FileText, Megaphone, Plus, Send, ShieldCheck, Trash2, Search, XCircle } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { auth } from '@/firebase/config';
import {
  getRecognitionCounts,
  getDepartmentRecognitionCounts,
  getManagerRecognitionCounts,
  getOverviewStats,
  getMonthlyRecognitionTrend,
  getParticipationHeatmap,
} from '@/app/services/recognitions';
import { fetchAnnouncements, formatAnnouncementDate, createAnnouncement } from '@/app/services/announcements';
import { fetchAllEmployees } from '@/app/services/employees';

// yyyy-mm-dd for <input type="date">
const toInputDate = (date) => date.toISOString().slice(0, 10);

// "May 1 - May 31, 2026" style label for the header button
const formatDateRangeLabel = (from, to) => {
  const fromStr = from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const toStr = to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fromStr} - ${toStr}`;
};

export default function RecognitionDashboard() {

  const [activeMenu, setActiveMenu] = useState('Overview');
  const [selectedPersonKey, setSelectedPersonKey] = useState(null); // e.g. "received-2"

  // ===== Header date range filter (drives the Recognitions tab) =====
  // Defaults to the current calendar month, from the 1st through today.
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to: now };
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateFromDraft, setDateFromDraft] = useState(() => toInputDate(dateRange.from));
  const [dateToDraft, setDateToDraft] = useState(() => toInputDate(dateRange.to));

  // Same overflow-clipping problem as the Users tab's "Joined" picker can
  // affect this header button too, depending on where it sits relative to
  // any ancestor that sets a non-visible overflow. Use the same portal +
  // fixed-position approach so it always floats above everything.
  const dateButtonRef = useRef(null);
  const [datePickerPos, setDatePickerPos] = useState({ top: 0, left: 0 });

  const openDatePicker = () => {
    setDateFromDraft(toInputDate(dateRange.from));
    setDateToDraft(toInputDate(dateRange.to));
    if (dateButtonRef.current) {
      const rect = dateButtonRef.current.getBoundingClientRect();
      const popoverWidth = 288; // w-72
      setDatePickerPos({
        top: rect.bottom + 8,
        left: Math.max(12, Math.min(rect.right - popoverWidth, window.innerWidth - popoverWidth - 12)),
      });
    }
    setIsDatePickerOpen(true);
  };

  const applyDateRange = () => {
    if (!dateFromDraft || !dateToDraft) return;
    const from = new Date(`${dateFromDraft}T00:00:00`);
    const to = new Date(`${dateToDraft}T23:59:59.999`);
    if (from > to) return; // ignore invalid range, keep picker open
    setDateRange({ from, to });
    setIsDatePickerOpen(false);
  };

  useEffect(() => {
    if (!isDatePickerOpen) return;
    const close = () => setIsDatePickerOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isDatePickerOpen]);

  // ===== Recognitions tab: real counts from `posts`, scoped to dateRange =====
  const [recognitionCounts, setRecognitionCounts] = useState({ received: [], given: [] });
  const [isLoadingRecognitions, setIsLoadingRecognitions] = useState(false);
  const [recognitionsError, setRecognitionsError] = useState(null);

  useEffect(() => {
    if (activeMenu !== 'Recognitions') return;

    let cancelled = false;
    setIsLoadingRecognitions(true);
    setRecognitionsError(null);

    getRecognitionCounts({ from: dateRange.from, to: dateRange.to })
      .then((counts) => {
        if (!cancelled) setRecognitionCounts(counts);
      })
      .catch((err) => {
        console.error('Failed to load recognition counts:', err);
        if (!cancelled) setRecognitionsError('Could not load recognitions for this date range.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRecognitions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeMenu, dateRange]);

  // ===== Managers tab: real leaderboard of role="manager" employees =====
  const [managerCounts, setManagerCounts] = useState([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [managersError, setManagersError] = useState(null);

  useEffect(() => {
    if (activeMenu !== 'Managers') return;

    let cancelled = false;
    setIsLoadingManagers(true);
    setManagersError(null);

    getManagerRecognitionCounts({ from: dateRange.from, to: dateRange.to })
      .then((counts) => {
        if (!cancelled) setManagerCounts(counts);
      })
      .catch((err) => {
        console.error('Failed to load manager counts:', err);
        if (!cancelled) setManagersError('Could not load managers for this date range.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingManagers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeMenu, dateRange]);

  // ===== Departments tab: real per-department counts from `posts` =====
  const [departmentCounts, setDepartmentCounts] = useState({ departments: [] });
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [departmentsError, setDepartmentsError] = useState(null);
  const [showAllDepartments, setShowAllDepartments] = useState(false);

  useEffect(() => {
    if (activeMenu !== 'Departments') return;

    let cancelled = false;
    setIsLoadingDepartments(true);
    setDepartmentsError(null);

    getDepartmentRecognitionCounts({ from: dateRange.from, to: dateRange.to })
      .then((counts) => {
        if (!cancelled) setDepartmentCounts(counts);
      })
      .catch((err) => {
        console.error('Failed to load department counts:', err);
        if (!cancelled) setDepartmentsError('Could not load departments for this date range.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDepartments(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeMenu, dateRange]);

  // Reset the "view all" toggle whenever the tab or date range changes,
  // so switching away and back (or picking a new range) starts collapsed.
  useEffect(() => {
    setShowAllDepartments(false);
  }, [activeMenu, dateRange]);

  const visibleDepartments = showAllDepartments
    ? departmentCounts.departments
    : departmentCounts.departments.slice(0, 5);

  // ===== Current signed-in user (needed for ID tokens on admin actions) =====
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  // ===== Employee directory =====
  // Fetched once on mount (not gated to the Users tab) since the Overview
  // tab also needs the total employee count for its engagement-rate stat,
  // and the Report modal's department dropdown is derived from this too.
  const [employeesList, setEmployeesList] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingEmployees(true);
    setEmployeesError(null);

    fetchAllEmployees()
      .then((employees) => {
        if (!cancelled) setEmployeesList(employees);
      })
      .catch((err) => {
        console.error('Failed to load employees:', err);
        if (!cancelled) setEmployeesError('Could not load users.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingEmployees(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const departmentOptions = [
    'All Departments',
    ...Array.from(new Set(employeesList.map((e) => e.department).filter(Boolean))).sort(),
  ];

  // ===== Overview tab: stat cards, charts, and sidebar lists =====
  // Stat cards / top employees / department pie chart are scoped to the
  // header dateRange (like Recognitions/Departments/Managers). The trend
  // line and heatmap intentionally ignore dateRange and always show a
  // trailing 6-month window, so they don't collapse when someone picks a
  // narrow custom range.
  const OVERVIEW_MONTHS_BACK = 6;

  const [overviewStats, setOverviewStats] = useState(null);
  const [isLoadingOverviewStats, setIsLoadingOverviewStats] = useState(false);
  const [overviewStatsError, setOverviewStatsError] = useState(null);

  const [overviewManagers, setOverviewManagers] = useState([]);

  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);

  const [heatmap, setHeatmap] = useState({ rows: [], monthLabels: [] });
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);

  useEffect(() => {
    if (activeMenu !== 'Overview') return;
    // Employee count is needed for the engagement-rate stat — wait for
    // the directory fetch (from mount) to resolve at least once.
    if (isLoadingEmployees) return;

    let cancelled = false;
    setIsLoadingOverviewStats(true);
    setOverviewStatsError(null);

    Promise.all([
      getOverviewStats({ from: dateRange.from, to: dateRange.to, totalEmployees: employeesList.length }),
      getManagerRecognitionCounts({ from: dateRange.from, to: dateRange.to }),
    ])
      .then(([stats, managers]) => {
        if (cancelled) return;
        setOverviewStats(stats);
        setOverviewManagers(managers.slice(0, 5));
      })
      .catch((err) => {
        console.error('Failed to load overview stats:', err);
        if (!cancelled) setOverviewStatsError('Could not load dashboard stats.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOverviewStats(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeMenu, dateRange, isLoadingEmployees, employeesList.length]);

  useEffect(() => {
    if (activeMenu !== 'Overview') return;

    let cancelled = false;
    setIsLoadingTrend(true);
    setIsLoadingHeatmap(true);

    getMonthlyRecognitionTrend(OVERVIEW_MONTHS_BACK)
      .then((trend) => {
        if (!cancelled) setMonthlyTrend(trend);
      })
      .catch((err) => console.error('Failed to load recognition trend:', err))
      .finally(() => {
        if (!cancelled) setIsLoadingTrend(false);
      });

    getParticipationHeatmap(OVERVIEW_MONTHS_BACK)
      .then((data) => {
        if (!cancelled) setHeatmap(data);
      })
      .catch((err) => console.error('Failed to load participation heatmap:', err))
      .finally(() => {
        if (!cancelled) setIsLoadingHeatmap(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeMenu]);

  // Fixed palette for the department pie chart — cycles if there are more
  // departments than colors.
  const DEPARTMENT_COLORS = ['#447eff', '#9d7cff', '#fbc46d', '#ff708b', '#ffd043', '#8ce2ff', '#34d399', '#f472b6'];
  const overviewPieData = (overviewStats?.departmentBreakdown || []).map((d, i) => ({
    name: d.dept,
    value: d.count,
    color: DEPARTMENT_COLORS[i % DEPARTMENT_COLORS.length],
  }));

  const formatSignedPct = (value) => {
    const rounded = Math.round(value * 10) / 10;
    return `${rounded >= 0 ? '+' : ''}${rounded}%`;
  };

  // ===== Reports popup state (opened from header "Report" button) =====
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'
  const [reportDepartment, setReportDepartment] = useState('All Departments');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');


  // ===== Users tab filters (search + department + role + joined date range) =====
  const [userSearch, setUserSearch] = useState('');
  const [userDeptFilter, setUserDeptFilter] = useState('All Departments');
  const [userRoleFilter, setUserRoleFilter] = useState('All Roles');

  // "Joined" date range — same open/draft/apply pattern as the header date
  // picker above, just scoped to this tab and to employee.joiningDate
  // (stored as a plain "yyyy-mm-dd" string from the registration form, so
  // it can be compared directly against the input[type=date] drafts).
  const [isUsersDatePickerOpen, setIsUsersDatePickerOpen] = useState(false);
  const [usersDateRange, setUsersDateRange] = useState(null); // null = no date filter applied
  const [usersDateFromDraft, setUsersDateFromDraft] = useState('');
  const [usersDateToDraft, setUsersDateToDraft] = useState('');

  // The Users tab (and its filter bar) live inside a scrollable panel
  // (overflow-y-auto), which clips any absolutely-positioned popover that
  // tries to render outside its bounds — that's why the calendar dropdown
  // was getting cut off. Fix: render it in a portal at a fixed screen
  // position computed from the button's own bounding box, so it floats
  // above everything instead of being clipped by an ancestor's overflow.
  const usersDateButtonRef = useRef(null);
  const [usersDatePickerPos, setUsersDatePickerPos] = useState({ top: 0, left: 0 });

  const openUsersDatePicker = () => {
    setUsersDateFromDraft(usersDateRange?.from || '');
    setUsersDateToDraft(usersDateRange?.to || '');
    if (usersDateButtonRef.current) {
      const rect = usersDateButtonRef.current.getBoundingClientRect();
      const popoverWidth = 288; // w-72
      setUsersDatePickerPos({
        top: rect.bottom + 8,
        // Right-align the popover to the button, but keep it on-screen.
        left: Math.max(12, Math.min(rect.right - popoverWidth, window.innerWidth - popoverWidth - 12)),
      });
    }
    setIsUsersDatePickerOpen(true);
  };

  const applyUsersDateRange = () => {
    if (!usersDateFromDraft || !usersDateToDraft) return;
    if (usersDateFromDraft > usersDateToDraft) return; // yyyy-mm-dd strings compare lexicographically
    setUsersDateRange({ from: usersDateFromDraft, to: usersDateToDraft });
    setIsUsersDatePickerOpen(false);
  };

  const clearUsersDateRange = () => {
    setUsersDateRange(null);
    setUsersDateFromDraft('');
    setUsersDateToDraft('');
    setIsUsersDatePickerOpen(false);
  };

  const userDepartmentOptions = [
    'All Departments',
    ...Array.from(new Set(employeesList.map((e) => e.department).filter(Boolean))).sort(),
  ];
  const userRoleOptions = [
    'All Roles',
    ...Array.from(new Set(employeesList.map((e) => e.role).filter(Boolean))).sort(),
  ];

  const isUsersFilterActive =
    userSearch.trim() !== '' ||
    userDeptFilter !== 'All Departments' ||
    userRoleFilter !== 'All Roles' ||
    usersDateRange !== null;

  // Close the portal-rendered popover on scroll/resize rather than trying
  // to keep it glued to the button — simpler and avoids jitter, and the
  // user can just reopen it if they scrolled on purpose.
  useEffect(() => {
    if (!isUsersDatePickerOpen) return;
    const close = () => setIsUsersDatePickerOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isUsersDatePickerOpen]);

  const clearAllUserFilters = () => {
    setUserSearch('');
    setUserDeptFilter('All Departments');
    setUserRoleFilter('All Roles');
    clearUsersDateRange();
  };

  const filteredEmployeesList = employeesList.filter((user) => {
    const search = userSearch.trim().toLowerCase();
    if (search) {
      const haystack = [user.firstName, user.lastName, user.email, user.employeeId, user.designation]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (userDeptFilter !== 'All Departments' && user.department !== userDeptFilter) return false;
    if (userRoleFilter !== 'All Roles' && user.role !== userRoleFilter) return false;
    if (usersDateRange) {
      const joined = user.joiningDate || '';
      if (!joined || joined < usersDateRange.from || joined > usersDateRange.to) return false;
    }
    return true;
  });

  // ===== Edit User modal: promote to admin / delete user =====
  // Both actions call server routes that re-verify the caller is an admin
  // from their own Firestore doc — never trust a role from the client.
  const [editingUser, setEditingUser] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isProcessingEditAction, setIsProcessingEditAction] = useState(false);
  const [editActionError, setEditActionError] = useState(null);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsConfirmingDelete(false);
    setEditActionError(null);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsConfirmingDelete(false);
    setEditActionError(null);
  };

  const callAdminUserRoute = async (path, uid) => {
    const idToken = await currentUser.getIdToken();
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ uid }),
    });

    // The server should always return JSON, but a 404/500 from
    // infrastructure (wrong route path, proxy error page, etc.) comes
    // back as HTML — don't let that surface as a raw parser error.
    let data;
    try {
      data = await res.json();
    } catch {
      console.error(`${path} returned a non-JSON response (status ${res.status}).`);
      throw new Error('Something went wrong. Please try again.');
    }

    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  };

  const handlePromoteToAdmin = async () => {
    if (!currentUser || !editingUser) return;
    setIsProcessingEditAction(true);
    setEditActionError(null);
    try {
      await callAdminUserRoute('/api/admin/users/promote', editingUser.id);
      setEmployeesList((prev) =>
        prev.map((e) => (e.id === editingUser.id ? { ...e, role: 'admin' } : e))
      );
      closeEditModal();
    } catch (err) {
      setEditActionError(err.message);
    } finally {
      setIsProcessingEditAction(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser || !editingUser) return;
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    setIsProcessingEditAction(true);
    setEditActionError(null);
    try {
      await callAdminUserRoute('/api/admin/users/delete', editingUser.id);
      setEmployeesList((prev) => prev.filter((e) => e.id !== editingUser.id));
      closeEditModal();
    } catch (err) {
      setEditActionError(err.message);
    } finally {
      setIsProcessingEditAction(false);
    }
  };

  // Builds and downloads a CSV report based on the selected filters. Pulls
  // from whatever Overview/Departments data is already in state (scoped to
  // the header dateRange) — if the user opens this modal without having
  // visited those tabs yet, the stats fall back to "—" rather than fake
  // numbers. TODO: once weekly/monthly/yearly period + report-specific
  // date range filtering is wired up on the backend, fetch fresh data here
  // scoped to reportPeriod/reportDateFrom/reportDateTo instead of reusing
  // the header-scoped state.
  const handleDownloadReport = () => {
    const periodLabel = reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1);

    const deptRows = (departmentCounts.departments.length
      ? departmentCounts.departments.map((d) => [d.dept, d.count])
      : (overviewStats?.departmentBreakdown || []).map((d) => [d.dept, d.count])
    ).filter(([dept]) => reportDepartment === 'All Departments' || dept === reportDepartment);

    const rows = [
      ['Metric', 'Value'],
      ['Report Period', periodLabel],
      ['Department', reportDepartment],
      ['From', reportDateFrom || '-'],
      ['To', reportDateTo || '-'],
      ['Total Recognitions', overviewStats ? overviewStats.totalRecognitions : '—'],
      ['Active Participants', overviewStats ? overviewStats.activeParticipants : '—'],
      ['Engagement Rate', overviewStats ? `${Math.round(overviewStats.engagementRate)}%` : '—'],
      [],
      ['Department', 'Recognitions'],
      ...deptRows,
    ];

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `recognition-report-${reportPeriod}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsReportModalOpen(false);
  };

  const menuItems = [
    'Overview', 'Recognitions', 'Users', 'Departments', 'Managers'
  ];

  const menuSubtitles = {
    Overview: 'Realtime insights into recognition activity across the organization.',
    Recognitions: 'Realtime insights into recognition activity across the organization.',
    Users: 'Manage employee accounts and profiles.',
    Departments: 'View recognition activity broken down by department.',
    Managers: 'Track manager participation and engagement.',
  };

  // Heatmap intensity generator helper
  const getHeatmapColor = (value) => {
    if (value > 7) return 'bg-blue-700/80';
    if (value > 5) return 'bg-blue-500/70';
    if (value > 3) return 'bg-blue-400/50';
    return 'bg-blue-200/40';
  };

  // Reusable avatar bubble. Renders a real photo when photoURL is given,
  // otherwise falls back to the sky/green placeholder used elsewhere.
  // Plain <img> (not next/image) since photoURL comes from Cloudinary and
  // next.config.mjs doesn't allowlist that remote domain.
  const PersonAvatar = ({ size = "w-20 h-20", photoURL, name }) => (
    <div className={`${size} rounded-full border-2 border-white overflow-hidden bg-sky-100 relative shrink-0 shadow-inner`}>
      {photoURL ? (
        <img src={photoURL} alt={name || ''} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0 bg-sky-200/70"></div>
          <div className="absolute bottom-0 w-full h-1/3 bg-green-500 rounded-t-full"></div>
        </>
      )}
    </div>
  );

  // Reusable row of 3 people used on the Recognitions page
  const PersonRow = ({ people, keyPrefix }) => (
    <div className="flex flex-wrap gap-8">
      {people.map((person, i) => {
        const itemKey = `${keyPrefix}-${i}`;
        const isSelected = selectedPersonKey === itemKey;
        return (
          <button
            key={itemKey}
            type="button"
            onClick={() => setSelectedPersonKey(itemKey)}
            className={`flex items-center gap-3 p-2 rounded-lg border-2 transition-all duration-150 ${
              isSelected ? 'border-purple-500' : 'border-transparent hover:border-gray-200'
            }`}
          >
            <PersonAvatar photoURL={person.photoURL} name={person.name} />
            <div className="text-left">
              <h4 className="text-sm font-black text-gray-900 leading-tight">{person.name}</h4>
              <p className="text-xs font-bold text-gray-400">{person.dept}</p>
              {typeof person.count === 'number' && (
                <p className="text-xs font-black text-blue-600 mt-0.5">{person.count}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  // ===== Announcements state (sidebar "+ Add" popup) =====
  // Real data from Firestore's `announcements` collection — fetched once
  // on mount (the sidebar is always visible, regardless of activeMenu).
  const [announcements, setAnnouncements] = useState([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementPostError, setAnnouncementPostError] = useState(null);
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAnnouncements()
      .then((data) => {
        if (!cancelled) setAnnouncements(data);
      })
      .catch((err) => {
        console.error('Failed to load announcements:', err);
        if (!cancelled) setAnnouncementsError('Could not load announcements.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAnnouncements(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openAnnouncementModal = () => {
    setAnnouncementText('');
    setAnnouncementPostError(null);
    setIsAnnouncementModalOpen(true);
  };

  const handlePostAnnouncement = async () => {
    if (!announcementText.trim()) {
      setAnnouncementPostError('Please write your announcement message.');
      return;
    }
    if (!currentUser) return;

    setIsPostingAnnouncement(true);
    setAnnouncementPostError(null);
    try {
      const idToken = await currentUser.getIdToken();
      const { id, message, authorName } = await createAnnouncement(idToken, announcementText.trim());

      // Newest announcement shows first. createdAt isn't known client-side
      // until it round-trips (serverTimestamp resolves server-side), so
      // formatAnnouncementDate falls back to "Just now" until a refetch.
      setAnnouncements((prev) => [{ id, message, authorName, createdAt: null }, ...prev]);
      setAnnouncementText('');
      setIsAnnouncementModalOpen(false);
    } catch (err) {
      setAnnouncementPostError(err.message);
    } finally {
      setIsPostingAnnouncement(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fc] font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-[#091aa6] text-white flex flex-col py-6 px-4 shrink-0 shadow-xl overflow-y-auto">
        <div className="px-3 mb-8">
          <h1 className="text-2xl font-black tracking-tighter uppercase leading-tight">
            RECOGNITION<br />DASHBOARD
          </h1>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeMenu === item;
            return (
              <button
                key={item}
                onClick={() => setActiveMenu(item)}
                className={`w-full text-left font-bold text-[15px] px-6 py-2.5 rounded-lg transition-all duration-150 block ${
                  isActive 
                    ? 'bg-white text-[#091aa6] shadow-md' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* ================= ANNOUNCEMENTS SECTION ================= */}
        <div className="mt-8 px-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-white/90 uppercase tracking-wider">
              <Megaphone className="w-4 h-4" />
              <span>Announcements</span>
            </div>
            <button
              onClick={openAnnouncementModal}
              className="flex items-center gap-1 text-[10px] font-black text-[#091aa6] bg-white hover:bg-gray-100 px-2.5 py-1.5 rounded-full uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              Add
            </button>
          </div>

          <div className="space-y-2.5">
            {isLoadingAnnouncements ? (
              <p className="text-[11px] font-bold text-white/50 px-1">Loading...</p>
            ) : announcementsError ? (
              <p className="text-[11px] font-bold text-red-300 px-1">{announcementsError}</p>
            ) : announcements.length === 0 ? (
              <p className="text-[11px] font-bold text-white/50 px-1">No announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="bg-white/10 border border-white/10 rounded-lg p-3">
                  <p className="text-xs font-bold text-white leading-snug break-words">{a.message}</p>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide mt-1.5">
                    {formatAnnouncementDate(a.createdAt)}{a.authorName ? ` · ${a.authorName}` : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="bg-white h-20 border-b border-gray-200/80 flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-tight">{activeMenu}</h2>
              <p className="text-xs font-bold text-gray-500 tracking-wide mt-0.5">{menuSubtitles[activeMenu]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Report Button — opens the Reports filter modal */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-white border-2 border-[#447eff] text-[#447eff] hover:bg-[#447eff] hover:text-white font-bold text-xs tracking-wide px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Report</span>
            </button>

            {/* Date Selector Dropdown */}
            <div className="relative">
              <button
                ref={dateButtonRef}
                onClick={() => (isDatePickerOpen ? setIsDatePickerOpen(false) : openDatePicker())}
                className="bg-[#447eff] hover:bg-blue-600 text-white font-bold text-xs tracking-wide px-5 py-2.5 rounded-full flex items-center gap-6 shadow-sm transition-all"
              >
                <span>{formatDateRangeLabel(dateRange.from, dateRange.to)}</span>
                <ChevronDown className="w-4 h-4 stroke-[3]" />
              </button>

              {/* Rendered via portal + position:fixed so it can never be
                  clipped by an ancestor's overflow, wherever this header
                  ends up sitting in the layout. */}
              {isDatePickerOpen && typeof document !== 'undefined' && createPortal(
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDatePickerOpen(false)} />
                  <div
                    className="fixed w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4"
                    style={{ top: datePickerPos.top, left: datePickerPos.left }}
                  >
                    <label className="flex items-center gap-1.5 text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Date Range
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={dateFromDraft}
                        onChange={(e) => setDateFromDraft(e.target.value)}
                        className="w-full text-sm font-bold text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff]"
                      />
                      <span className="text-gray-400 font-bold text-xs">to</span>
                      <input
                        type="date"
                        value={dateToDraft}
                        onChange={(e) => setDateToDraft(e.target.value)}
                        className="w-full text-sm font-bold text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff]"
                      />
                    </div>
                    <button
                      onClick={applyDateRange}
                      className="w-full mt-3 bg-[#447eff] hover:bg-blue-600 text-white font-black text-xs tracking-wider uppercase px-4 py-2.5 rounded-lg shadow-sm transition-all"
                    >
                      Apply
                    </button>
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
        </header>

        {activeMenu === 'Managers' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">
            <div className="bg-white p-6 rounded-xl border-2 border-purple-500 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide text-center pb-4 mb-6 border-b border-gray-200">
                Managers Leaderboard
              </h3>

              {managersError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-xl p-4 mb-4">
                  {managersError}
                </div>
              )}

              {isLoadingManagers ? (
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">Loading...</p>
              ) : managerCounts.length === 0 ? (
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">
                  No employees with the manager role yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
                  {managerCounts.map((mgr) => (
                    <div key={mgr.id} className="flex items-center gap-3">
                      <PersonAvatar photoURL={mgr.photoURL} name={mgr.name} />
                      <div className="text-left">
                        <h4 className="text-sm font-black text-gray-900 leading-tight">{mgr.name}</h4>
                        <p className="text-xs font-bold text-gray-400">{mgr.department || 'No department'} - {mgr.count} received</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeMenu === 'Departments' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">
              Most Recognizing Depts
            </h3>

            {departmentsError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-xl p-4">
                {departmentsError}
              </div>
            )}

            {isLoadingDepartments ? (
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">Loading...</p>
              </div>
            ) : departmentCounts.departments.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">
                  No recognitions in this date range.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                <div className="xl:col-span-8 space-y-6">
                  {visibleDepartments.map((deptGroup) => (
                    <div key={deptGroup.dept} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-200">
                        <h4 className="text-base font-black text-gray-900 uppercase tracking-wide">
                          {deptGroup.dept}
                        </h4>
                        <span className="text-right">
                          <span className="block text-lg font-black text-blue-600 leading-tight">{deptGroup.count}</span>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                            No. of Recognitions
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-6">
                        {deptGroup.topEmployees.map((emp) => (
                          <div key={emp.id} className="flex items-center gap-3">
                            <PersonAvatar size="w-14 h-14" photoURL={emp.photoURL} name={emp.name} />
                            <div className="text-left">
                              <h5 className="text-xs font-black text-gray-900 leading-tight">{emp.name}</h5>
                              <p className="text-[11px] font-bold text-gray-400">{emp.count} received</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="xl:col-span-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-base font-black text-gray-900 leading-snug mb-4">Departmental Leaderboard</h3>
                    <div className="space-y-4 flex-1 divide-y divide-gray-100">
                      {departmentCounts.departments.map((row, index) => (
                        <div key={row.dept} className={`flex items-center justify-between ${index > 0 ? 'pt-4' : ''}`}>
                          <span className="text-sm font-black text-gray-900">{row.dept}</span>
                          <span className="text-sm font-black text-blue-600">{row.count}</span>
                        </div>
                      ))}
                    </div>
                    {departmentCounts.departments.length > 5 && (
                      <button
                        onClick={() => setShowAllDepartments((v) => !v)}
                        className="text-right text-[11px] font-black text-blue-500 hover:underline uppercase tracking-wider mt-4"
                      >
                        {showAllDepartments ? 'Show less' : 'View all'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : activeMenu === 'Users' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">

            {/* ================= USERS FILTER BAR ================= */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="w-full text-sm font-bold text-gray-700 placeholder-gray-400 border border-gray-200 rounded-full pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff]"
                />
              </div>

              {/* Department */}
              <select
                value={userDeptFilter}
                onChange={(e) => setUserDeptFilter(e.target.value)}
                className="text-xs font-black text-gray-700 uppercase tracking-wide border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff] bg-white"
              >
                {userDepartmentOptions.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {/* Role */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs font-black text-gray-700 uppercase tracking-wide border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff] bg-white"
              >
                {userRoleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              {/* Joined date range */}
              <div className="relative">
                <button
                  ref={usersDateButtonRef}
                  type="button"
                  onClick={() => (isUsersDatePickerOpen ? setIsUsersDatePickerOpen(false) : openUsersDatePicker())}
                  className={`font-bold text-xs tracking-wide px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-all border-2 ${
                    usersDateRange
                      ? 'bg-[#447eff] border-[#447eff] text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#447eff]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {usersDateRange
                      ? `Joined ${usersDateRange.from} - ${usersDateRange.to}`
                      : 'Joined: Any time'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                {/* Rendered via portal + position:fixed so it isn't clipped by
                    this tab's scrollable (overflow-y-auto) container. */}
                {isUsersDatePickerOpen && typeof document !== 'undefined' && createPortal(
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUsersDatePickerOpen(false)} />
                    <div
                      className="fixed w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4"
                      style={{ top: usersDatePickerPos.top, left: usersDatePickerPos.left }}
                    >
                      <label className="flex items-center gap-1.5 text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Date Range
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={usersDateFromDraft}
                          onChange={(e) => setUsersDateFromDraft(e.target.value)}
                          className="w-full text-sm font-bold text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff]"
                        />
                        <span className="text-gray-400 font-bold text-xs">to</span>
                        <input
                          type="date"
                          value={usersDateToDraft}
                          onChange={(e) => setUsersDateToDraft(e.target.value)}
                          className="w-full text-sm font-bold text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff]"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={clearUsersDateRange}
                          className="text-xs font-black text-gray-500 uppercase tracking-wider px-4 py-2.5 hover:text-gray-700 transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={applyUsersDateRange}
                          className="flex-1 bg-[#447eff] hover:bg-blue-600 text-white font-black text-xs tracking-wider uppercase px-4 py-2.5 rounded-lg shadow-sm transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>,
                  document.body
                )}
              </div>

              {isUsersFilterActive && (
                <button
                  type="button"
                  onClick={clearAllUserFilters}
                  className="flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-red-500 uppercase tracking-wider px-2 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-center gap-2 pb-4 mb-6 border-b border-gray-200">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide text-center">
                  Users Log
                </h3>
                {!isLoadingEmployees && !employeesError && (
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    ({filteredEmployeesList.length}{isUsersFilterActive ? ` of ${employeesList.length}` : ''})
                  </span>
                )}
              </div>
              {isLoadingEmployees ? (
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">Loading...</p>
              ) : employeesError ? (
                <p className="text-center text-xs font-bold text-red-500 uppercase tracking-wider py-6">{employeesError}</p>
              ) : employeesList.length === 0 ? (
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">No users found.</p>
              ) : filteredEmployeesList.length === 0 ? (
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">No users match these filters.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8">
                  {filteredEmployeesList.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <PersonAvatar photoURL={user.photoURL} name={`${user.firstName || ''} ${user.lastName || ''}`} />
                      <div className="text-left">
                        <h4 className="text-sm font-black text-gray-900 leading-tight">
                          {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed'}
                        </h4>
                        <p className="text-[11px] font-bold text-gray-400 leading-tight">
                          {user.department || '—'}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleEditUser(user)}
                          className="text-xs font-bold text-gray-500 underline hover:text-blue-600"
                        >
                          edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : activeMenu === 'Recognitions' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">

            {recognitionsError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-xl p-4">
                {recognitionsError}
              </div>
            )}

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide text-center pb-4 mb-6 border-b border-gray-200">
                Most Recognitions Received
              </h3>
              {isLoadingRecognitions ? (
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">Loading...</p>
              ) : recognitionCounts.received.length === 0 ? (
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">No recognitions in this date range.</p>
              ) : (
                <PersonRow
                  people={recognitionCounts.received
                    .slice(0, 3)
                    .map((p) => ({ name: p.name, dept: p.dept, photoURL: p.photoURL, count: p.count }))}
                  keyPrefix="received"
                />
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide text-center pb-4 mb-6 border-b border-gray-200">
                Most Recognitions Given
              </h3>
              {isLoadingRecognitions ? (
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">Loading...</p>
              ) : recognitionCounts.given.length === 0 ? (
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">No recognitions in this date range.</p>
              ) : (
                <PersonRow
                  people={recognitionCounts.given
                    .slice(0, 3)
                    .map((p) => ({ name: p.name, dept: p.dept, photoURL: p.photoURL, count: p.count }))}
                  keyPrefix="given"
                />
              )}
            </div>

          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">

            {overviewStatsError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-bold rounded-xl p-4">
                {overviewStatsError}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              <div className="xl:col-span-9 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      label: "Total Recognitions",
                      value: overviewStats?.totalRecognitions,
                      change: overviewStats?.totalRecognitionsChange,
                    },
                    {
                      label: "Active Participants",
                      value: overviewStats?.activeParticipants,
                      change: overviewStats?.activeParticipantsChange,
                    },
                    {
                      label: "Engagement Rate",
                      value: overviewStats ? `${Math.round(overviewStats.engagementRate)}%` : undefined,
                      change: overviewStats?.engagementRateChange,
                    },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">
                        {isLoadingOverviewStats && !overviewStats ? '—' : (stat.value ?? 0)}
                      </p>
                      {overviewStats && (
                        <p className="text-[11px] font-black mt-1">
                          <span className={stat.change >= 0 ? 'text-[#39df2b]' : 'text-red-500'}>
                            {formatSignedPct(stat.change)}
                          </span>
                          <span className="text-gray-400 font-bold ml-1">vs previous period.</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Recognitions Over Time</h3>
                  <div className="h-44 w-full">
                    {isLoadingTrend && monthlyTrend.length === 0 ? (
                      <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-14">Loading...</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyTrend} margin={{ left: -25, right: 10, top: 5, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} fontWeight="bold" tickLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={11} fontWeight="bold" tickLine={false} allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="#447eff" strokeWidth={3} dot={{ r: 4, fill: '#447eff' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">Recognitions by Department</h3>
                  {overviewPieData.length === 0 ? (
                    <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">
                      {isLoadingOverviewStats ? 'Loading...' : 'No recognitions in this date range.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                      <div className="md:col-span-7 grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-bold text-gray-700">
                        {overviewPieData.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                            <span className="truncate">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="md:col-span-5 h-44 flex justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={overviewPieData}
                              cx="50%" cy="50%"
                              innerRadius={50} outerRadius={70}
                              paddingAngle={0} dataKey="value"
                            >
                              {overviewPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Participation Heatmap</h3>
                  {isLoadingHeatmap && heatmap.rows.length === 0 ? (
                    <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-6">Loading...</p>
                  ) : (
                    <div className="space-y-1.5 min-w-[500px]">
                      {heatmap.rows.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-8 text-[11px] font-bold text-gray-400 uppercase text-right mr-1">{row.day}</span>
                          <div className="grid grid-cols-6 gap-1.5 flex-1">
                            {row.months.map((val, i) => (
                              <div
                                key={i}
                                title={`${val} recognition${val === 1 ? '' : 's'}`}
                                className={`h-8 rounded ${getHeatmapColor(val)} border border-white/20 transition-all hover:brightness-95`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="w-8"></span>
                        <div className="grid grid-cols-6 gap-1.5 flex-1 text-center text-[11px] font-bold text-gray-400 uppercase">
                          {heatmap.monthLabels.map((m, i) => <span key={`${m}-${i}`}>{m}</span>)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="xl:col-span-3 space-y-6">
                
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Top Recognized Employees</h3>
                  <div className="space-y-4 flex-1">
                    {isLoadingOverviewStats && !overviewStats ? (
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-4">Loading...</p>
                    ) : (overviewStats?.topEmployees.length === 0) ? (
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-4">No recognitions yet.</p>
                    ) : (
                      overviewStats?.topEmployees.map((emp) => (
                        <div key={emp.id} className="flex items-center gap-3">
                          <PersonAvatar size="w-9 h-9" photoURL={emp.photoURL} name={emp.name} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[12px] font-black text-gray-900 truncate leading-tight">{emp.name}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate mt-0.5">{emp.dept}</p>
                          </div>
                          <span className="text-sm font-black text-blue-600 tracking-tight">{emp.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => setActiveMenu('Recognitions')}
                    className="text-right text-[11px] font-black text-blue-500 hover:underline uppercase tracking-wider mt-4"
                  >
                    View all
                  </button>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Manager Participation</h3>
                  <div className="space-y-4 flex-1">
                    {isLoadingOverviewStats && overviewManagers.length === 0 ? (
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-4">Loading...</p>
                    ) : overviewManagers.length === 0 ? (
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-4">No managers found.</p>
                    ) : (
                      overviewManagers.map((mgr) => {
                        const maxCount = Math.max(1, ...overviewManagers.map((m) => m.count));
                        const barPct = (mgr.count / maxCount) * 100;
                        return (
                          <div key={mgr.id} className="flex items-center gap-3">
                            <PersonAvatar size="w-9 h-9" photoURL={mgr.photoURL} name={mgr.name} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <h4 className="text-[12px] font-black text-gray-900 truncate leading-none">{mgr.name}</h4>
                                <span className="text-[11px] font-black text-gray-800 tracking-tighter shrink-0">{mgr.count}</span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate mt-0.5">{mgr.department}</p>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-[#447eff] h-full rounded-full" style={{ width: `${barPct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <button
                    onClick={() => setActiveMenu('Managers')}
                    className="text-right text-[11px] font-black text-blue-500 hover:underline uppercase tracking-wider mt-4"
                  >
                    View all
                  </button>
                </div>

              </div>

            </div>

            <footer className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Insights</h4>
                <p className="text-xs font-medium text-gray-600 mt-1">
                  {overviewStats ? (
                    <>
                      Recognition activity is{' '}
                      <span className="font-bold text-gray-900">
                        {overviewStats.totalRecognitionsChange >= 0 ? 'up ' : 'down '}
                        {Math.abs(Math.round(overviewStats.totalRecognitionsChange * 10) / 10)}%
                      </span>{' '}
                      compared to the previous period.
                    </>
                  ) : (
                    'Loading insights...'
                  )}
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="bg-[#447eff] hover:bg-blue-600 text-white font-black text-xs tracking-wider uppercase px-6 py-3 rounded-lg shadow-sm transition-all whitespace-nowrap"
              >
                View Detailed Insights
              </button>
            </footer>

          </div>
        )}
      </main>

      {/* ================= REPORTS MODAL ================= */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#447eff]" />
                <h3 className="text-lg font-black text-gray-900">Generate Report</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={reportDateFrom}
                    onChange={(e) => setReportDateFrom(e.target.value)}
                    className="w-full text-sm font-bold text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff]"
                  />
                  <span className="text-gray-400 font-bold text-xs">to</span>
                  <input
                    type="date"
                    value={reportDateTo}
                    onChange={(e) => setReportDateTo(e.target.value)}
                    className="w-full text-sm font-bold text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff]"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2">
                  <Building2 className="w-3.5 h-3.5" />
                  Department
                </label>
                <select
                  value={reportDepartment}
                  onChange={(e) => setReportDepartment(e.target.value)}
                  className="w-full text-sm font-bold text-gray-700 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#447eff]/40 focus:border-[#447eff] bg-white"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2 block">
                  Period
                </label>
                <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                  {['weekly', 'monthly', 'yearly'].map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setReportPeriod(period)}
                      className={`flex-1 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-all duration-150 ${
                        reportPeriod === period
                          ? 'bg-[#447eff] text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs font-medium text-gray-500 pt-1">
                Report will include totals, engagement rate, and department breakdown for the selected{' '}
                <span className="font-black text-gray-900">{reportPeriod}</span> period.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-xs font-black text-gray-500 uppercase tracking-wider px-4 py-2.5 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadReport}
                className="bg-[#447eff] hover:bg-blue-600 text-white font-black text-xs tracking-wider uppercase px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD ANNOUNCEMENT MODAL (message box bara kiya gaya) ================= */}
      {isAnnouncementModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setIsAnnouncementModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#091aa6]" />
                <h3 className="text-lg font-black text-gray-900">New Announcement</h3>
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="border-2 border-purple-500 rounded-lg p-3 bg-white">
                <textarea
                  rows={10}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="What would you like to announce to the team?"
                  className="w-full min-h-[240px] text-sm font-bold text-gray-700 placeholder-gray-400 focus:outline-none resize-y"
                  autoFocus
                />
              </div>
              <p className="text-xs font-medium text-gray-500">
                This will appear at the top of the Announcements list in the sidebar.
              </p>
              {announcementPostError && (
                <p className="text-xs font-bold text-red-600">{announcementPostError}</p>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-xs font-black text-gray-500 uppercase tracking-wider px-4 py-2.5 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePostAnnouncement}
                disabled={isPostingAnnouncement}
                className="bg-[#091aa6] hover:bg-[#071480] disabled:opacity-50 text-white font-black text-xs tracking-wider uppercase px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isPostingAnnouncement ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT USER MODAL (promote to admin / delete) ================= */}
      {editingUser && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-900">Edit User</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3">
                <PersonAvatar
                  size="w-12 h-12"
                  photoURL={editingUser.photoURL}
                  name={`${editingUser.firstName || ''} ${editingUser.lastName || ''}`}
                />
                <div>
                  <p className="text-sm font-black text-gray-900 leading-tight">
                    {`${editingUser.firstName || ''} ${editingUser.lastName || ''}`.trim() || 'Unnamed'}
                  </p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                    {editingUser.role === 'admin' ? 'Admin' : editingUser.role || 'Employee'}
                  </p>
                </div>
              </div>

              {editActionError && (
                <p className="text-xs font-bold text-red-600">{editActionError}</p>
              )}

              <div className="space-y-2 pt-1">
                {editingUser.role === 'admin' ? (
                  <p className="text-xs font-bold text-gray-400 text-center py-2">Already an admin.</p>
                ) : (
                  <button
                    onClick={handlePromoteToAdmin}
                    disabled={isProcessingEditAction}
                    className="w-full flex items-center justify-center gap-2 bg-[#447eff] hover:bg-blue-600 disabled:opacity-50 text-white font-black text-xs tracking-wider uppercase px-4 py-3 rounded-lg shadow-sm transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Promote to Admin
                  </button>
                )}

                <button
                  onClick={handleDeleteUser}
                  disabled={isProcessingEditAction}
                  className={`w-full flex items-center justify-center gap-2 font-black text-xs tracking-wider uppercase px-4 py-3 rounded-lg shadow-sm transition-all disabled:opacity-50 ${
                    isConfirmingDelete
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-white border-2 border-red-500 text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {isConfirmingDelete ? 'Confirm Delete' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}