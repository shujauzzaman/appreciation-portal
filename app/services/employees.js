import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

// Fetch a single employee's profile doc by uid
export async function fetchEmployeeById(uid) {
  const snap = await getDoc(doc(db, "employees", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Fetch the full employee directory, optionally excluding one uid (e.g. the current user)
export async function fetchAllEmployees({ excludeUid } = {}) {
  const snap = await getDocs(collection(db, "employees"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((emp) => !excludeUid || emp.id !== excludeUid);
}

// Update just the photoURL field on an employee's doc
export async function updateEmployeePhoto(uid, photoURL) {
  await updateDoc(doc(db, "employees", uid), { photoURL });
}