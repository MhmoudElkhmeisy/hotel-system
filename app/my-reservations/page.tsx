"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/layout/navbar";

type Reservation = {
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
};

export default function MyReservationsPage() {
  const [customerReservations, setCustomerReservations] = useState<Reservation[]>([]);
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("currentCustomerEmail") || "";
    const storedReservations: Reservation[] = JSON.parse(
      localStorage.getItem("reservations") || "[]"
    );

    setCustomerEmail(savedEmail);

    const filteredReservations = storedReservations.filter(
      (reservation) => reservation.email === savedEmail
    );

    setCustomerReservations(filteredReservations);
  }, []);

  const activeReservations = useMemo(() => {
    return customerReservations.filter(
      (reservation) => reservation.status !== "Cancelled"
    ).length;
  }, [customerReservations]);

  const totalSpent = useMemo(() => {
    return customerReservations.reduce((sum, reservation) => {
      return reservation.status === "Cancelled"
        ? sum
        : sum + reservation.totalPrice;
    }, 0);
  }, [customerReservations]);

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#0f172a]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
          Customer Portal
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight">
          My Reservations
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          Review your confirmed bookings, payment status, and stay details in one place.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Customer Email</p>
            <h3 className="mt-2 break-all text-xl font-semibold">
              {customerEmail || "No customer email found"}
            </h3>
          </div>

          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Active Reservations</p>
            <h3 className="mt-2 text-3xl font-semibold">{activeReservations}</h3>
          </div>

          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Spent</p>
            <h3 className="mt-2 text-3xl font-semibold">${totalSpent}</h3>
          </div>
        </div>

        <div className="mt-10 rounded-[36px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm text-gray-500">Booking Records</p>
            <h3 className="mt-1 text-2xl font-semibold">Your Reservation History</h3>
          </div>

          {customerReservations.length === 0 ? (
            <div className="rounded-2xl bg-[#faf8f4] p-6 text-gray-600">
              No reservations found for this customer.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-4">Room</th>
                    <th className="px-4">Check-in</th>
                    <th className="px-4">Check-out</th>
                    <th className="px-4">Guests</th>
                    <th className="px-4">Total</th>
                    <th className="px-4">Payment</th>
                    <th className="px-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {customerReservations.map((reservation) => (
                    <tr key={reservation.id} className="bg-[#faf8f4]">
                      <td className="rounded-l-2xl px-4 py-4 font-medium">
                        {reservation.roomType}
                      </td>
                      <td className="px-4 py-4">{reservation.checkIn}</td>
                      <td className="px-4 py-4">{reservation.checkOut}</td>
                      <td className="px-4 py-4">{reservation.guests}</td>
                      <td className="px-4 py-4">${reservation.totalPrice}</td>
                      <td className="px-4 py-4">{reservation.paymentStatus}</td>
                      <td className="rounded-r-2xl px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            reservation.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}