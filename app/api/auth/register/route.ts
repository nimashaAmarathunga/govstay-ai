import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signUserToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, empId, emailAddress, mobileNumber, username, password, placeOfWork } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Name, username, and password are required." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(emailAddress ? [{ emailAddress }] : []),
          ...(empId ? [{ empId }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username, email, or Employee ID already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        empId: empId || null,
        emailAddress: emailAddress || null,
        mobileNumber: mobileNumber || null,
        username,
        password: hashedPassword,
        placeOfWork: placeOfWork || null,
        role: "GOV_EMPLOYEE",
        status: "WORKING",
      },
    });

    // Sign JWT
    const token = await signUserToken({
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      empId: newUser.empId,
    });

    // Set cookie
    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          role: newUser.role,
          empId: newUser.empId,
          emailAddress: newUser.emailAddress,
        },
      },
      { status: 201 }
    );

    response.cookies.set("govstay_user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
