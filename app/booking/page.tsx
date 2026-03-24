"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/layout/navbar";
import { useHotelData } from "../lib/useHotelData";
import { useAuthGuard } from "../hooks/useAuthGuard";
import {
  getRoomDisplayData,
  type RoomApiItem,
  type RoomDisplayItem,
} from "../lib/getRoomDisplayData";

type AvailabilityResponse = {
  roomType: string;
  capacity: number;
  booked: number;
  remainingCapacity: number;
  available: boolean;
  message?: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomFromQuery = searchParams.get("room");
  const { authorized, authLoading } = useAuthGuard();

  const { offers } = useHotelData();

  const [rooms, setRooms] = useState<RoomDisplayItem[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("Standard Room");
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(1);

  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

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
        console.error("Error loading room options:", error);
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchRooms();
  }, [authorized]);

  useEffect(() => {
    if (rooms.length === 0) return;

    const selectedFromQuery = rooms.some((room) => room.name === roomFromQuery)
      ? roomFromQuery!
      : rooms[0]?.name || "Standard Room";

    setRoomType(selectedFromQuery);
  }, [roomFromQuery, rooms]);

  useEffect(() => {
    if (!roomType || !checkIn || !checkOut) {
      setAvailability(null);
      setAvailabilityError("");
      return;
    }

    const fetchAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");

        const response = await fetch(
          `/api/availability?roomType=${encodeURIComponent(
            roomType
          )}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setAvailability(null);
          setAvailabilityError(
            data?.message || "Failed to check room availability."
          );
          return;
        }

        setAvailability(data);
      } catch (error) {
        console.error("Availability error:", error);
        setAvailability(null);
        setAvailabilityError("Failed to check room availability.");
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [roomType, checkIn, checkOut]);

  useEffect(() => {
    if (!authorized) return;

    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser) as {
        name?: string;
        email?: string;
      };

      if (parsedUser.name) {
        setGuestName(parsedUser.name);
      }

      if (parsedUser.email) {
        setEmail(parsedUser.email);
      }
    } catch (error) {
      console.error("Failed to read current user:", error);
    }
  }, [authorized]);

  const selectedRoom = rooms.find((room) => room.name === roomType);
  const originalPricePerNight = selectedRoom ? selectedRoom.price : 0;

  const activeOffer = offers.length > 0 ? offers[offers.length - 1] : null;
  const discountPercentage = activeOffer ? activeOffer.discount : 0;

  const pricePerNight = useMemo(() => {
    if (!originalPricePerNight) return 0;
    if (!activeOffer) return originalPricePerNight;

    return Math.round(
      originalPricePerNight - originalPricePerNight * (discountPercentage / 100)
    );
  }, [originalPricePerNight, activeOffer, discountPercentage]);

  const remainingCapacity = availability?.remainingCapacity ?? 0;
  const isFullyBooked = availability ? !availability.available : false;

  const totalPrice = useMemo(() => {
    return pricePerNight * nights;
  }, [pricePerNight, nights]);

  const handleContinueToPayment = () => {
    if (!guestName || !email || !checkIn || !checkOut) {
      alert("Please complete all required booking fields.");
      return;
    }

    if (roomsLoading || rooms.length === 0) {
      alert("Room data is still loading. Please wait a moment.");
      return;
    }

    if (availabilityLoading) {
      alert("Checking room availability. Please wait a moment.");
      return;
    }

    if (!availability) {
      alert("Please select valid dates to check room availability.");
      return;
    }

    if (availabilityError) {
      alert(availabilityError);
      return;
    }

    if (isFullyBooked) {
      alert("This room category is fully booked for the selected dates.");
      return;
    }

    const bookingDraft = {
      id: Date.now(),
      guestName,
      email,
      checkIn,
      checkOut,
      roomType,
      guests,
      nights,
      pricePerNight,
      totalPrice,
      offerTitle: activeOffer?.title || "",
      discountPercentage: activeOffer?.discount || 0,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));
    router.push("/payment");
  };

  if (authLoading || !authorized) {
    return null;
  }

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
            transition={{ duration: 0.55 }}
            className="mb-12"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
              Reservation Form
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
              Book Your Stay
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              Enter guest details, choose your accommodation type, and review the
              estimated booking summary before continuing to payment.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.6, delay: 0.08 }}
              className="rounded-[36px] border border-black/5 bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                  Guest Information
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Reservation Details
                </h2>
              </div>

              <div className="mb-6 rounded-2xl bg-[#faf8f4] p-5">
                <p className="text-sm text-gray-500">Current Availability</p>

                {roomsLoading ? (
                  <h3 className="mt-2 text-xl font-semibold">Loading room data...</h3>
                ) : availabilityLoading ? (
                  <h3 className="mt-2 text-xl font-semibold">Checking availability...</h3>
                ) : availabilityError ? (
                  <h3 className="mt-2 text-xl font-semibold text-red-600">
                    Unable to check availability
                  </h3>
                ) : !availability ? (
                  <h3 className="mt-2 text-xl font-semibold">
                    Select dates to check availability
                  </h3>
                ) : (
                  <h3 className="mt-2 text-xl font-semibold">
                    {isFullyBooked
                      ? `${roomType} is fully booked`
                      : `${remainingCapacity} room(s) remaining in ${roomType}`}
                  </h3>
                )}

                {availabilityError && (
                  <p className="mt-3 text-sm font-semibold text-red-600">
                    ⚠️ {availabilityError}
                  </p>
                )}

                {!roomsLoading && !availabilityLoading && availability && isFullyBooked && (
                  <p className="mt-3 text-sm font-semibold text-red-600">
                    ⚠️ This room category is fully booked for the selected dates. Please select another room or different dates.
                  </p>
                )}

                {activeOffer && (
                  <p className="mt-3 text-sm font-semibold text-emerald-700">
                    🎉 Active offer applied: {activeOffer.title} ({activeOffer.discount}% OFF)
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter guest name"
                    className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Room Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a]"
                    disabled={roomsLoading || rooms.length === 0}
                  >
                    {rooms.map((room) => (
                      <option key={room.name} value={room.name}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Number of Nights
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a]"
                  />
                </div>
              </div>

              <button
                onClick={handleContinueToPayment}
                disabled={isFullyBooked || roomsLoading || availabilityLoading}
                className={`mt-8 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition ${
                  isFullyBooked || roomsLoading || availabilityLoading
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-[#0f172a] hover:-translate-y-0.5 hover:opacity-95"
                }`}
              >
                {roomsLoading
                  ? "Loading..."
                  : availabilityLoading
                  ? "Checking..."
                  : isFullyBooked
                  ? "Room Fully Booked"
                  : "Continue to Payment"}
              </button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.6, delay: 0.14 }}
              className="rounded-[36px] border border-black/5 bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Booking Summary
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Reservation Preview
              </h2>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-[#faf8f4] p-5">
                  <p className="text-sm text-gray-500">Guest</p>
                  <h3 className="mt-2 text-lg font-semibold">
                    {guestName || "Not entered yet"}
                  </h3>
                </div>

                <div className="rounded-2xl bg-[#faf8f4] p-5">
                  <p className="text-sm text-gray-500">Email</p>
                  <h3 className="mt-2 text-lg font-semibold">
                    {email || "Not entered yet"}
                  </h3>
                </div>

                <div className="rounded-2xl bg-[#faf8f4] p-5">
                  <p className="text-sm text-gray-500">Selected Room</p>
                  <h3 className="mt-2 text-lg font-semibold">{roomType}</h3>
                </div>

                {activeOffer && (
                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-gray-500">Applied Offer</p>
                    <h3 className="mt-2 text-lg font-semibold">
                      {activeOffer.title} ({activeOffer.discount}% OFF)
                    </h3>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-gray-500">Guests</p>
                    <h3 className="mt-2 text-lg font-semibold">{guests}</h3>
                  </div>

                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-gray-500">Nights</p>
                    <h3 className="mt-2 text-lg font-semibold">{nights}</h3>
                  </div>
                </div>

                {activeOffer && (
                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-gray-500">Original Rate Per Night</p>
                    <h3 className="mt-2 text-lg font-semibold line-through text-gray-400">
                      ${originalPricePerNight}
                    </h3>
                  </div>
                )}

                <div className="rounded-2xl bg-[#faf8f4] p-5">
                  <p className="text-sm text-gray-500">Rate Per Night</p>
                  <h3 className="mt-2 text-lg font-semibold">${pricePerNight}</h3>
                </div>

                <div className="rounded-2xl bg-[#faf8f4] p-5">
                  <p className="text-sm text-gray-500">Remaining Capacity</p>
                  <h3 className="mt-2 text-lg font-semibold">
                    {availability ? remainingCapacity : "-"}
                  </h3>
                </div>

                <div className="rounded-[28px] bg-[#0f172a] p-6 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
                  <p className="text-sm text-white/70">Estimated Total</p>
                  <h3 className="mt-2 text-4xl font-bold">${totalPrice}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    The total amount is calculated based on the selected room rate
                    multiplied by the number of nights.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}