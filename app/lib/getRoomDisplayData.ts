export type RoomApiItem = {
  id: number;
  name: string;
  price: number;
  capacity: number;
  createdAt?: string;
};

export type RoomDisplayItem = {
  id: number;
  name: string;
  price: number;
  capacity: number;
  guests: number;
  image: string;
  description: string;
};

const roomPresentationMap: Record<
  string,
  {
    guests: number;
    image: string;
    description: string;
  }
> = {
  "Standard Room": {
    guests: 2,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    description:
      "A refined room category designed for short stays with essential comfort, elegant furnishing, and efficient booking flow.",
  },
  "Deluxe Room": {
    guests: 3,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    description:
      "A spacious premium room with enhanced interior styling, elevated comfort, and a polished hospitality experience.",
  },
  "Executive Suite": {
    guests: 4,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    description:
      "A luxury suite for high-end stays, combining executive-level comfort, spacious layout, and premium presentation.",
  },
};

export function getRoomDisplayData(rooms: RoomApiItem[]): RoomDisplayItem[] {
  return rooms.map((room) => {
    const presentation = roomPresentationMap[room.name];

    return {
      id: room.id,
      name: room.name,
      price: room.price,
      capacity: room.capacity,
      guests: presentation?.guests || Math.max(1, room.capacity),
      image:
        presentation?.image ||
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80",
      description:
        presentation?.description ||
        "A newly added room category managed dynamically through the admin panel.",
    };
  });
}