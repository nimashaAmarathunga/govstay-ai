import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all bookings with bungalow, room, and user details
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        circuitBungalow: {
          select: { name: true, location: true, image: true },
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
