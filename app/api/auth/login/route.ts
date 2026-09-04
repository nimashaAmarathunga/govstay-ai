import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  hashPassword,
  needsRehash,
  signUserToken,
  USER_COOKIE_NAME,
} from "@/lib/auth";

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

    const trimmedId = identifier.trim();

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

    // Securely verify password with Argon2 (or legacy format)
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email/username or password." },
        { status: 401 }
      );
    }

    // Lazy Migration: If password was stored as plain text or legacy format, upgrade to Argon2id
    if (needsRehash(user.password)) {
      try {
        const newHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash },
        });
      } catch (migrationErr) {
        // Non-blocking: log generic warning without exposing sensitive info
        console.warn("User password hash upgrade deferred:", user.id);
      }
    }

    // Generate signed User JWT (7 days)
    const token = await signUserToken({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      emailAddress: user.emailAddress,
      empId: user.empId,
    });

    // Return sanitized user details (excluding password hash)
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });

    // Set HTTP-only session cookie for User
    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
