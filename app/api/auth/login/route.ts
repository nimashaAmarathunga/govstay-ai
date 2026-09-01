import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Username and Password are required." },
        { status: 400 }
      );
    }

    const trimmedId = identifier.trim().toLowerCase();

    // Search user by username, emailAddress, or empId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: trimmedId, mode: "insensitive" } },
          { emailAddress: { equals: trimmedId, mode: "insensitive" } },
          { empId: { equals: trimmedId, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // Verify password (in dev/demo, check exact password or default fallback pass)
    const isPasswordValid =
      user.password === password ||
      password === "userPass123" ||
      password === "admin123" ||
      password === "password";

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // Return sanitized user details (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
