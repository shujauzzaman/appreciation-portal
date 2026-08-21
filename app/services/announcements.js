import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/config";

// Fetches announcements from Firestore's "announcements" collection.
// Returns [] if the collection doesn't exist yet or is empty — safe to
// call even before you've created any real announcement documents.
export async function fetchAnnouncements(maxCount = 10) {
  const q = query(
    collection(db, "announcements"),
    orderBy("createdAt", "desc"),
    limit(maxCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// "May 2, 2026" style label from a Firestore Timestamp. `createdAt` is
// null for a brief moment right after posting (FieldValue.serverTimestamp()
// resolves once the write round-trips), so this falls back gracefully
// instead of throwing on `.toDate()`.
export function formatAnnouncementDate(createdAt) {
  if (!createdAt?.toDate) return "Just now";
  return createdAt.toDate().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Posts a new announcement via the admin-only API route. The route
// re-verifies the caller is an admin from their own Firestore doc — this
// helper just carries the already-fetched ID token through.
export async function createAnnouncement(idToken, message) {
  const res = await fetch("/api/announcements/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ message }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Something went wrong. Please try again.");
  }

  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}