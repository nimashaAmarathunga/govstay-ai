import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { BookingStatus } from "@prisma/client";

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
          select: {
            name: true,
            empId: true,
            placeOfWork: true,
            mobileNumber: true,
            emailAddress: true,
            nicNumber: true,
          },
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

// PATCH endpoint to update booking status and review reasoning
export async function PATCH(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, approvalReason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Booking ID and new status are required." },
        { status: 400 }
      );
    }

    // Validate status enum
    const validStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.REJECTED,
      BookingStatus.CANCELLED,
    ];

    if (!validStatuses.includes(status as BookingStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Update booking in database
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: status as BookingStatus,
        ...(approvalReason !== undefined && { approvalReason }),
      },
      include: {
        circuitBungalow: {
          select: { name: true, location: true, image: true, department: true },
        },
        room: {
          select: { roomNumber: true, roomType: true, price: true },
        },
        user: {
          select: {
            name: true,
            empId: true,
            placeOfWork: true,
            mobileNumber: true,
            emailAddress: true,
            nicNumber: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Booking ${updatedBooking.bookingId} status updated to ${status}.`,
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update booking status" },
      { status: 500 }
    );
  }
}
