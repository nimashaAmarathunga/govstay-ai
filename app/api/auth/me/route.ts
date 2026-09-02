import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userPayload = await getAuthenticatedUser(request);

    if (!userPayload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        empId: true,
        status: true,
        placeOfWork: true,
        position: true,
        empIdPhoto: true,
        nicNumber: true,
        mobileNumber: true,
        emailAddress: true,
        residentialAddress: true,
        preferredDistrict: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to authenticate session" },
      { status: 500 }
    );
  }
}
