import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        circuitBungalow: true,
        room: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (error: unknown) {
    console.error("Fetch bookings error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch bookings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { circuitBungalowId, roomIds, fromDate, toDate, paymentSlipUrl } = body;

    if (!circuitBungalowId || !fromDate || !toDate) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Find a user to associate this booking with.
    // Try to find kasun_public first, otherwise use the first user in the DB.
    let user = await prisma.user.findFirst({
      where: { username: 'kasun_public' }
    });
    if (!user) {
      user = await prisma.user.findFirst();
    }
    if (!user) {
      return NextResponse.json({ error: "No user found in the database. Please seed the database first." }, { status: 400 });
    }

    // If roomIds is empty, we book the entire bungalow (all rooms inside it)
    const roomsToBook = roomIds && roomIds.length > 0
      ? await prisma.room.findMany({ where: { id: { in: roomIds } } })
      : await prisma.room.findMany({ where: { circuitBungalowId } });

    if (roomsToBook.length === 0) {
      return NextResponse.json({ error: "No rooms found to book." }, { status: 400 });
    }

    const checkStart = new Date(fromDate);
    checkStart.setHours(0, 0, 0, 0);
    const checkEnd = new Date(toDate);
    checkEnd.setHours(0, 0, 0, 0);

    // Validate that none of the rooms are already booked for the given dates
    for (const room of roomsToBook) {
      const existingBooking = await prisma.booking.findFirst({
        where: {
          roomId: room.id,
          status: { in: ['CONFIRMED', 'PENDING'] },
          fromDate: { lt: checkEnd },
          toDate: { gt: checkStart }
        }
      });

      if (existingBooking) {
        return NextResponse.json({
          error: `Room ${room.roomNumber} is already booked for these dates.`
        }, { status: 400 });
      }
    }

    const nightsCount = Math.round((checkEnd.getTime() - checkStart.getTime()) / (1000 * 60 * 60 * 24));
    const createdBookings = [];

    // Create a booking record for each room
    for (const room of roomsToBook) {
      const roomCost = room.price * (nightsCount || 1);
      const newBooking = await prisma.booking.create({
        data: {
          userId: user.id,
          circuitBungalowId,
          roomId: room.id,
          fromDate: checkStart,
          toDate: checkEnd,
          status: 'PENDING', // Default to Pending Booking as required
          totalCost: roomCost,
          paymentSlipUrl: paymentSlipUrl || null,
        }
      });
      createdBookings.push(newBooking);
    }

    return NextResponse.json({ success: true, bookings: createdBookings });
  } catch (error: unknown) {
    console.error("Booking creation error:", error);
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json(updatedBooking);
  } catch (error: unknown) {
    console.error("Update booking error:", error);
    const message = error instanceof Error ? error.message : "Failed to update booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
