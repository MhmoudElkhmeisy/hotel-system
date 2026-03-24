"use client";

import { useEffect, useState } from "react";

export type Room = {
  id: number;
  name: string;
  price: number;
  capacity: number;
};

export type Offer = {
  id: number;
  title: string;
  discount: number;
};

export function useHotelData() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [roomsRes, offersRes] = await Promise.all([
          fetch("/api/rooms", { cache: "no-store" }),
          fetch("/api/offers", { cache: "no-store" }),
        ]);

        if (!roomsRes.ok || !offersRes.ok) {
          throw new Error("Failed to fetch hotel data");
        }

        const roomsData = await roomsRes.json();
        const offersData = await offersRes.json();

        setRooms(roomsData);
        setOffers(offersData);
      } catch (error) {
        console.error("Error loading hotel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return {
    rooms,
    offers,
    loading,
  };
}