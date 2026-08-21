import {
  collection,
  query,
  where,
  getDocs,
  documentId,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { getMonthKey } from "@/lib/month-key";

// Firestore 'in' queries are capped at 10 values per query.
const IN_QUERY_CHUNK_SIZE = 10;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

// Given a list of employee uids, fetch their department in batches of 10
// (Firestore 'in' query limit). Returns a Map<uid, department>.
async function fetchDepartmentsByUid(uids) {
  const departmentByUid = new Map();
  if (uids.length === 0) return departmentByUid;

  const batches = chunk(uids, IN_QUERY_CHUNK_SIZE);
  await Promise.all(
    batches.map(async (batchUids) => {
      const q = query(
        collection(db, "employees"),
        where(documentId(), "in", batchUids)
      );
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        departmentByUid.set(d.id, d.data().department || "");
      });
    })
  );

  return departmentByUid;
}

// Counts recognitions sent/received within [from, to] (inclusive), built
// straight from the `posts` collection's createdAt timestamp — this is
// what makes an arbitrary custom date range possible, as opposed to the
// calendar-month buckets `monthlyPoints` is built around.
//
// Returns:
//   {
//     received: [{ id, name, dept, photoURL, count }, ...],  // sorted desc by count
//     given:    [{ id, name, dept, photoURL, count }, ...],  // sorted desc by count
//   }
//
// `from`/`to` are JS Date objects.
export async function getRecognitionCounts({ from, to }) {
  const postsRef = collection(db, "posts");
  const q = query(
    postsRef,
    where("createdAt", ">=", Timestamp.fromDate(from)),
    where("createdAt", "<=", Timestamp.fromDate(to))
  );

  const snap = await getDocs(q);

  const receivedTotals = new Map(); // recipientId -> { id, name, dept, photoURL, count }
  const givenTotals = new Map(); // senderId -> { id, name, photoURL, count } (dept filled in after)

  snap.docs.forEach((d) => {
    const post = d.data();

    if (post.recipientId) {
      const existing = receivedTotals.get(post.recipientId);
      if (existing) {
        existing.count += 1;
        if (post.recipientPhotoURL) existing.photoURL = post.recipientPhotoURL;
      } else {
        receivedTotals.set(post.recipientId, {
          id: post.recipientId,
          name: post.recipientName || "Unknown",
          dept: post.recipientDepartment || "",
          photoURL: post.recipientPhotoURL || null,
          count: 1,
        });
      }
    }

    if (post.senderId) {
      const existing = givenTotals.get(post.senderId);
      if (existing) {
        existing.count += 1;
        if (post.senderPhotoURL) existing.photoURL = post.senderPhotoURL;
      } else {
        givenTotals.set(post.senderId, {
          id: post.senderId,
          name: post.senderName || "Unknown",
          photoURL: post.senderPhotoURL || null,
          count: 1,
        });
      }
    }
  });

  // Posts don't denormalize the sender's department, so look it up
  // separately for whoever shows up on the "given" side.
  const senderIds = Array.from(givenTotals.keys());
  const departmentByUid = await fetchDepartmentsByUid(senderIds);

  const given = Array.from(givenTotals.values())
    .map((entry) => ({ ...entry, dept: departmentByUid.get(entry.id) || "" }))
    .sort((a, b) => b.count - a.count);

  const received = Array.from(receivedTotals.values()).sort(
    (a, b) => b.count - a.count
  );

  return { received, given };
}

// Department-level rollup of recognitions RECEIVED within [from, to]
// (inclusive), built from the same `posts` collection as
// getRecognitionCounts. Recipients without a department on file are
// grouped under "Unassigned" rather than dropped, so the totals here
// always add up to the full post count.
//
// Returns:
//   {
//     departments: [
//       {
//         dept, count,               // total recognitions received by this dept
//         topEmployees: [{ id, name, dept, photoURL, count }, ...] // top 3, desc by count
//       },
//       ...
//     ] // sorted desc by count
//   }
//
// `from`/`to` are JS Date objects.
export async function getDepartmentRecognitionCounts({ from, to }) {
  const postsRef = collection(db, "posts");
  const q = query(
    postsRef,
    where("createdAt", ">=", Timestamp.fromDate(from)),
    where("createdAt", "<=", Timestamp.fromDate(to))
  );

  const snap = await getDocs(q);

  // dept -> { count, employees: Map<uid, { id, name, dept, photoURL, count }> }
  const deptTotals = new Map();

  snap.docs.forEach((d) => {
    const post = d.data();
    if (!post.recipientId) return;

    const dept = post.recipientDepartment || "Unassigned";

    let deptEntry = deptTotals.get(dept);
    if (!deptEntry) {
      deptEntry = { count: 0, employees: new Map() };
      deptTotals.set(dept, deptEntry);
    }
    deptEntry.count += 1;

    const existingEmp = deptEntry.employees.get(post.recipientId);
    if (existingEmp) {
      existingEmp.count += 1;
      if (post.recipientPhotoURL) existingEmp.photoURL = post.recipientPhotoURL;
    } else {
      deptEntry.employees.set(post.recipientId, {
        id: post.recipientId,
        name: post.recipientName || "Unknown",
        dept,
        photoURL: post.recipientPhotoURL || null,
        count: 1,
      });
    }
  });

  const departments = Array.from(deptTotals.entries())
    .map(([dept, entry]) => ({
      dept,
      count: entry.count,
      topEmployees: Array.from(entry.employees.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    }))
    .sort((a, b) => b.count - a.count);

  return { departments };
}

// Managers Leaderboard: every employee with role "manager", ranked by how
// many recognitions THEY received within [from, to] (inclusive). Managers
// who received zero in range are still included (at count 0) rather than
// dropped, so the leaderboard reflects the full manager population, not
// just whoever happened to get recognized.
//
// Returns:
//   [{ id, name, department, photoURL, count }, ...] // sorted desc by count
//
// `from`/`to` are JS Date objects.
export async function getManagerRecognitionCounts({ from, to }) {
  const employeesRef = collection(db, "employees");
  const managersQuery = query(employeesRef, where("role", "==", "manager"));

  const postsRef = collection(db, "posts");
  const postsQuery = query(
    postsRef,
    where("createdAt", ">=", Timestamp.fromDate(from)),
    where("createdAt", "<=", Timestamp.fromDate(to))
  );

  const [managersSnap, postsSnap] = await Promise.all([
    getDocs(managersQuery),
    getDocs(postsQuery),
  ]);

  // recipientId -> count, built the same way as getRecognitionCounts'
  // receivedTotals, just without the name/dept/photo bookkeeping — those
  // come from the manager's own employee doc below, which is always more
  // current than whatever was denormalized onto a post at send time.
  const receivedCountByUid = new Map();
  postsSnap.docs.forEach((d) => {
    const post = d.data();
    if (!post.recipientId) return;
    receivedCountByUid.set(
      post.recipientId,
      (receivedCountByUid.get(post.recipientId) || 0) + 1
    );
  });

  const managers = managersSnap.docs.map((d) => {
    const emp = d.data();
    return {
      id: d.id,
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Unnamed",
      department: emp.department || "",
      photoURL: emp.photoURL || null,
      count: receivedCountByUid.get(d.id) || 0,
    };
  });

  return managers.sort((a, b) => b.count - a.count);
}

// ===================== Overview tab =====================
// Everything below backs the dashboard's Overview tab: stat cards, the
// "Recognitions Over Time" line chart, the department pie chart, the
// participation heatmap, and the two sidebar lists. All of it reads from
// the same `posts` collection the other tabs already use — nothing new
// needs to be written at post-creation time.

// Shared helper: raw posts created within [from, to], inclusive.
async function fetchPostsInRange(from, to) {
  const postsRef = collection(db, "posts");
  const q = query(
    postsRef,
    where("createdAt", ">=", Timestamp.fromDate(from)),
    where("createdAt", "<=", Timestamp.fromDate(to))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// UTC year & 0-based month index `offset` months before the current UTC
// month (offset=0 is this month). getMonthKey() (lib/month-key.js) reads
// year/month in UTC, so bucket keys have to be built the same way — going
// through a *local* Date and reading its UTC fields back off shifts every
// bucket by a month for any timezone that isn't UTC itself, which is what
// was causing the trend/heatmap to show zero everywhere.
function utcMonthOffset(offset) {
  const now = new Date();
  const total = now.getUTCFullYear() * 12 + now.getUTCMonth() - offset;
  const year = Math.floor(total / 12);
  const monthIndex = ((total % 12) + 12) % 12;
  return { year, monthIndex };
}

function monthKeyFor(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function monthLabelFor(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function pctChange(curr, prev) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

function uniqueParticipantIds(posts) {
  const ids = new Set();
  posts.forEach((p) => {
    if (p.senderId) ids.add(p.senderId);
    if (p.recipientId) ids.add(p.recipientId);
  });
  return ids;
}

// Stat cards (Total Recognitions / Active Participants / Engagement Rate),
// the "Top Recognized Employees" sidebar list, and the department pie
// chart data — all scoped to [from, to], with % change computed against
// the immediately preceding period of equal length (so "this calendar
// month" compares against last calendar month, matching the old mock's
// "vs Apr" framing).
//
// `totalEmployees` is passed in (rather than fetched here) since the
// caller already needs the employee directory for other things — avoids
// a duplicate `employees` collection read.
export async function getOverviewStats({ from, to, totalEmployees }) {
  const rangeMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - rangeMs);

  const [posts, prevPosts] = await Promise.all([
    fetchPostsInRange(from, to),
    fetchPostsInRange(prevFrom, prevTo),
  ]);

  const participants = uniqueParticipantIds(posts);
  const prevParticipants = uniqueParticipantIds(prevPosts);

  const totalRecognitions = posts.length;
  const activeParticipants = participants.size;
  const engagementRate = totalEmployees > 0 ? (activeParticipants / totalEmployees) * 100 : 0;
  const prevEngagementRate =
    totalEmployees > 0 ? (prevParticipants.size / totalEmployees) * 100 : 0;

  // Top recognized employees (by recognitions received) within this range.
  const receivedTotals = new Map();
  posts.forEach((p) => {
    if (!p.recipientId) return;
    const existing = receivedTotals.get(p.recipientId);
    if (existing) {
      existing.count += 1;
    } else {
      receivedTotals.set(p.recipientId, {
        id: p.recipientId,
        name: p.recipientName || "Unknown",
        dept: p.recipientDepartment || "",
        photoURL: p.recipientPhotoURL || null,
        count: 1,
      });
    }
  });
  const topEmployees = Array.from(receivedTotals.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Department breakdown (by recipient department) for the pie chart.
  const deptTotals = new Map();
  posts.forEach((p) => {
    const dept = p.recipientDepartment || "Unassigned";
    deptTotals.set(dept, (deptTotals.get(dept) || 0) + 1);
  });
  const departmentBreakdown = Array.from(deptTotals.entries())
    .map(([dept, count]) => ({ dept, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRecognitions,
    totalRecognitionsChange: pctChange(totalRecognitions, prevPosts.length),
    activeParticipants,
    activeParticipantsChange: pctChange(activeParticipants, prevParticipants.size),
    engagementRate,
    engagementRateChange: pctChange(engagementRate, prevEngagementRate),
    topEmployees,
    departmentBreakdown,
  };
}

// Trailing month-by-month recognition counts for the "Recognitions Over
// Time" line chart. Deliberately independent of the header date range —
// always the last `monthsBack` calendar months up to and including this
// one, so the trend line doesn't collapse to a single point when someone
// picks a narrow custom range.
export async function getMonthlyRecognitionTrend(monthsBack = 6) {
  const { year: startYear, monthIndex: startMonthIndex } = utcMonthOffset(monthsBack - 1);
  const start = new Date(Date.UTC(startYear, startMonthIndex, 1));
  const posts = await fetchPostsInRange(start, new Date());

  // Seed every month bucket up front so months with zero recognitions
  // still show up on the chart instead of being skipped.
  const buckets = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const { year, monthIndex } = utcMonthOffset(i);
    buckets.push({
      key: monthKeyFor(year, monthIndex),
      name: monthLabelFor(year, monthIndex).toUpperCase(),
      count: 0,
    });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));

  posts.forEach((p) => {
    const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : null;
    if (!createdAt) return;
    const bucket = byKey.get(getMonthKey(createdAt));
    if (bucket) bucket.count += 1;
  });

  return buckets;
}

// Participation heatmap: recognition counts by day-of-week x trailing
// calendar month. Shares the same trailing window convention as
// getMonthlyRecognitionTrend but is queried separately since a caller
// may only need one of the two.
export async function getParticipationHeatmap(monthsBack = 6) {
  const { year: startYear, monthIndex: startMonthIndex } = utcMonthOffset(monthsBack - 1);
  const start = new Date(Date.UTC(startYear, startMonthIndex, 1));
  const posts = await fetchPostsInRange(start, new Date());

  const monthKeys = [];
  const monthLabels = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const { year, monthIndex: mIdx } = utcMonthOffset(i);
    monthKeys.push(monthKeyFor(year, mIdx));
    monthLabels.push(monthLabelFor(year, mIdx));
  }
  const monthIndex = new Map(monthKeys.map((k, i) => [k, i]));

  // Row order Mon..Sun to match the dashboard's original layout (JS
  // Date#getDay() returns 0 for Sunday, so it's remapped below).
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const rows = dayOrder.map((dayIdx) => ({
    day: DAY_LABELS[dayIdx],
    months: new Array(monthsBack).fill(0),
  }));
  const rowIndexByDay = new Map(dayOrder.map((dayIdx, rowI) => [dayIdx, rowI]));

  posts.forEach((p) => {
    const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : null;
    if (!createdAt) return;
    const mIdx = monthIndex.get(getMonthKey(createdAt));
    if (mIdx === undefined) return;
    const rowI = rowIndexByDay.get(createdAt.getDay());
    rows[rowI].months[mIdx] += 1;
  });

  return { rows, monthLabels };
}