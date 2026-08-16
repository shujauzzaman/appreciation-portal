"use client";
import { useState, useEffect } from "react";
import { fetchEmployeeById, fetchAllEmployees } from "@/app/services/employees";

// Fetches the logged-in user's own profile doc.
// Exposes setEmployeeData so callers can optimistically update it
// (e.g. right after a profile photo upload) without a refetch.
export function useEmployeeData(uid) {
  const [employeeData, setEmployeeData] = useState(null);
  const [loadingEmployeeData, setLoadingEmployeeData] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let isMounted = true;

    fetchEmployeeById(uid)
      .then((data) => {
        if (isMounted) setEmployeeData(data);
      })
      .catch((err) => console.error("Error fetching employee data:", err))
      .finally(() => {
        if (isMounted) setLoadingEmployeeData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [uid]);

  return { employeeData, setEmployeeData, loadingEmployeeData };
}

// Fetches the full employee directory (excluding the current user),
// used for the "who are you appreciating" recipient picker.
export function useEmployeeDirectory(currentUid) {
  const [allEmployees, setAllEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    if (!currentUid) return;

    fetchAllEmployees({ excludeUid: currentUid })
      .then(setAllEmployees)
      .catch((err) => console.error("Error fetching employee directory:", err))
      .finally(() => setLoadingEmployees(false));
  }, [currentUid]);

  return { allEmployees, loadingEmployees };
}