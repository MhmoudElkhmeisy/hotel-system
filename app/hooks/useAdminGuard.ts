"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CurrentUser = {
  name: string;
  email: string;
  role: string;
};

export function useAdminGuard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const currentUser: CurrentUser = JSON.parse(storedUser);

      if (currentUser.role !== "Admin") {
        router.push("/");
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error("Invalid currentUser data:", error);
      localStorage.removeItem("currentUser");
      router.push("/login");
      return;
    } finally {
      setAuthLoading(false);
    }
  }, [router]);

  return {
    authorized,
    authLoading,
  };
}