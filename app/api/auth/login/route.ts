import { NextResponse } from "next/server";

let users: any[] = [];

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}