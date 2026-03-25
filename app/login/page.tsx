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
    <main className="relative min-h-screen overflow-hidden bg-[#07101f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1b2942_0%,#08101f_45%,#030712_100%)]" />
      <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute right-[-120px] bottom-[-100px] h-[340px] w-[340px] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute left-[42%] top-[18%] h-[280px] w-[280px] rounded-full bg-yellow-300/5 blur-3xl" />

      <AnimatePresence>
        {isLightOn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.65 }}
              className="pointer-events-none absolute left-1/2 top-24 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-yellow-200/10 blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0.7 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.65 }}
              className="pointer-events-none absolute left-1/2 top-28 h-[460px] w-[700px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,236,179,0.60),rgba(255,236,179,0.14)_40%,rgba(255,236,179,0)_72%)]"
            />
          </>
        )}
      </AnimatePresence>

      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div className="mx-auto h-20 w-1 bg-white/25" />
        <div className="relative mx-auto flex h-24 w-40 items-start justify-center overflow-hidden rounded-b-[70px] rounded-t-[10px] border border-white/10 bg-gradient-to-b from-[#374151] to-[#111827] shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <div
            className={`mt-3 h-6 w-20 rounded-full transition duration-500 ${
              isLightOn
                ? "bg-yellow-200 shadow-[0_0_60px_rgba(253,224,71,0.85)]"
                : "bg-white/10"
            }`}
          />
        </div>

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
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/60 backdrop-blur">
              Private Guest Access
            </div>

            <h1 className="mt-8 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-7xl">
              Welcome to
              <span className="mt-2 block text-yellow-300">Barklike Hotel</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-white/65 md:text-xl">
              Discover a more refined way to manage your stay, explore elegant room
              options, and access a seamless reservation experience designed around comfort,
              discretion, and convenience.
            </p>

            <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4 backdrop-blur">
                <p className="text-sm text-white/40">Hospitality</p>
                <h3 className="mt-2 text-lg font-semibold">Elegant & Consistent</h3>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4 backdrop-blur">
                <p className="text-sm text-white/40">Guest Access</p>
                <h3 className="mt-2 text-lg font-semibold">Private Client Portal</h3>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center lg:justify-end">
            {!isLightOn ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-white/35">
                  Entrance
                </p>
                <h2 className="mt-4 text-2xl font-medium text-white/70">
                  Pull the lamp to enter
                </h2>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55 }}
                className="w-full max-w-md rounded-[36px] border border-white/10 bg-white/10 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
              >
                <div className="mb-6">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/40">
                    Access Portal
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">Welcome Back</h2>
                  <p className="mt-2 text-white/60">
                    Enter your details below to continue to your guest experience.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm text-white/50">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-300/60 focus:bg-white/[0.12]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/50">Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-yellow-300/60 focus:bg-white/[0.12]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/50">Access Type</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-yellow-300/60 focus:bg-white/[0.12]"
                    >
                      <option className="text-black">Customer</option>
                      <option className="text-black">Admin</option>
                    </select>
                  </div>

                  {role === "Admin" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="mb-2 block text-sm text-white/50">
                        Admin Access Code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter admin access code"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        className="w-full rounded-2xl border border-yellow-300/60 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:bg-white/[0.12]"
                      />
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={handleLogin}
                  className="mt-7 w-full rounded-full bg-yellow-300 py-3.5 font-semibold text-black shadow-[0_12px_30px_rgba(253,224,71,0.25)] transition hover:scale-[1.015] hover:opacity-95"
                >
                  Continue to Portal
                </button>

                <p className="mt-5 text-center text-sm text-white/40">
                  Your access is reserved for registered guests and authorized administrators.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}