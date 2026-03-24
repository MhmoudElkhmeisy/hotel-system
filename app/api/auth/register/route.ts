import { NextResponse } from "next/server";

let users: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let { name, email, password, adminCode } = body;

    name = name?.trim();
    email = email?.trim();
    password = password?.trim();
    adminCode = adminCode?.trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const ADMIN_CODE = process.env.ADMIN_ACCESS_CODE;

    let role = "Customer";

    if (adminCode && adminCode === ADMIN_CODE) {
      role = "Admin";
    }

    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const newUser = {
      id: Date.now(), 
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString(), 
    };

    users.push(newUser);

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}