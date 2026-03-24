"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/layout/navbar";
import Toast from "../components/ui/toast";
import { useAuthGuard } from "../hooks/useAuthGuard";

type BookingDraft = {
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
  createdAt: string;
  offerTitle?: string;
  discountPercentage?: number;
};

type CreatedReservation = {
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
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export default function PaymentPage() {
  const router = useRouter();
  const { authorized, authLoading } = useAuthGuard();

  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!authorized) return;

    const storedDraft = localStorage.getItem("bookingDraft");

    if (!storedDraft) {
      router.push("/booking");
      return;
    }

    setBookingDraft(JSON.parse(storedDraft));
  }, [authorized, router]);

  const canPayNow = useMemo(() => {
    if (paymentMethod !== "Credit Card") return true;
    return !!(cardName && cardNumber && expiryDate && cvv);
  }, [paymentMethod, cardName, cardNumber, expiryDate, cvv]);

  const saveReservation = async (paymentStatus: string) => {
    if (!bookingDraft || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage("");

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestName: bookingDraft.guestName,
          email: bookingDraft.email,
          checkIn: bookingDraft.checkIn,
          checkOut: bookingDraft.checkOut,
          roomType: bookingDraft.roomType,
          guests: bookingDraft.guests,
          nights: bookingDraft.nights,
          pricePerNight: bookingDraft.pricePerNight,
          totalPrice: bookingDraft.totalPrice,
          paymentMethod,
          paymentStatus,
          status: "Confirmed",
        }),
      });

      const result = await response.json();
      const apiMessage =
        typeof result === "object" &&
        result !== null &&
        "message" in result &&
        typeof result.message === "string"
          ? result.message
          : undefined;

      if (!response.ok) {
        if (response.status === 409) {
          setErrorMessage(
            apiMessage ||
              "This room is no longer available for the selected dates. Please return to the booking page and choose different dates or another room type."
          );
        } else if (response.status === 400) {
          setErrorMessage(
            apiMessage ||
              "The reservation data is invalid. Please review the selected dates and booking details."
          );
        } else if (response.status === 404) {
          setErrorMessage(
            apiMessage ||
              "The selected room type could not be found. Please go back and try again."
          );
        } else {
          setErrorMessage(
            apiMessage ||
              "An unexpected server error occurred while saving your reservation."
          );
        }

        setSubmitting(false);
        return;
      }

      const createdReservation = result as CreatedReservation;

      localStorage.removeItem("bookingDraft");
      setShowToast(true);

      setTimeout(() => {
        router.push(`/success?id=${createdReservation.id}`);
      }, 1600);
    } catch (error) {
      console.error("Reservation save error:", error);
      setErrorMessage(
        "A network or server error occurred while saving your reservation. Please try again."
      );
      setSubmitting(false);
    }
  };

  const handlePayNow = () => {
    if (!bookingDraft) return;

    if (!canPayNow) {
      setErrorMessage("Please complete all payment details before continuing.");
      return;
    }

    saveReservation("Paid");
  };

  const handlePayAtHotel = () => {
    if (!bookingDraft) return;
    saveReservation("Pay at Hotel");
  };

  if (authLoading || !authorized || !bookingDraft) return null;

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#0f172a]">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute left-[-100px] top-[-60px] h-[240px] w-[240px] rounded-full bg-[#d9c7a2]/20 blur-3xl" />
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
              Payment Page
            </p>

            <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
              Complete Your Payment
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
              Review the booking information and choose the preferred payment method
              to finalize the reservation with a polished checkout experience.
            </p>
          </motion.div>

          {errorMessage && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mb-8 rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
                Reservation Notice
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                Unable to complete this booking
              </h3>
              <p className="mt-3 text-base leading-7">{errorMessage}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/booking")}
                  className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Back to Booking
                </button>

                <button
                  onClick={() => setErrorMessage("")}
                  className="rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.6, delay: 0.08 }}
              className="rounded-[36px] border border-black/5 bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Payment Method
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Billing Details
              </h2>

              <div className="mt-8 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Choose Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option>Credit Card</option>
                    <option>Cash</option>
                    <option>Wallet</option>
                  </select>
                </div>

                {paymentMethod === "Credit Card" && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Enter cardholder name"
                        disabled={submitting}
                        className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="**** **** **** ****"
                        disabled={submitting}
                        className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          disabled={submitting}
                          className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="***"
                          disabled={submitting}
                          className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3.5 outline-none transition focus:border-[#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="rounded-[28px] bg-[#faf8f4] p-5">
                  <p className="text-sm text-gray-500">Selected Method</p>
                  <h3 className="mt-2 text-xl font-semibold">{paymentMethod}</h3>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={handlePayNow}
                    disabled={submitting}
                    className="rounded-full bg-[#0f172a] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Processing..." : "Pay Now"}
                  </button>

                  <button
                    onClick={handlePayAtHotel}
                    disabled={submitting}
                    className="rounded-full border border-black/10 bg-white px-7 py-3.5 text-sm font-semibold text-[#0f172a] transition hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Processing..." : "Pay at Hotel"}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.6, delay: 0.14 }}
              className="rounded-[36px] border border-black/5 bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Reservation Summary
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Booking Overview
              </h2>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-[#faf8f4] p-5">
                  <p className="text-sm text-gray-500">Guest Name</p>
                  <h3 className="mt-2 text-lg font-semibold">{bookingDraft.guestName}</h3>
                </div>

                <div className="rounded-2xl bg-[#faf8f4] p-5">
                  <p className="text-sm text-gray-500">Room Type</p>
                  <h3 className="mt-2 text-lg font-semibold">{bookingDraft.roomType}</h3>
                </div>

                {bookingDraft.offerTitle && (
                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-gray-500">Applied Offer</p>
                    <h3 className="mt-2 text-lg font-semibold">
                      {bookingDraft.offerTitle} ({bookingDraft.discountPercentage}%)
                    </h3>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-gray-500">Check-in</p>
                    <h3 className="mt-2 text-lg font-semibold">{bookingDraft.checkIn}</h3>
                  </div>

                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-gray-500">Check-out</p>
                    <h3 className="mt-2 text-lg font-semibold">{bookingDraft.checkOut}</h3>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-gray-500">Guests</p>
                    <h3 className="mt-2 text-lg font-semibold">{bookingDraft.guests}</h3>
                  </div>

                  <div className="rounded-2xl bg-[#faf8f4] p-5">
                    <p className="text-sm text-gray-500">Nights</p>
                    <h3 className="mt-2 text-lg font-semibold">{bookingDraft.nights}</h3>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#faf8f4] p-5">
                  <p className="text-sm text-gray-500">Rate Per Night</p>
                  <h3 className="mt-2 text-lg font-semibold">
                    ${bookingDraft.pricePerNight}
                  </h3>
                </div>

                <div className="rounded-[28px] bg-[#0f172a] p-6 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
                  <p className="text-sm text-white/70">Total Amount</p>
                  <h3 className="mt-2 text-4xl font-bold">${bookingDraft.totalPrice}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Final payable amount for the selected reservation details.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {showToast && <Toast message="Reservation saved successfully!" />}
    </main>
  );
}