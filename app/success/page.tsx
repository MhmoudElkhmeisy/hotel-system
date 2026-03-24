"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/layout/navbar";
import { useAuthGuard } from "../hooks/useAuthGuard";

type ReservationDetails = {
  id: number;
  guestName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  roomTypeId: number;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const { authorized, authLoading } = useAuthGuard();

  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const reservationId = searchParams.get("id");

  useEffect(() => {
    if (!authorized) return;

    const loadReservation = async () => {
      try {
        if (!reservationId) {
          setLoading(false);
          return;
        }

        const response = await fetch("/api/reservations", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reservations");
        }

        const data: ReservationDetails[] = await response.json();
        const matchedReservation = data.find(
          (item) => String(item.id) === String(reservationId)
        );

        setReservation(matchedReservation || null);
      } catch (error) {
        console.error("Error loading reservation:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [authorized, reservationId]);

  if (authLoading || !authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#0f172a]">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute left-[-100px] top-[-60px] h-[240px] w-[240px] rounded-full bg-[#d9c7a2]/20 blur-3xl" />
        <div className="absolute right-[-80px] top-[120px] h-[240px] w-[240px] rounded-full bg-[#94a3b8]/15 blur-3xl" />

        <div className="mx-auto max-w-5xl px-6 py-16">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.5 }}
            className="rounded-[36px] border border-black/5 bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.06)] md:p-10"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Reservation Completed
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Thank You for Your Booking
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
                Your reservation has been successfully submitted. A confirmation summary
                is shown below for your review.
              </p>
            </div>

            <div className="mt-10">
              {loading ? (
                <div className="rounded-2xl bg-[#faf8f4] p-6 text-center text-gray-600">
                  Loading reservation details...
                </div>
              ) : !reservation ? (
                <div className="rounded-2xl bg-[#faf8f4] p-6 text-center text-gray-600">
                  Reservation details could not be found.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-[#faf8f4] p-5">
                      <p className="text-sm text-gray-500">Reservation ID</p>
                      <h3 className="mt-2 text-lg font-semibold">#{reservation.id}</h3>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] p-5">
                      <p className="text-sm text-gray-500">Guest Name</p>
                      <h3 className="mt-2 text-lg font-semibold">{reservation.guestName}</h3>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-[#faf8f4] p-5">
                      <p className="text-sm text-gray-500">Email</p>
                      <h3 className="mt-2 text-lg font-semibold">{reservation.email}</h3>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] p-5">
                      <p className="text-sm text-gray-500">Room Type</p>
                      <h3 className="mt-2 text-lg font-semibold">{reservation.roomType}</h3>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-[#faf8f4] p-5">
                      <p className="text-sm text-gray-500">Check-in</p>
                      <h3 className="mt-2 text-lg font-semibold">{reservation.checkIn}</h3>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] p-5">
                      <p className="text-sm text-gray-500">Check-out</p>
                      <h3 className="mt-2 text-lg font-semibold">{reservation.checkOut}</h3>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-[#faf8f4] p-5">
                      <p className="text-sm text-gray-500">Guests</p>
                      <h3 className="mt-2 text-lg font-semibold">{reservation.guests}</h3>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] p-5">
                      <p className="text-sm text-gray-500">Nights</p>
                      <h3 className="mt-2 text-lg font-semibold">{reservation.nights}</h3>
                    </div>

                    <div className="rounded-2xl bg-[#faf8f4] p-5">
                      <p className="text-sm text-gray-500">Payment</p>
                      <h3 className="mt-2 text-lg font-semibold">
                        {reservation.paymentStatus}
                      </h3>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-[#0f172a] p-6 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
                    <p className="text-sm text-white/70">Total Amount</p>
                    <h3 className="mt-2 text-4xl font-bold">${reservation.totalPrice}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/70">
                      Your reservation has been recorded successfully in the system.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/"
                className="rounded-full bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Back to Home
              </Link>

              <Link
                href="/rooms"
                className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-[#faf8f4]"
              >
                Explore More Rooms
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}