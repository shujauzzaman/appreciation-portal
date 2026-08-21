import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import { getMonthKey, getQuarterMonthKeys, getYearMonthKeys } from "@/lib/month-key";

// Groups monthlyPoints docs by recipient and sums their points. Each doc
// already carries the recipient's name/photo/department (denormalized at
// write time in /api/posts/create), so no extra employee lookups needed.
function aggregateByRecipient(docs) {
  const totals = new Map(); // recipientId -> { id, name, photoURL, department, points }

  docs.forEach((d) => {
    const data = d.data();
    if (!data.recipientId || !data.points) return;

    const existing = totals.get(data.recipientId);
    if (existing) {
      existing.points += data.points;
    } else {
      totals.set(data.recipientId, {
        id: data.recipientId,
        name: data.name || "Unknown",
        photoURL: data.photoURL || null,
        department: data.department || "",
        points: data.points,
      });
    }
  });

  return Array.from(totals.values()).sort((a, b) => b.points - a.points);
}

// Ranked leaderboard for a given period ("month" | "quarter" | "year"),
// built from the `monthlyPoints` collection — one doc per
// (recipient, calendar month), incremented server-side in
// /api/posts/create alongside the lifetime employees.points counter.
//
// Quarter and year aren't separate counters: they're just the sum of the
// relevant month buckets (3 months for a quarter, 12 for a year), so
// there's nothing extra to keep in sync as time passes.
export async function getPeriodLeaderboard(period) {
  const now = new Date();
  const monthKeys =
    period === "quarter" ? getQuarterMonthKeys(now)
    : period === "year" ? getYearMonthKeys(now)
    : [getMonthKey(now)]; // default: "month"

  const monthlyRef = collection(db, "monthlyPoints");
  const q = query(monthlyRef, where("month", "in", monthKeys));
  const snap = await getDocs(q);

  return aggregateByRecipient(snap.docs);
}

// Top point earner for a single calendar year (used by the Hall of Fame's
// "Yearly Winners" row). Built from the same `monthlyPoints` collection as
// getPeriodLeaderboard, just scoped to an arbitrary year instead of "now".
// Returns null if nobody earned points that year yet.
export async function getYearlyTopEmployee(year) {
  const monthKeys = getYearMonthKeys(new Date(Date.UTC(year, 0, 1)));

  const monthlyRef = collection(db, "monthlyPoints");
  const q = query(monthlyRef, where("month", "in", monthKeys));
  const snap = await getDocs(q);

  const ranked = aggregateByRecipient(snap.docs);
  return ranked[0] || null;
}

// All-time leaderboard, read straight from each employee's running
// `points` total (maintained via increment() on every recognition/badge).
// Only includes employees who have actually earned points.
export async function getAllTimeLeaderboard(limitCount = 6) {
  const q = query(
    collection(db, "employees"),
    where("points", ">", 0),
    orderBy("points", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const emp = d.data();
    return {
      id: d.id,
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim().toUpperCase(),
      photoURL: emp.photoURL || null,
      department: emp.department || "",
      points: emp.points || 0,
    };
  });
}