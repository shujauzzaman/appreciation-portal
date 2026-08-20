import { collection, query, where, getDocs, Timestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";

// Start-of-period boundaries, computed in the browser's local time.
function getPeriodStart(period) {
  const now = new Date();
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (period === "quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    return new Date(now.getFullYear(), quarterStartMonth, 1);
  }
  if (period === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }
  // Fallback: no lower bound (all-time)
  return null;
}

// Ranked leaderboard for a given period ("month" | "quarter" | "year"),
// built by summing each post's pointsAwarded per recipient. Each post
// already carries the recipient's name/photo/department at the time it
// was sent, so no extra employee lookups are needed.
export async function getLeaderboard(period) {
  const startDate = getPeriodStart(period);

  const postsRef = collection(db, "posts");
  const q = startDate
    ? query(postsRef, where("createdAt", ">=", Timestamp.fromDate(startDate)))
    : query(postsRef);

  const snap = await getDocs(q);

  const totals = new Map(); // recipientId -> { id, name, photoURL, department, points }
  snap.docs.forEach((d) => {
    const post = d.data();
    if (!post.recipientId || !post.pointsAwarded) return;

    const existing = totals.get(post.recipientId);
    if (existing) {
      existing.points += post.pointsAwarded;
    } else {
      totals.set(post.recipientId, {
        id: post.recipientId,
        name: post.recipientName || "Unknown",
        photoURL: post.recipientPhotoURL || null,
        department: post.recipientDepartment || "",
        points: post.pointsAwarded,
      });
    }
  });

  return Array.from(totals.values()).sort((a, b) => b.points - a.points);
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