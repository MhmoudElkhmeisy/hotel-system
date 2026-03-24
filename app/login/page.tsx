"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  const [isLightOn, setIsLightOn] = useState(false);
  const [isPulled, setIsPulled] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Customer");
  const [adminCode, setAdminCode] = useState("");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      router.push("/");
    }
  }, [router]);

  const handlePullCord = () => {
    setIsLightOn(true);
    setIsPulled(true);
  };

  const handleLogin = async () => {
    if (!name || !email) {
      alert("Please enter your name and email.");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password: "123456",
        adminCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(data));

    if (data.role === "Admin") {
      router.push("/dashboard");
    } else {
      localStorage.setItem("currentCustomerEmail", email);
      router.push("/");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b1020] text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e293b_0%,#0b1020_45%,#050814_100%)]" />
      <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute right-[-100px] bottom-[-80px] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Lamp light */}
      <AnimatePresence>
        {isLightOn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-200/10 blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0.7 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute left-1/2 top-28 h-[420px] w-[620px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,236,179,0.55),rgba(255,236,179,0.12)_42%,rgba(255,236,179,0)_72%)]"
            />
          </>
        )}
      </AnimatePresence>

      {/* Lamp */}
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div className="mx-auto h-20 w-1 bg-white/30" />
        <div className="relative mx-auto flex h-24 w-40 items-start justify-center overflow-hidden rounded-b-[70px] rounded-t-[10px] border border-white/10 bg-gradient-to-b from-[#374151] to-[#111827] shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <div
            className={`mt-3 h-6 w-20 rounded-full transition duration-500 ${
              isLightOn
                ? "bg-yellow-200 shadow-[0_0_60px_rgba(253,224,71,0.85)]"
                : "bg-white/10"
            }`}
          />
        </div>

        {/* Cord */}
        <div className="absolute left-1/2 top-[100px] -translate-x-1/2">
          <div className="h-28 w-[2px] bg-white/50" />
          <button
            onClick={handlePullCord}
            className={`-ml-[10px] h-5 w-5 rounded-full border border-white/40 transition ${
              isPulled
                ? "bg-yellow-300 shadow-[0_0_18px_rgba(253,224,71,0.9)]"
                : "bg-white/80 hover:scale-110"
            }`}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl font-semibold leading-tight md:text-7xl">
              Welcome to
              <span className="block text-yellow-300">
                Aurora Grand Hotel
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white/60">
              Experience luxury booking, seamless reservations, and intelligent
              hotel management — all in one premium system.
            </p>

            <div className="mt-8 flex gap-4">
              <div className="rounded-xl bg-white/5 px-4 py-3">
                <p className="text-sm text-white/40">System</p>
                <h3 className="font-semibold">Live & Secure</h3>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-3">
                <p className="text-sm text-white/40">Access</p>
                <h3 className="font-semibold">Customer / Admin</h3>
              </div>
            </div>
          </motion.div>

          {/* RIGHT FORM */}
          <div className="flex justify-center lg:justify-end">
            {!isLightOn ? (
              <div className="text-center">
                <h2 className="text-2xl text-white/60">
                  Pull the lamp to unlock access
                </h2>
              </div>
            ) : (
              <div className="w-full max-w-md rounded-[36px] border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl">

                <h2 className="text-3xl font-semibold">Access Portal</h2>
                <p className="text-white/60 mt-2">
                  Choose your role and enter your details
                </p>

                <div className="mt-6 grid gap-4">

                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl bg-white/10 px-4 py-3"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl bg-white/10 px-4 py-3"
                  />

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="rounded-xl bg-white/10 px-4 py-3"
                  >
                    <option className="text-black">Customer</option>
                    <option className="text-black">Admin</option>
                  </select>

                  {/* 👇 يظهر بس لو Admin */}
                  {role === "Admin" && (
                    <motion.input
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text"
                      placeholder="Admin Access Code"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="rounded-xl bg-white/10 px-4 py-3 border border-yellow-300"
                    />
                  )}
                </div>

                <button
                  onClick={handleLogin}
                  className="mt-6 w-full rounded-full bg-yellow-300 py-3 font-semibold text-black hover:scale-[1.02] transition"
                >
                  Enter Platform
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}