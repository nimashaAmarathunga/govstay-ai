import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  hashPassword,
  needsRehash,
  signAdminToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username or Employee ID and password are required." },
        { status: 400 }
      );
    }

    const trimmedIdentifier = username.trim();

    // Find user by username or empId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmedIdentifier },
          { empId: trimmedIdentifier },
          { emailAddress: trimmedIdentifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Check administrative role permission
    if (user.role !== "DEPT_ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrative privileges are required." },
        { status: 403 }
      );
    }

    // Securely verify password with Argon2 (or legacy format)
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Lazy Migration: If admin password was stored in plain text or legacy format, upgrade to Argon2id
    if (needsRehash(user.password)) {
      try {
        const newHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash },
        });
      } catch (migrationErr) {
        console.warn("Admin password hash upgrade deferred:", user.id);
      }
    }

    // Generate signed Admin JWT token (24 hours)
    const token = await signAdminToken({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      placeOfWork: user.placeOfWork,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        placeOfWork: user.placeOfWork,
        position: user.position,
        emailAddress: user.emailAddress,
      },
    });

    // Set HTTP-only session cookie for Admin
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
