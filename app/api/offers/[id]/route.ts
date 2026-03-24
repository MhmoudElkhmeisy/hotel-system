import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = Number(params.id);
    const body = await request.json();

    const { title, discount } = body as {
      title?: string;
      discount?: number;
    };

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = Number(params.id);

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