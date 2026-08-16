"use client";
import React, { useState } from 'react';
import { Menu, ChevronDown, Download, X, Calendar, Building2, FileText, Megaphone, Plus, Send } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';

export default function RecognitionDashboard() {
  // 1. Mock Real Data State (Isko aap API response se replace kar sakte hain)
  const [dashboardData] = useState({
    stats: {
      totalRecognitions: { value: "1,248", change: "+18.6%", vs: "Apr" },
      activeParticipants: { value: "642", change: "+16.3%", vs: "Apr" },
      engagementRate: { value: "74%", change: "+12.8%", vs: "Apr" }
    },
    lineChartData: [
      { name: 'DEC', count: 8 },
      { name: 'JAN', count: 18 },
      { name: 'FEB', count: 20 },
      { name: 'MAR', count: 32 },
      { name: 'APR', count: 35 },
    ],
    pieChartData: [
      { name: 'Sales', value: 30, color: '#447eff' },
      { name: 'Finance', value: 22.7, color: '#9d7cff' },
      { name: 'Marketing', value: 13.6, color: '#fbc46d' },
      { name: 'HR', value: 6.5, color: '#ff708b' },
      { name: 'R&D', value: 11.2, color: '#ffd043' },
      { name: 'IT', value: 16, color: '#8ce2ff' },
    ],
    topEmployees: [
      { name: "Muhammad Muhammad", dept: "Marketing", count: 48 },
      { name: "Muhammad Muhammad", dept: "GTM", count: 42 },
      { name: "Muhammad Muhammad", dept: "Production", count: 39 },
      { name: "Muhammad Muhammad", dept: "People and Culture", count: 36 },
      { name: "Muhammad Muhammad", dept: "Procurement", count: 31 },
    ],
    managerParticipation: [
      { name: "Muhammad Muhammad", dept: "Marketing", rate: 72 },
      { name: "Muhammad Muhammad", dept: "GTM", rate: 68 },
      { name: "Muhammad Muhammad", dept: "Production", rate: 54 },
      { name: "Muhammad Muhammad", dept: "People and Culture", rate: 51 },
      { name: "Muhammad Muhammad", dept: "Procurement", rate: 48 },
    ],
    heatmapData: [
      { day: 'Mon', months: [2, 3, 4, 5, 6, 4] },
      { day: 'Tue', months: [1, 2, 5, 6, 7, 5] },
      { day: 'Wed', months: [3, 4, 6, 8, 9, 6] },
      { day: 'Thu', months: [2, 5, 7, 9, 8, 5] },
      { day: 'Fri', months: [4, 6, 8, 9, 7, 4] },
      { day: 'Sat', months: [1, 2, 3, 4, 5, 3] },
      { day: 'Sun', months: [1, 1, 2, 3, 4, 2] },
    ],
    // ===== data for the "Recognitions" page =====
    mostRecognitionsReceived: [
      { name: "Muhammad Muhammad", dept: "dept" },
      { name: "Muhammad Muhammad", dept: "dept" },
      { name: "Muhammad Muhammad", dept: "dept" },
    ],
    mostRecognitionsGiven: [
      { name: "Muhammad Muhammad", dept: "dept" },
      { name: "Muhammad Muhammad", dept: "dept" },
      { name: "Muhammad Muhammad", dept: "dept" },
    ],
    // ===== data for the "Users" page =====
    usersLog: Array.from({ length: 20 }, () => ({ name: "Muhammad Muhammad" })),
    // ===== data for the "Departments" page =====
    mostRecognizingDepts: [
      {
        deptName: "Marketing",
        recognitionsCount: 48,
        employees: [
          { name: "Muhammad Muhammad", dept: "dept" },
          { name: "Muhammad Muhammad", dept: "dept" },
          { name: "Muhammad Muhammad", dept: "dept" },
        ],
      },
      {
        deptName: "GTM",
        recognitionsCount: 42,
        employees: [
          { name: "Muhammad Muhammad", dept: "dept" },
          { name: "Muhammad Muhammad", dept: "dept" },
          { name: "Muhammad Muhammad", dept: "dept" },
        ],
      },
      {
        deptName: "Production",
        recognitionsCount: 39,
        employees: [
          { name: "Muhammad Muhammad", dept: "dept" },
          { name: "Muhammad Muhammad", dept: "dept" },
          { name: "Muhammad Muhammad", dept: "dept" },
        ],
      },
      {
        deptName: "People and Culture",
        recognitionsCount: 36,
        employees: [
          { name: "Muhammad Muhammad", dept: "dept" },
          { name: "Muhammad Muhammad", dept: "dept" },
          { name: "Muhammad Muhammad", dept: "dept" },
        ],
      },
    ],
    departmentalLeaderboard: [
      { dept: "Marketing", count: 48 },
      { dept: "GTM", count: 42 },
      { dept: "Production", count: 39 },
      { dept: "People and Culture", count: 36 },
      { dept: "Procurement", count: 31 },
    ],
    // ===== data for the "Managers" page =====
    managersLeaderboard: Array.from({ length: 12 }, () => ({
      name: "Muhammad Muhammad",
      dept: "dept",
      recognitions: "recognitions",
    })),
  });

  const [activeMenu, setActiveMenu] = useState('Overview');
  const [selectedPersonKey, setSelectedPersonKey] = useState(null); // e.g. "received-2"

  // ===== Reports popup state (opened from header "Report" button) =====
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'
  const [reportDepartment, setReportDepartment] = useState('All Departments');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');

  const departmentOptions = ['All Departments', ...dashboardData.departmentalLeaderboard.map((d) => d.dept)];

  const handleEditUser = (index) => {
    alert(`Edit user #${index + 1} — hook this up to your edit flow.`);
  };

  // Builds and downloads a CSV report based on the selected filters.
  // Replace the `rows` source with real filtered/aggregated data from your API
  // once weekly/monthly/yearly + date range + department querying is wired up on the backend.
  const handleDownloadReport = () => {
    const periodLabel = reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1);

    const rows = [
      ['Metric', 'Value'],
      ['Report Period', periodLabel],
      ['Department', reportDepartment],
      ['From', reportDateFrom || '-'],
      ['To', reportDateTo || '-'],
      ['Total Recognitions', dashboardData.stats.totalRecognitions.value],
      ['Active Participants', dashboardData.stats.activeParticipants.value],
      ['Engagement Rate', dashboardData.stats.engagementRate.value],
      [],
      ['Department', 'Recognitions'],
      ...dashboardData.departmentalLeaderboard
        .filter((d) => reportDepartment === 'All Departments' || d.dept === reportDepartment)
        .map((d) => [d.dept, d.count]),
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

  // Reusable avatar bubble (matches the sky/green placeholder look used elsewhere)
  const PersonAvatar = ({ size = "w-20 h-20" }) => (
    <div className={`${size} rounded-full border-2 border-white overflow-hidden bg-sky-100 relative shrink-0 shadow-inner`}>
      <div className="absolute inset-0 bg-sky-200/70"></div>
      <div className="absolute bottom-0 w-full h-1/3 bg-green-500 rounded-t-full"></div>
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
            <PersonAvatar />
            <div className="text-left">
              <h4 className="text-sm font-black text-gray-900 leading-tight">{person.name}</h4>
              <p className="text-xs font-bold text-gray-400">{person.dept}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  // ===== Announcements state (sidebar "+ Add" popup) =====
  const [announcements, setAnnouncements] = useState([
    { id: 1, message: "Welcome to the new Recognition Dashboard! 🎉", postedAt: "May 2, 2026" },
  ]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  const openAnnouncementModal = () => {
    setAnnouncementText('');
    setIsAnnouncementModalOpen(true);
  };

  const handlePostAnnouncement = () => {
    if (!announcementText.trim()) {
      alert("Please write your announcement message.");
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      message: announcementText.trim(),
      postedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    // Newest announcement shows first
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setAnnouncementText('');
    setIsAnnouncementModalOpen(false);
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
            {announcements.length === 0 ? (
              <p className="text-[11px] font-bold text-white/50 px-1">No announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="bg-white/10 border border-white/10 rounded-lg p-3">
                  <p className="text-xs font-bold text-white leading-snug break-words">{a.message}</p>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide mt-1.5">{a.postedAt}</p>
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
            <button className="bg-[#447eff] hover:bg-blue-600 text-white font-bold text-xs tracking-wide px-5 py-2.5 rounded-full flex items-center gap-6 shadow-sm transition-all">
              <span>May 1 - May 31, 2026</span>
              <ChevronDown className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </header>

        {activeMenu === 'Managers' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">
            <div className="bg-white p-6 rounded-xl border-2 border-purple-500 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide text-center pb-4 mb-6 border-b border-gray-200">
                Managers Leaderboard
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
                {dashboardData.managersLeaderboard.map((mgr, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <PersonAvatar />
                    <div className="text-left">
                      <h4 className="text-sm font-black text-gray-900 leading-tight">{mgr.name}</h4>
                      <p className="text-xs font-bold text-gray-400">{mgr.dept} - {mgr.recognitions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeMenu === 'Departments' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">
              Most Recognizing Depts
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

              <div className="xl:col-span-8 space-y-6">
                {dashboardData.mostRecognizingDepts.map((deptGroup, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-200">
                      <h4 className="text-base font-black text-gray-900 uppercase tracking-wide">
                        {deptGroup.deptName || 'Dept Name'}
                      </h4>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">
                        No. of<br />Recognitions
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      {deptGroup.employees.map((emp, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <PersonAvatar size="w-14 h-14" />
                          <div className="text-left">
                            <h5 className="text-xs font-black text-gray-900 leading-tight">{emp.name}</h5>
                            <p className="text-[11px] font-bold text-gray-400">{emp.dept}</p>
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
                    {dashboardData.departmentalLeaderboard.map((row, index) => (
                      <div key={index} className={`flex items-center justify-between ${index > 0 ? 'pt-4' : ''}`}>
                        <span className="text-sm font-black text-gray-900">{row.dept}</span>
                        <span className="text-sm font-black text-blue-600">{row.count}</span>
                      </div>
                    ))}
                  </div>
                  <button className="text-right text-[11px] font-black text-blue-500 hover:underline uppercase tracking-wider mt-4">View all</button>
                </div>
              </div>

            </div>
          </div>
        ) : activeMenu === 'Users' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide text-center pb-4 mb-6 border-b border-gray-200">
                Users Log
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8">
                {dashboardData.usersLog.map((user, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <PersonAvatar />
                    <div className="text-left">
                      <h4 className="text-sm font-black text-gray-900 leading-tight">{user.name}</h4>
                      <button
                        type="button"
                        onClick={() => handleEditUser(index)}
                        className="text-xs font-bold text-gray-500 underline hover:text-blue-600"
                      >
                        edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : activeMenu === 'Recognitions' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide text-center pb-4 mb-6 border-b border-gray-200">
                Most Recognitions Received
              </h3>
              <PersonRow people={dashboardData.mostRecognitionsReceived} keyPrefix="received" />
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-wide text-center pb-4 mb-6 border-b border-gray-200">
                Most Recognitions Given
              </h3>
              <PersonRow people={dashboardData.mostRecognitionsGiven} keyPrefix="given" />
            </div>

          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-[1400px] w-full mx-auto">
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              <div className="xl:col-span-9 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Total Recognitions", data: dashboardData.stats.totalRecognitions },
                    { label: "Active Participants", data: dashboardData.stats.activeParticipants },
                    { label: "Engagement Rate", data: dashboardData.stats.engagementRate },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">{stat.data.value}</p>
                      <p className="text-[11px] font-black mt-1">
                        <span className="text-[#39df2b]">{stat.data.change}</span> 
                        <span className="text-gray-400 font-bold ml-1">vs {stat.data.vs}.</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Recognitions Over Time</h3>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardData.lineChartData} margin={{ left: -25, right: 10, top: 5, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} fontWeight="bold" tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={11} fontWeight="bold" tickLine={false} domain={[0, 40]} ticks={[0, 10, 20, 30, 40]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#447eff" strokeWidth={3} dot={{ r: 4, fill: '#447eff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">Recognitions by Department</h3>
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                    <div className="md:col-span-7 grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-bold text-gray-700">
                      {dashboardData.pieChartData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                          <span>{entry.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="md:col-span-5 h-44 flex justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.pieChartData}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={70}
                            paddingAngle={0} dataKey="value"
                          >
                            {dashboardData.pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Participation Heatmap</h3>
                  <div className="space-y-1.5 min-w-[500px]">
                    {dashboardData.heatmapData.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-8 text-[11px] font-bold text-gray-400 uppercase text-right mr-1">{row.day}</span>
                        <div className="grid grid-cols-6 gap-1.5 flex-1">
                          {row.months.map((val, i) => (
                            <div key={i} className={`h-8 rounded ${getHeatmapColor(val)} border border-white/20 transition-all hover:brightness-95`} />
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="w-8"></span>
                      <div className="grid grid-cols-6 gap-1.5 flex-1 text-center text-[11px] font-bold text-gray-400 uppercase">
                        {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => <span key={m}>{m}</span>)}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="xl:col-span-3 space-y-6">
                
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Top Recognized Employees</h3>
                  <div className="space-y-4 flex-1">
                    {dashboardData.topEmployees.map((emp, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-sky-100 relative shrink-0 shadow-inner">
                          <div className="absolute inset-0 bg-sky-200/70"></div>
                          <div className="absolute bottom-0 w-full h-3 bg-green-500 rounded-t-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[12px] font-black text-gray-900 truncate leading-tight">{emp.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate mt-0.5">{emp.dept}</p>
                        </div>
                        <span className="text-sm font-black text-blue-600 tracking-tight">{emp.count}</span>
                      </div>
                    ))}
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
                    {dashboardData.managerParticipation.map((mgr, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-sky-100 relative shrink-0 shadow-inner">
                          <div className="absolute inset-0 bg-sky-200/70"></div>
                          <div className="absolute bottom-0 w-full h-3 bg-green-500 rounded-t-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="text-[12px] font-black text-gray-900 truncate leading-none">{mgr.name}</h4>
                            <span className="text-[11px] font-black text-gray-800 tracking-tighter shrink-0">{mgr.rate}%</span>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate mt-0.5">{mgr.dept}</p>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-[#447eff] h-full rounded-full" style={{ width: `${mgr.rate}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="text-right text-[11px] font-black text-blue-500 hover:underline uppercase tracking-wider mt-4">View all</button>
                </div>

              </div>

            </div>

            <footer className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Insights</h4>
                <p className="text-xs font-medium text-gray-600 mt-1">
                  Recognition activity went upto <span className="font-bold text-gray-900">16.8% this month</span> as compared to the last month.
                </p>
              </div>
              <button className="bg-[#447eff] hover:bg-blue-600 text-white font-black text-xs tracking-wider uppercase px-6 py-3 rounded-lg shadow-sm transition-all whitespace-nowrap">
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
                className="bg-[#091aa6] hover:bg-[#071480] text-white font-black text-xs tracking-wider uppercase px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Post Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}