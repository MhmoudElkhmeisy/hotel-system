"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type CurrentUser = {
  name: string;
  email: string;
  role: string;
};

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadCurrentUser = () => {
      const storedUser = localStorage.getItem("currentUser");

      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse current user:", error);
          localStorage.removeItem("currentUser");
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    loadCurrentUser();

    window.addEventListener("storage", loadCurrentUser);

    return () => {
      window.removeEventListener("storage", loadCurrentUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("bookingDraft");
    localStorage.removeItem("currentCustomerEmail");
    setCurrentUser(null);
    router.push("/login");
  };

  const isAdmin = currentUser?.role === "Admin";
  const isCustomer = currentUser?.role === "Customer";

  const navItem = (href: string, label: string) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`relative rounded-full px-5 py-2.5 text-[15px] font-semibold transition-all duration-300 ${
          active
            ? "bg-[#e8dcc0] text-[#0f172a] shadow-sm"
            : "text-gray-600 hover:scale-[1.05] hover:bg-[#f1ece3] hover:text-[#0f172a]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f172a] text-sm font-bold text-white shadow-lg">
            BH
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gray-500">
              Hotel System
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-[#0f172a]">
              BARKLIKE HOTEL
            </h1>
          </div>
        </div>

        <nav className="hidden items-center gap-3 rounded-full border border-black/5 bg-white/60 px-4 py-2 shadow-sm backdrop-blur md:flex">
          {navItem("/", "Home")}
          {navItem("/rooms", "Rooms")}
          {navItem("/booking", "Booking")}
          {isCustomer && navItem("/my-reservations", "My Reservations")}
          {isAdmin && navItem("/dashboard", "Dashboard")}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <div className="hidden rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-[#0f172a] backdrop-blur md:block">
                {currentUser.name}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-95"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}