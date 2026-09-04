import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    // We search by the CUID 'bookingId' which the user and frontend uses, 
    // rather than the internal UUID 'id'
    const booking = await prisma.booking.findUnique({
      where: { bookingId: id },
      include: {
        circuitBungalow: true,
        room: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error: unknown) {
    console.error("Fetch booking error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
