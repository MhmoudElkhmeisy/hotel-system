import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const offerId = Number(id);
    const body = await request.json();

    const { title, discount } = body as {
      title?: string;
      discount?: number;
    };

    if (Number.isNaN(offerId)) {
      return NextResponse.json(
        { message: "Invalid offer ID" },
        { status: 400 }
      );
    }

    if (!title || discount === undefined) {
      return NextResponse.json(
        { message: "Title and discount are required" },
        { status: 400 }
      );
    }

    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        title,
        discount: Number(discount),
      },
    });

    return NextResponse.json(updatedOffer, { status: 200 });
  } catch (error) {
    console.error("Error updating offer:", error);

    return NextResponse.json(
      { message: "Failed to update offer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const offerId = Number(id);

    if (Number.isNaN(offerId)) {
      return NextResponse.json(
        { message: "Invalid offer ID" },
        { status: 400 }
      );
    }

    await prisma.offer.delete({
      where: { id: offerId },
    });

    return NextResponse.json(
      { message: "Offer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting offer:", error);

    return NextResponse.json(
      { message: "Failed to delete offer" },
      { status: 500 }
    );
  }
}