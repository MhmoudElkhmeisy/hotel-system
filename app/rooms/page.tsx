"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/layout/navbar";
import { useAuthGuard } from "../hooks/useAuthGuard";
import {
  getRoomDisplayData,
  type RoomApiItem,
  type RoomDisplayItem,
} from "../lib/getRoomDisplayData";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export default function RoomsPage() {
  const { authorized, authLoading } = useAuthGuard();

  const [rooms, setRooms] = useState<RoomDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorized) return;

    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch rooms");
        }

        const data: RoomApiItem[] = await response.json();
        setRooms(getRoomDisplayData(data));
      } catch (error) {
        console.error("Error loading rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [authorized]);

  if (authLoading || !authorized) return null;

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#0f172a]">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute left-[-120px] top-[-60px] h-[260px] w-[260px] rounded-full bg-[#d9c7a2]/20 blur-3xl" />
        <div className="absolute right-[-80px] top-[100px] h-[240px] w-[240px] rounded-full bg-[#94a3b8]/15 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 py-16">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
              Rooms & Suites
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
              Explore Our Rooms
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              Browse available room categories with pricing, capacity, and
              descriptions before making a reservation.
            </p>
          </motion.div>

          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-center text-gray-600 shadow">
              Loading rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center text-gray-600 shadow">
              No rooms available.
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {rooms.map((room, index) => (
                <motion.div
                  key={room.name}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: index * 0.08 }}
                  className="group overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)]"
                >
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    <div className="absolute left-5 top-5 rounded-full bg-white/80 px-4 py-2 text-sm font-medium">
                      {room.capacity} Guests
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <p className="text-sm uppercase tracking-[0.2em]">
                        Room Type
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold">
                        {room.name}
                      </h2>
                    </div>
                  </div>

                  <div className="p-7">
                    <p className="text-gray-600">{room.description}</p>

                    <div className="mt-7 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Starting from
                        </p>
                        <h3 className="mt-1 text-3xl font-bold">
                          ${room.price}
                          <span className="ml-1 text-base text-gray-500">
                            / night
                          </span>
                        </h3>
                      </div>

                      <Link
                        href={`/booking?room=${encodeURIComponent(room.name)}`}
                        className="rounded-full bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}