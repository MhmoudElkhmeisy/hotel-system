import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(offers, { status: 200 });
  } catch (error) {
    console.error("Error fetching offers:", error);

    return NextResponse.json(
      { message: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    if (Number(discount) <= 0 || Number(discount) > 100) {
      return NextResponse.json(
        { message: "Discount must be between 1 and 100" },
        { status: 400 }
      );
    }

    const createdOffer = await prisma.offer.create({
      data: {
        title,
        discount: Number(discount),
      },
    });

    return NextResponse.json(createdOffer, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);

    return NextResponse.json(
      { message: "Failed to create offer" },
      { status: 500 }
    );
  }
}