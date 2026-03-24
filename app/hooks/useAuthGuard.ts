"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CurrentUser = {
  name: string;
  email: string;
  role: string;
};

export function useAuthGuard(redirectTo: string = "/login") {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.push(redirectTo);
      setAuthLoading(false);
      return;
    }

    try {
      const parsedUser: CurrentUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      setAuthorized(true);
    } catch (error) {
      console.error("Invalid currentUser data:", error);
      localStorage.removeItem("currentUser");
      router.push(redirectTo);
    } finally {
      setAuthLoading(false);
    }
  }, [router, redirectTo]);

  return {
    authorized,
    authLoading,
    currentUser,
  };
}