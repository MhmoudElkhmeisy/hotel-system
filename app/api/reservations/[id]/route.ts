import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const reservationId = Number(id);

    if (Number.isNaN(reservationId)) {
      return NextResponse.json(
        { message: "Invalid reservation id" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
      include: {
        roomType: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    const formattedReservation = {
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

    return NextResponse.json(formattedReservation, { status: 200 });
  } catch (error) {
    console.error("Error fetching reservation by id:", error);

    return NextResponse.json(
      { message: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const reservationId = Number(id);

    if (Number.isNaN(reservationId)) {
      return NextResponse.json(
        { message: "Invalid reservation id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, paymentStatus } = body as {
      status?: string;
      paymentStatus?: string;
    };

    const existingReservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
      include: {
        roomType: true,
      },
    });

    if (!existingReservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      },
      include: {
        roomType: true,
      },
    });

    const formattedReservation = {
      id: updatedReservation.id,
      guestName: updatedReservation.guestName,
      email: updatedReservation.email,
      checkIn: updatedReservation.checkIn.toISOString().split("T")[0],
      checkOut: updatedReservation.checkOut.toISOString().split("T")[0],
      roomType: updatedReservation.roomType.name,
      guests: updatedReservation.guests,
      nights: updatedReservation.nights,
      pricePerNight: updatedReservation.pricePerNight,
      totalPrice: updatedReservation.totalPrice,
      paymentMethod: updatedReservation.paymentMethod,
      paymentStatus: updatedReservation.paymentStatus,
      status: updatedReservation.status,
      createdAt: updatedReservation.createdAt.toISOString(),
      roomTypeId: updatedReservation.roomTypeId,
    };

    return NextResponse.json(formattedReservation, { status: 200 });
  } catch (error) {
    console.error("Error updating reservation:", error);

    return NextResponse.json(
      { message: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const reservationId = Number(id);

    if (Number.isNaN(reservationId)) {
      return NextResponse.json(
        { message: "Invalid reservation id" },
        { status: 400 }
      );
    }

    const existingReservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
    });

    if (!existingReservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    await prisma.reservation.delete({
      where: {
        id: reservationId,
      },
    });

    return NextResponse.json(
      { message: "Reservation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting reservation:", error);

    return NextResponse.json(
      { message: "Failed to delete reservation" },
      { status: 500 }
    );
  }
}