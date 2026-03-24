export type RoomSetting = {
  name: string;
  price: number;
  capacity: number;
};

export type OfferSetting = {
  title: string;
  discount: number;
};

export type RoomBase = RoomSetting & {
  id: number;
  guests: number;
  image: string;
  description: string;
};

export const defaultRoomSettings: RoomSetting[] = [
  { name: "Standard Room", price: 120, capacity: 3 },
  { name: "Deluxe Room", price: 220, capacity: 2 },
  { name: "Executive Suite", price: 320, capacity: 1 },
];

export const defaultRooms: RoomBase[] = [
  {
    id: 1,
    name: "Standard Room",
    guests: 2,
    price: 120,
    capacity: 3,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    description:
      "Designed for short stays with essential amenities, simplified booking, and efficient room allocation logic.",
  },
  {
    id: 2,
    name: "Deluxe Room",
    guests: 3,
    price: 220,
    capacity: 2,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    description:
      "Supports mid-range booking scenarios with extended amenities and higher demand handling in the reservation workflow.",
  },
  {
    id: 3,
    name: "Executive Suite",
    guests: 4,
    price: 320,
    capacity: 1,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    description:
      "Premium category integrated with advanced reservation parameters, pricing logic, and executive booking presentation.",
  },
];

export function getMergedRooms(roomSettings?: RoomSetting[]): RoomBase[] {
  const settings = roomSettings && roomSettings.length > 0
    ? roomSettings
    : defaultRoomSettings;

  return settings.map((room, index) => {
    const existingRoom = defaultRooms.find((r) => r.name === room.name);

    return {
      id: existingRoom?.id || index + 1,
      name: room.name,
      price: room.price,
      capacity: room.capacity,
      guests: existingRoom?.guests || Math.max(1, room.capacity),
      image:
        existingRoom?.image ||
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
      description:
        existingRoom?.description ||
        "A newly added room category managed dynamically through the admin settings panel.",
    };
  });
}