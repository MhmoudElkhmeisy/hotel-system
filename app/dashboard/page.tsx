"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/navbar";
import Toast from "../components/ui/toast";
import { useToast } from "../hooks/useToast";
import { useAdminGuard } from "../hooks/useAdminGuard";

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
  roomTypeId: number;
};

type DashboardRoomSetting = {
  id: number;
  name: string;
  price: number;
  capacity: number;
};

type DashboardOffer = {
  id: number;
  title: string;
  discount: number;
  createdAt?: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const { toast, showToast } = useToast();
  const { authorized, authLoading } = useAdminGuard();
  useEffect(() => {
  if (!authLoading && !authorized) {
    showToast("Access denied. Admins only.", "error");
  }
}, [authorized, authLoading]);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [processingReservationId, setProcessingReservationId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [activeView, setActiveView] = useState<"reservations" | "analytics" | "settings">(
    "reservations"
  );

  const [roomSettings, setRoomSettings] = useState<DashboardRoomSetting[]>([]);
  const [draftRoomSettings, setDraftRoomSettings] = useState<DashboardRoomSetting[]>([]);
  const [loadingRoomSettings, setLoadingRoomSettings] = useState(true);
  const [processingRoomId, setProcessingRoomId] = useState<number | null>(null);

  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [processingOfferId, setProcessingOfferId] = useState<number | null>(null);

  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomPrice, setNewRoomPrice] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState("");

  const [offerTitle, setOfferTitle] = useState("");
  const [offerDiscount, setOfferDiscount] = useState("");

  const fetchReservations = async () => {
    try {
      setLoadingReservations(true);

      const response = await fetch("/api/reservations", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reservations");
      }

      const data: Reservation[] = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error loading reservations:", error);
      showToast("Failed to load reservations.", "error");
    } finally {
      setLoadingReservations(false);
    }
  };

  const fetchRoomSettings = async () => {
    try {
      setLoadingRoomSettings(true);

      const response = await fetch("/api/rooms", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch room settings");
      }

      const data: DashboardRoomSetting[] = await response.json();
      setRoomSettings(data);
      setDraftRoomSettings(data);
    } catch (error) {
      console.error("Error loading room settings:", error);
      showToast("Failed to load room settings.", "error");
    } finally {
      setLoadingRoomSettings(false);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);

      const response = await fetch("/api/offers", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch offers");
      }

      const data: DashboardOffer[] = await response.json();
      setOffers(data);
    } catch (error) {
      console.error("Error loading offers:", error);
      showToast("Failed to load offers.", "error");
    } finally {
      setLoadingOffers(false);
    }
  };
  

  useEffect(() => {
    if (!authorized) return;

    fetchReservations();
    fetchRoomSettings();
    fetchOffers();
  }, [authorized]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const matchesSearch = reservation.guestName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || reservation.status === statusFilter;

      const matchesPayment =
        paymentFilter === "All" ||
        reservation.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [reservations, searchTerm, statusFilter, paymentFilter]);

  const totalRevenue = useMemo(() => {
    return reservations.reduce((sum, reservation) => {
      return reservation.status === "Cancelled"
        ? sum
        : sum + reservation.totalPrice;
    }, 0);
  }, [reservations]);

  const activeBookings = reservations.filter(
    (reservation) => reservation.status !== "Cancelled"
  ).length;

  const paidReservations = reservations.filter(
    (reservation) =>
      reservation.paymentStatus === "Paid" && reservation.status !== "Cancelled"
  ).length;

  const payAtHotelReservations = reservations.filter(
    (reservation) =>
      reservation.paymentStatus === "Pay at Hotel" &&
      reservation.status !== "Cancelled"
  ).length;

  const cancelledReservations = reservations.filter(
    (reservation) => reservation.status === "Cancelled"
  ).length;

  const standardRooms = reservations.filter(
    (reservation) =>
      reservation.roomType === "Standard Room" &&
      reservation.status !== "Cancelled"
  ).length;

  const deluxeRooms = reservations.filter(
    (reservation) =>
      reservation.roomType === "Deluxe Room" &&
      reservation.status !== "Cancelled"
  ).length;

  const executiveSuites = reservations.filter(
    (reservation) =>
      reservation.roomType === "Executive Suite" &&
      reservation.status !== "Cancelled"
  ).length;

  const totalRoomCapacity = useMemo(() => {
    return roomSettings.reduce((sum, room) => sum + room.capacity, 0);
  }, [roomSettings]);

  const occupancyRate = useMemo(() => {
    if (totalRoomCapacity === 0) return 0;
    return Math.round((activeBookings / totalRoomCapacity) * 100);
  }, [activeBookings, totalRoomCapacity]);

  const cancellationRate = useMemo(() => {
    if (reservations.length === 0) return 0;
    return Math.round((cancelledReservations / reservations.length) * 100);
  }, [cancelledReservations, reservations.length]);

  const paymentCompletionRate = useMemo(() => {
    const nonCancelled = reservations.filter(
      (reservation) => reservation.status !== "Cancelled"
    );

    if (nonCancelled.length === 0) return 0;

    const paidCount = nonCancelled.filter(
      (reservation) => reservation.paymentStatus === "Paid"
    ).length;

    return Math.round((paidCount / nonCancelled.length) * 100);
  }, [reservations]);

  const occupancyIndicator = useMemo(() => {
    if (occupancyRate >= 80) return "Very High";
    if (occupancyRate >= 60) return "High";
    if (occupancyRate >= 35) return "Moderate";
    return "Low";
  }, [occupancyRate]);

  const weeklyBookingData = useMemo(() => {
    const counts: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    reservations.forEach((reservation) => {
      if (reservation.status === "Cancelled") return;

      const date = new Date(reservation.checkIn);
      if (Number.isNaN(date.getTime())) return;

      const dayLabel = weekdayLabels[date.getDay()];
      if (counts[dayLabel] !== undefined) {
        counts[dayLabel] += 1;
      }
    });

    const maxValue = Math.max(...weekdayOrder.map((day) => counts[day]), 1);

    return weekdayOrder.map((day) => ({
      day,
      count: counts[day],
      height: `${Math.max((counts[day] / maxValue) * 100, counts[day] > 0 ? 12 : 6)}%`,
    }));
  }, [reservations]);

  const roomUtilizationData = useMemo(() => {
    return roomSettings.map((room) => {
      const activeCount = reservations.filter(
        (reservation) =>
          reservation.roomType === room.name && reservation.status !== "Cancelled"
      ).length;

      const utilization =
        room.capacity > 0 ? Math.min(Math.round((activeCount / room.capacity) * 100), 100) : 0;

      return {
        name: room.name,
        activeCount,
        capacity: room.capacity,
        utilization,
      };
    });
  }, [reservations, roomSettings]);

  const handleDraftRoomFieldChange = (
    index: number,
    field: "price" | "capacity",
    value: string
  ) => {
    const updated = [...draftRoomSettings];
    updated[index] = {
      ...updated[index],
      [field]: Number(value),
    };
    setDraftRoomSettings(updated);
  };

  const handleConfirmRoomChanges = async (index: number) => {
    try {
      const room = draftRoomSettings[index];
      setProcessingRoomId(room.id);

      const response = await fetch(`/api/rooms/${room.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: room.name,
          price: room.price,
          capacity: room.capacity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to update room type.", "error");
        return;
      }

      await fetchRoomSettings();
      showToast("Room type updated successfully.", "success");
    } catch (error) {
      console.error("Error updating room type:", error);
      showToast("Failed to update room type.", "error");
    } finally {
      setProcessingRoomId(null);
    }
  };

  const handleAddRoomType = async () => {
    if (!newRoomName || !newRoomPrice || !newRoomCapacity) {
      showToast("Please complete the new room type fields.", "error");
      return;
    }

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRoomName,
          price: Number(newRoomPrice),
          capacity: Number(newRoomCapacity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to add room type.", "error");
        return;
      }

      setNewRoomName("");
      setNewRoomPrice("");
      setNewRoomCapacity("");

      await fetchRoomSettings();
      showToast("New room type added successfully.", "success");
    } catch (error) {
      console.error("Error adding room type:", error);
      showToast("Failed to add room type.", "error");
    }
  };

  const handleDeleteRoomType = async (id: number) => {
    try {
      setProcessingRoomId(id);

      const response = await fetch(`/api/rooms/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to delete room type.", "error");
        return;
      }

      await fetchRoomSettings();
      showToast("Room type deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting room type:", error);
      showToast("Failed to delete room type.", "error");
    } finally {
      setProcessingRoomId(null);
    }
  };

  const handleOfferFieldChange = (
    id: number,
    field: "title" | "discount",
    value: string
  ) => {
    const updatedOffers = offers.map((offer) =>
      offer.id === id
        ? {
            ...offer,
            [field]: field === "discount" ? Number(value) : value,
          }
        : offer
    );

    setOffers(updatedOffers);
  };

  const handleSaveOffer = async (offer: DashboardOffer) => {
    try {
      setProcessingOfferId(offer.id);

      const response = await fetch(`/api/offers/${offer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: offer.title,
          discount: offer.discount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to update offer.", "error");
        return;
      }

      await fetchOffers();
      showToast("Offer updated successfully.", "success");
    } catch (error) {
      console.error("Error updating offer:", error);
      showToast("Failed to update offer.", "error");
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleAddOffer = async () => {
    if (!offerTitle || !offerDiscount) {
      showToast("Please complete the offer fields.", "error");
      return;
    }

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: offerTitle,
          discount: Number(offerDiscount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to add offer.", "error");
        return;
      }

      setOfferTitle("");
      setOfferDiscount("");

      await fetchOffers();
      showToast("Offer added successfully.", "success");
    } catch (error) {
      console.error("Error adding offer:", error);
      showToast("Failed to add offer.", "error");
    }
  };

  const handleDeleteOffer = async (id: number) => {
    try {
      setProcessingOfferId(id);

      const response = await fetch(`/api/offers/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to delete offer.", "error");
        return;
      }

      await fetchOffers();
      showToast("Offer deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting offer:", error);
      showToast("Failed to delete offer.", "error");
    } finally {
      setProcessingOfferId(null);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    try {
      setProcessingReservationId(reservationId);

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Cancelled",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel reservation");
      }

      await fetchReservations();
      showToast("Reservation cancelled successfully.", "success");
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      showToast("Failed to cancel reservation.", "error");
    } finally {
      setProcessingReservationId(null);
    }
  };

  const handleDeleteReservation = async (reservationId: number) => {
    try {
      setProcessingReservationId(reservationId);

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reservation");
      }

      await fetchReservations();
      showToast("Reservation deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting reservation:", error);
      showToast("Failed to delete reservation.", "error");
    } finally {
      setProcessingReservationId(null);
    }
  };

  if (authLoading || !authorized) return null;

  return (
    <main className="min-h-screen bg-[#f5f3ef] text-[#0f172a]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-16">
          {/* Admin Welcome */}
           <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-6"
>
          <p className="text-sm text-gray-500">
          👋 Welcome back,{" "}
             <span className="font-semibold text-[#0f172a]">
                 {typeof window !== "undefined"
                   ? JSON.parse(localStorage.getItem("currentUser") || "{}")?.name
               : "Admin"}
             </span>
         </p>
        </motion.div>
       
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            Admin Panel
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
            Reservation Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            Manage reservations, monitor payment activity, and control room settings
            through a structured administrative interface.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.08 }}
          className="mb-10 flex flex-wrap gap-4"
        >
          <button
            onClick={() => setActiveView("reservations")}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
              activeView === "reservations"
                ? "bg-[#0f172a] text-white shadow-[0_10px_25px_rgba(15,23,42,0.16)]"
                : "border border-black/10 bg-white text-[#0f172a]"
            }`}
          >
            Reservations
          </button>

          <button
            onClick={() => setActiveView("analytics")}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
              activeView === "analytics"
                ? "bg-[#0f172a] text-white shadow-[0_10px_25px_rgba(15,23,42,0.16)]"
                : "border border-black/10 bg-white text-[#0f172a]"
            }`}
          >
            Analytics
          </button>

          <button
            onClick={() => setActiveView("settings")}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
              activeView === "settings"
                ? "bg-[#0f172a] text-white shadow-[0_10px_25px_rgba(15,23,42,0.16)]"
                : "border border-black/10 bg-white text-[#0f172a]"
            }`}
          >
            Settings
          </button>
        </motion.div>

        {activeView === "reservations" && (
          <>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.12 }}
              className="mt-2 grid gap-6 md:grid-cols-5"
            >
              <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Active Bookings</p>
                <h3 className="mt-2 text-3xl font-semibold">{activeBookings}</h3>
              </div>
              <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Paid Reservations</p>
                <h3 className="mt-2 text-3xl font-semibold">{paidReservations}</h3>
              </div>
              <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Pay at Hotel</p>
                <h3 className="mt-2 text-3xl font-semibold">{payAtHotelReservations}</h3>
              </div>
              <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Cancelled</p>
                <h3 className="mt-2 text-3xl font-semibold">{cancelledReservations}</h3>
              </div>
              <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Estimated Revenue</p>
                <h3 className="mt-2 text-3xl font-semibold">${totalRevenue}</h3>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.18 }}
              className="mt-10 rounded-[36px] border border-black/5 bg-white p-6 shadow-sm"
            >
              <div className="mb-6">
                <p className="text-sm text-gray-500">Reservation Controls</p>
                <h3 className="mt-1 text-2xl font-semibold">Search & Filter</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Search by guest name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3 outline-none transition focus:border-[#0f172a]"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3 outline-none transition focus:border-[#0f172a]"
                >
                  <option>All</option>
                  <option>Confirmed</option>
                  <option>Cancelled</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#faf8f4] px-4 py-3 outline-none transition focus:border-[#0f172a]"
                >
                  <option>All</option>
                  <option>Paid</option>
                  <option>Pay at Hotel</option>
                </select>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.24 }}
              className="mt-10 rounded-[36px] border border-black/5 bg-white p-6 shadow-sm"
            >
              <div className="mb-6">
                <p className="text-sm text-gray-500">Reservation Records</p>
                <h3 className="mt-1 text-2xl font-semibold">Recent Bookings</h3>
              </div>

              {loadingReservations ? (
                <div className="rounded-2xl bg-[#faf8f4] p-6 text-gray-600">
                  Loading reservations...
                </div>
              ) : filteredReservations.length === 0 ? (
                <div className="rounded-2xl bg-[#faf8f4] p-6 text-gray-600">
                  No matching reservations found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="px-4">Guest</th>
                        <th className="px-4">Room</th>
                        <th className="px-4">Check-in</th>
                        <th className="px-4">Check-out</th>
                        <th className="px-4">Total</th>
                        <th className="px-4">Payment</th>
                        <th className="px-4">Status</th>
                        <th className="px-4">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredReservations.map((reservation) => (
                        <tr key={reservation.id} className="bg-[#faf8f4]">
                          <td className="rounded-l-2xl px-4 py-4 font-medium">
                            {reservation.guestName}
                          </td>
                          <td className="px-4 py-4">{reservation.roomType}</td>
                          <td className="px-4 py-4">{reservation.checkIn}</td>
                          <td className="px-4 py-4">{reservation.checkOut}</td>
                          <td className="px-4 py-4">${reservation.totalPrice}</td>
                          <td className="px-4 py-4">{reservation.paymentStatus}</td>
                          <td className="px-4 py-4">
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

                          <td className="rounded-r-2xl px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {reservation.status !== "Cancelled" && (
                                <button
                                  onClick={() => handleCancelReservation(reservation.id)}
                                  disabled={processingReservationId === reservation.id}
                                  className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {processingReservationId === reservation.id
                                    ? "Processing..."
                                    : "Cancel"}
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteReservation(reservation.id)}
                                disabled={processingReservationId === reservation.id}
                                className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {processingReservationId === reservation.id
                                  ? "Processing..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}

        {activeView === "analytics" && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.12 }}
            className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                Operational Analytics
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#0f172a] md:text-5xl">
                Reservation Monitoring Overview
              </h2>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                This section helps administrators understand booking activity,
                room distribution, payment flow, and overall hotel utilization
                through a clean operational analytics interface.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Standard Rooms</p>
                  <h3 className="mt-2 text-3xl font-semibold text-[#0f172a]">
                    {standardRooms}
                  </h3>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Deluxe Rooms</p>
                  <h3 className="mt-2 text-3xl font-semibold text-[#0f172a]">
                    {deluxeRooms}
                  </h3>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Executive Suites</p>
                  <h3 className="mt-2 text-3xl font-semibold text-[#0f172a]">
                    {executiveSuites}
                  </h3>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Occupancy Indicator</p>
                  <h3 className="mt-2 text-3xl font-semibold text-[#0f172a]">
                    {occupancyIndicator}
                  </h3>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Occupancy Rate</p>
                  <h3 className="mt-2 text-3xl font-semibold text-[#0f172a]">
                    {occupancyRate}%
                  </h3>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Cancellation Rate</p>
                  <h3 className="mt-2 text-3xl font-semibold text-[#0f172a]">
                    {cancellationRate}%
                  </h3>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Payment Completion</p>
                  <h3 className="mt-2 text-3xl font-semibold text-[#0f172a]">
                    {paymentCompletionRate}%
                  </h3>
                </div>

                <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Total Room Capacity</p>
                  <h3 className="mt-2 text-3xl font-semibold text-[#0f172a]">
                    {totalRoomCapacity}
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-[36px] border border-black/5 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Weekly Performance</p>
                    <h3 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                      Booking Activity Overview
                    </h3>
                  </div>

                  <span className="rounded-full bg-[#f5f3ef] px-4 py-2 text-sm font-medium text-gray-700">
                    Live Data
                  </span>
                </div>

                <div className="grid h-[320px] grid-cols-7 items-end gap-4 rounded-[28px] bg-[#faf8f4] p-6">
                  {weeklyBookingData.map((bar, index) => (
                    <div key={bar.day} className="flex h-full flex-col items-center gap-3">
                      <span className="text-xs font-medium text-gray-500">{bar.count}</span>
                      <div
                        className="w-full rounded-t-2xl"
                        style={{
                          height: bar.height,
                          backgroundColor:
                            index === 4
                              ? "#0f172a"
                              : index % 2 === 0
                              ? "#334155"
                              : "#64748b",
                        }}
                      />
                      <span className="text-xs text-gray-500">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[36px] border border-black/5 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Room Utilization</p>
                  <h3 className="mt-1 text-2xl font-semibold text-[#0f172a]">
                    Utilization by Type
                  </h3>
                </div>

                <div className="space-y-5">
                  {roomUtilizationData.length === 0 ? (
                    <div className="rounded-2xl bg-[#faf8f4] p-6 text-gray-600">
                      No room utilization data available yet.
                    </div>
                  ) : (
                    roomUtilizationData.map((room) => (
                      <div key={room.name}>
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-[#0f172a]">{room.name}</p>
                            <p className="text-xs text-gray-500">
                              {room.activeCount} active / {room.capacity} capacity
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-[#0f172a]">
                            {room.utilization}%
                          </span>
                        </div>

                        <div className="h-3 w-full overflow-hidden rounded-full bg-[#edf0f2]">
                          <div
                            className="h-full rounded-full bg-[#0f172a]"
                            style={{ width: `${room.utilization}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeView === "settings" && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.12 }}
            className="space-y-10"
          >
            <div className="rounded-[36px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm text-gray-500">Room Settings</p>
                <h3 className="mt-1 text-2xl font-semibold">Manage Room Types</h3>
              </div>

              {loadingRoomSettings ? (
                <div className="rounded-2xl bg-[#faf8f4] p-6 text-gray-600">
                  Loading room settings...
                </div>
              ) : draftRoomSettings.length === 0 ? (
                <div className="rounded-2xl bg-[#faf8f4] p-6 text-gray-600">
                  No room types available yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {draftRoomSettings.map((room, index) => (
                    <div
                      key={room.id}
                      className="grid gap-4 rounded-2xl bg-[#faf8f4] p-5 md:grid-cols-[1.2fr_1fr_1fr_auto_auto]"
                    >
                      <div>
                        <p className="text-sm text-gray-500">Room Type</p>
                        <h4 className="mt-2 text-lg font-semibold">{room.name}</h4>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <input
                          type="number"
                          value={room.price}
                          onChange={(e) =>
                            handleDraftRoomFieldChange(index, "price", e.target.value)
                          }
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Capacity
                        </label>
                        <input
                          type="number"
                          value={room.capacity}
                          onChange={(e) =>
                            handleDraftRoomFieldChange(index, "capacity", e.target.value)
                          }
                          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => handleConfirmRoomChanges(index)}
                          disabled={processingRoomId === room.id}
                          className="rounded-full bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingRoomId === room.id ? "Saving..." : "Confirm Changes"}
                        </button>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => handleDeleteRoomType(room.id)}
                          disabled={processingRoomId === room.id}
                          className="rounded-full bg-red-100 px-4 py-3 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingRoomId === room.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 rounded-[28px] bg-[#faf8f4] p-6">
                <p className="text-sm text-gray-500">Add New Room Type</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Capacity"
                    value={newRoomCapacity}
                    onChange={(e) => setNewRoomCapacity(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                  />
                </div>

                <button
                  onClick={handleAddRoomType}
                  className="mt-5 rounded-full bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white"
                >
                  Add Room Type
                </button>
              </div>
            </div>

            <div className="rounded-[36px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm text-gray-500">Offers & Promotions</p>
                <h3 className="mt-1 text-2xl font-semibold">Manage Offers</h3>
              </div>

              {loadingOffers ? (
                <div className="rounded-2xl bg-[#faf8f4] p-6 text-gray-600">
                  Loading offers...
                </div>
              ) : offers.length === 0 ? (
                <div className="rounded-2xl bg-[#faf8f4] p-6 text-gray-600">
                  No offers added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#faf8f4] p-5"
                    >
                      <div className="min-w-[220px] flex-1">
                        <p className="text-sm text-gray-500">Offer Title</p>
                        <input
                          type="text"
                          value={offer.title}
                          onChange={(e) =>
                            handleOfferFieldChange(offer.id, "title", e.target.value)
                          }
                          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                        />
                      </div>

                      <div className="min-w-[180px]">
                        <p className="text-sm text-gray-500">Discount</p>
                        <input
                          type="number"
                          value={offer.discount}
                          onChange={(e) =>
                            handleOfferFieldChange(offer.id, "discount", e.target.value)
                          }
                          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleSaveOffer(offer)}
                          disabled={processingOfferId === offer.id}
                          className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingOfferId === offer.id ? "Saving..." : "Save"}
                        </button>

                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          disabled={processingOfferId === offer.id}
                          className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {processingOfferId === offer.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 rounded-[28px] bg-[#faf8f4] p-6">
                <p className="text-sm text-gray-500">Add New Offer</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Offer title"
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                  />

                  <input
                    type="number"
                    placeholder="Discount percentage"
                    value={offerDiscount}
                    onChange={(e) => setOfferDiscount(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                  />
                </div>

                <button
                  onClick={handleAddOffer}
                  className="mt-5 rounded-full bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white"
                >
                  Add Offer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {toast.visible && <Toast message={toast.message} type={toast.type} />}
    </main>
  );
}