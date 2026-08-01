import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET bookings with bungalow, room, and user details (optional ?department=... filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    const where = department && department !== "ALL"
      ? { circuitBungalow: { department } }
      : {};

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        circuitBungalow: {
          select: { name: true, location: true, image: true, department: true },
        },
        room: {
          select: { roomNumber: true, roomType: true, price: true },
        },
        user: {
          select: { name: true, empId: true, placeOfWork: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
