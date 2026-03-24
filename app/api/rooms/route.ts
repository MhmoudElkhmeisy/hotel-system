import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    const rooms = await prisma.roomType.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error("Error fetching rooms:", error);

    return NextResponse.json(
      { message: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, price, capacity } = body as {
      name?: string;
      price?: number;
      capacity?: number;
    };

    if (!name || price === undefined || capacity === undefined) {
      return NextResponse.json(
        { message: "Name, price, and capacity are required" },
        { status: 400 }
      );
    }

    if (Number(price) <= 0 || Number(capacity) <= 0) {
      return NextResponse.json(
        { message: "Price and capacity must be greater than zero" },
        { status: 400 }
      );
    }

    const existingRoom = await prisma.roomType.findUnique({
      where: {
        name,
      },
    });

    if (existingRoom) {
      return NextResponse.json(
        { message: "A room type with this name already exists" },
        { status: 409 }
      );
    }

    const createdRoom = await prisma.roomType.create({
      data: {
        name,
        price: Number(price),
        capacity: Number(capacity),
      },
    });

    return NextResponse.json(createdRoom, { status: 201 });
  } catch (error) {
    console.error("Error creating room type:", error);

    return NextResponse.json(
      { message: "Failed to create room type" },
      { status: 500 }
    );
  }
}