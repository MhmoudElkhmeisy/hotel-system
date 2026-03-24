import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

function normalizeDate(date: Date) {
  return new Date(date.toISOString().split("T")[0]);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const roomType = searchParams.get("roomType");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!roomType || !checkIn || !checkOut) {
      return NextResponse.json(
        { message: "roomType, checkIn, and checkOut are required" },
        { status: 400 }
      );
    }

    const existingRoomType = await prisma.roomType.findUnique({
      where: {
        name: roomType,
      },
    });

    if (!existingRoomType) {
      return NextResponse.json(
        { message: "Room type not found" },
        { status: 404 }
      );
    }

    const parsedCheckIn = normalizeDate(new Date(checkIn));
    const parsedCheckOut = normalizeDate(new Date(checkOut));

    if (Number.isNaN(parsedCheckIn.getTime()) || Number.isNaN(parsedCheckOut.getTime())) {
      return NextResponse.json(
        { message: "Invalid date values" },
        { status: 400 }
      );
    }

    if (parsedCheckOut <= parsedCheckIn) {
      return NextResponse.json(
        { message: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    const overlappingReservationsCount = await prisma.reservation.count({
      where: {
        roomTypeId: existingRoomType.id,
        status: {
          not: "Cancelled",
        },
        AND: [
          {
            checkIn: {
              lt: parsedCheckOut,
            },
          },
          {
            checkOut: {
              gt: parsedCheckIn,
            },
          },
        ],
      },
    });

    const remainingCapacity = existingRoomType.capacity - overlappingReservationsCount;
    const available = remainingCapacity > 0;

    return NextResponse.json(
      {
        roomType: existingRoomType.name,
        capacity: existingRoomType.capacity,
        booked: overlappingReservationsCount,
        remainingCapacity: remainingCapacity > 0 ? remainingCapacity : 0,
        available,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking availability:", error);

    return NextResponse.json(
      { message: "Failed to check availability" },
      { status: 500 }
    );
  }
}