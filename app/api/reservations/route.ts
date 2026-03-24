import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

function normalizeDate(date: Date) {
  return new Date(date.toISOString().split("T")[0]);
}

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        roomType: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedReservations = reservations.map((reservation) => ({
      id: reservation.id,
      guestName: reservation.guestName,
      email: reservation.email,
      checkIn: reservation.checkIn.toISOString().split("T")[0],
      checkOut: reservation.checkOut.toISOString().split("T")[0],
      roomType: reservation.roomType.name,
      guests: reservation.guests,
      nights: reservation.nights,
      pricePerNight: reservation.pricePerNight,
      totalPrice: reservation.totalPrice,
      paymentMethod: reservation.paymentMethod,
      paymentStatus: reservation.paymentStatus,
      status: reservation.status,
      createdAt: reservation.createdAt.toISOString(),
      roomTypeId: reservation.roomTypeId,
    }));

    return NextResponse.json(formattedReservations, { status: 200 });
  } catch (error) {
    console.error("Error fetching reservations:", error);

    return NextResponse.json(
      { message: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      guestName,
      email,
      checkIn,
      checkOut,
      roomType,
      guests,
      nights,
      pricePerNight,
      totalPrice,
      paymentMethod,
      paymentStatus,
      status,
    } = body;

    if (
      !guestName ||
      !email ||
      !checkIn ||
      !checkOut ||
      !roomType ||
      !guests ||
      !nights ||
      pricePerNight === undefined ||
      totalPrice === undefined ||
      !paymentMethod ||
      !paymentStatus ||
      !status
    ) {
      return NextResponse.json(
        { message: "Missing required reservation fields" },
        { status: 400 }
      );
    }

    const parsedCheckIn = normalizeDate(new Date(checkIn));
    const parsedCheckOut = normalizeDate(new Date(checkOut));

    if (Number.isNaN(parsedCheckIn.getTime()) || Number.isNaN(parsedCheckOut.getTime())) {
      return NextResponse.json(
        { message: "Invalid check-in or check-out date" },
        { status: 400 }
      );
    }

    if (parsedCheckOut <= parsedCheckIn) {
      return NextResponse.json(
        { message: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    const createdReservation = await prisma.$transaction(async (tx) => {
      const existingRoomType = await tx.roomType.findUnique({
        where: {
          name: roomType,
        },
      });

      if (!existingRoomType) {
        throw new Error("ROOM_TYPE_NOT_FOUND");
      }

      const overlappingReservationsCount = await tx.reservation.count({
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

      if (remainingCapacity <= 0) {
        throw new Error("NO_AVAILABILITY");
      }

      const reservation = await tx.reservation.create({
        data: {
          guestName,
          email,
          checkIn: parsedCheckIn,
          checkOut: parsedCheckOut,
          guests: Number(guests),
          nights: Number(nights),
          pricePerNight: Number(pricePerNight),
          totalPrice: Number(totalPrice),
          paymentMethod,
          paymentStatus,
          status,
          roomTypeId: existingRoomType.id,
        },
        include: {
          roomType: true,
        },
      });

      return {
        id: reservation.id,
        guestName: reservation.guestName,
        email: reservation.email,
        checkIn: reservation.checkIn.toISOString().split("T")[0],
        checkOut: reservation.checkOut.toISOString().split("T")[0],
        roomType: reservation.roomType.name,
        guests: reservation.guests,
        nights: reservation.nights,
        pricePerNight: reservation.pricePerNight,
        totalPrice: reservation.totalPrice,
        paymentMethod: reservation.paymentMethod,
        paymentStatus: reservation.paymentStatus,
        status: reservation.status,
        createdAt: reservation.createdAt.toISOString(),
        roomTypeId: reservation.roomTypeId,
      };
    });

    return NextResponse.json(createdReservation, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);

    if (error instanceof Error) {
      if (error.message === "ROOM_TYPE_NOT_FOUND") {
        return NextResponse.json(
          { message: "Selected room type does not exist" },
          { status: 404 }
        );
      }

      if (error.message === "NO_AVAILABILITY") {
        return NextResponse.json(
          { message: "This room is no longer available for the selected dates" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: "Failed to create reservation" },
      { status: 500 }
    );
  }
}