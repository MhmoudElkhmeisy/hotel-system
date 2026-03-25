"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "./components/layout/navbar";
import { useAuthGuard } from "./hooks/useAuthGuard";
import { getMergedRooms, defaultRoomSettings, type RoomBase } from "./data/hotelData";

type RoomApiItem = {
  id: number;
  name: string;
  price: number;
  capacity: number;
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { authorized, authLoading } = useAuthGuard();
  const [rooms, setRooms] = useState<RoomBase[]>(getMergedRooms(defaultRoomSettings));

  useEffect(() => {
    if (!authorized) return;

    const loadRooms = async () => {
      try {
        const response = await fetch("/api/rooms", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch rooms");
        }

        const apiRooms: RoomApiItem[] = await response.json();
        setRooms(getMergedRooms(apiRooms));
      } catch (error) {
        console.error("Error loading rooms:", error);
        setRooms(getMergedRooms(defaultRoomSettings));
      }
    };

    loadRooms();
  }, [authorized]);

  if (authLoading || !authorized) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f3ef] text-[#0f172a]">
      <Navbar />

      <section className="relative">
        <div className="absolute left-[-120px] top-[-80px] h-[320px] w-[320px] rounded-full bg-[#d9c7a2]/25 blur-3xl" />
        <div className="absolute right-[-100px] top-[120px] h-[320px] w-[320px] rounded-full bg-[#94a3b8]/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[35%] h-[220px] w-[220px] rounded-full bg-[#0f172a]/5 blur-3xl" />

        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-14 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-gray-600 shadow-sm backdrop-blur">
              Premium Hospitality Experience
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#0f172a] md:text-7xl xl:text-[92px]">
              Welcome to
              <span className="block text-[#6b7280]">Barklike Hotel</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              Enjoy a refined stay with elegant rooms, smooth reservations, and dependable
              service designed to make every visit comfortable from start to finish.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/booking"
                className="rounded-full bg-[#0f172a] px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:opacity-95"
              >
                Book Your Stay
              </Link>

              <Link
                href="/rooms"
                className="rounded-full border border-black/10 bg-white/80 px-7 py-4 text-sm font-semibold text-[#0f172a] shadow-sm backdrop-blur transition hover:bg-white"
              >
                Explore Rooms
              </Link>
            </div>

            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                { label: "Guest Rating", value: "4.9", note: "Highly rated guest experience" },
                { label: "Room Options", value: `${rooms.length}`, note: "Carefully selected room categories" },
                { label: "Service", value: "24/7", note: "Support whenever you need it" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
                  className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                    {item.label}
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight">{item.value}</h3>
                  <p className="mt-2 text-sm text-gray-500">{item.note}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative z-10"
          >
            <div className="absolute -left-8 top-12 hidden h-24 w-24 rounded-[28px] bg-white/60 shadow-xl backdrop-blur lg:block" />
            <div className="absolute -right-8 bottom-10 hidden h-32 w-32 rounded-full border border-white/60 bg-[#e8dcc0]/40 blur-2xl lg:block" />

            <div className="rounded-[36px] border border-white/70 bg-white/70 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              <div className="rounded-[30px] bg-[#0f172a] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                      Featured Stay
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold">
                      {rooms[0]?.name || "Executive Suite"}
                    </h3>
                    <p className="mt-2 text-sm text-white/65">
                      Discover premium comfort with flexible dates, elegant room options, and a
                      seamless reservation experience.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                    Available
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                      Check-in
                    </p>
                    <h4 className="mt-2 text-lg font-semibold">18 May 2026</h4>
                  </div>

                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                      Check-out
                    </p>
                    <h4 className="mt-2 text-lg font-semibold">22 May 2026</h4>
                  </div>

                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                      Guests
                    </p>
                    <h4 className="mt-2 text-lg font-semibold">
                      {rooms[0]?.guests || 2} Guests
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                      Rate
                    </p>
                    <h4 className="mt-2 text-lg font-semibold">
                      ${rooms[0]?.price || 320} / night
                    </h4>
                  </div>
                </div>

                <div className="mt-8 rounded-[26px] bg-gradient-to-br from-white/12 to-white/5 p-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-sm text-white/55">Guest Experience</p>
                      <h4 className="mt-1 text-xl font-semibold">Reservations Available</h4>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
                  </div>

                  <div className="grid gap-3 pt-4">
                    <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                      <span className="text-sm text-white/70">Room selection</span>
                      <span className="text-sm font-semibold">Available</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                      <span className="text-sm text-white/70">Live availability</span>
                      <span className="text-sm font-semibold">Updated</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
                      <span className="text-sm text-white/70">Guest support</span>
                      <span className="text-sm font-semibold">Included</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Rooms", value: `${rooms.length}` },
                  {
                    label: "Guests",
                    value: `${rooms.reduce((sum, room) => sum + room.guests, 0)}+`,
                  },
                  { label: "Rating", value: "4.9" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl bg-[#faf8f4] p-4">
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#0f172a]">
                      {item.value}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
              Room Categories
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#0f172a] md:text-5xl">
              Featured Accommodation Types
            </h2>
          </div>

          <p className="max-w-xl text-lg text-gray-600">
            Explore carefully selected room categories designed to deliver comfort,
            elegance, and flexibility for every type of stay.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

                <div className="absolute left-5 top-5 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#0f172a] backdrop-blur">
                  {room.guests} Guests
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/75">
                    Room Category
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{room.name}</h2>
                </div>
              </div>

              <div className="p-7">
                <p className="leading-7 text-gray-600">{room.description}</p>

                <div className="mt-7 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Starting from</p>
                    <h3 className="mt-1 text-3xl font-bold text-[#0f172a]">
                      ${room.price}
                      <span className="ml-1 text-base font-medium text-gray-500">
                        / night
                      </span>
                    </h3>
                  </div>

                  <Link
                    href={`/booking?room=${encodeURIComponent(room.name)}`}
                    className="rounded-full bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    Select Room
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}