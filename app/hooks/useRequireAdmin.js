"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export function useRequireAdmin() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/auth/login-form");
        return;
      }

      try {
        // Get the currently signed-in user's employee document.
        const employeeRef = doc(db, "employees", currentUser.uid);
        const employeeSnap = await getDoc(employeeRef);

        if (!employeeSnap.exists()) {
          router.replace("/(protected)/home");
          return;
        }

        const employeeData = employeeSnap.data();

        // Only admins are allowed into the dashboard.
        if (employeeData.role !== "admin") {
          router.replace("/home");
          return;
        }

        setUser(currentUser);
        setCheckingAdmin(false);
      } catch (error) {
        console.error("Admin authorization check failed:", error);
        router.replace("/home");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { user, checkingAdmin };
}