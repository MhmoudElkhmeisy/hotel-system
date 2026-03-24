import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid room ID" },
        { status: 400 }
      );
    }

    const room = await prisma.roomType.findUnique({
      where: {
        id,
      },
    });

    if (!room) {
      return NextResponse.json(
        { message: "Invalid room ID" },
        { status: 404 }
      );
    }

    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.error("Error fetching room by ID:", error);

    return NextResponse.json(
      { message: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid room ID" },
        { status: 400 }
      );
    }

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
        id,
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { message: "Invalid room ID" },
        { status: 404 }
      );
    }

    const duplicateRoom = await prisma.roomType.findFirst({
      where: {
        name,
        NOT: {
          id,
        },
      },
    });

    if (duplicateRoom) {
      return NextResponse.json(
        { message: "A room type with this name already exists" },
        { status: 409 }
      );
    }

    const updatedRoom = await prisma.roomType.update({
      where: {
        id,
      },
      data: {
        name,
        price: Number(price),
        capacity: Number(capacity),
      },
    });

    return NextResponse.json(updatedRoom, { status: 200 });
  } catch (error) {
    console.error("Error updating room type:", error);

    return NextResponse.json(
      { message: "Failed to update room type" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid room ID" },
        { status: 400 }
      );
    }

    const existingRoom = await prisma.roomType.findUnique({
      where: {
        id,
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { message: "Invalid room ID" },
        { status: 404 }
      );
    }

    await prisma.roomType.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Room type deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting room type:", error);

    return NextResponse.json(
      { message: "Failed to delete room type" },
      { status: 500 }
    );
  }
}