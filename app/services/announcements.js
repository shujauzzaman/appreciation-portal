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