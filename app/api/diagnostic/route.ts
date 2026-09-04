import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const bungalows = await prisma.circuitBungalow.findMany({
    include: { rooms: true },
  });

  const report = [];
  report.push("Bungalow                  Rooms   Stored_noOfBeds(Cap)   Stored_Cap   Items");
  report.push("----------------------------------------------------------------------");

  for (const b of bungalows) {
    let totalRooms = b.rooms.length;
    let sumOfNoOfBeds = 0;
    let sumOfCapacity = 0;
    
    let items = [];

    for (const r of b.rooms) {
      sumOfNoOfBeds += r.noOfBeds || 0;
      sumOfCapacity += r.capacity || 0;
      items.push(r.items.join(', '));
    }

    const storedCapacity = b.capacity;
    
    report.push(`${b.name.padEnd(25)} ${String(totalRooms).padEnd(7)} ${String(sumOfNoOfBeds).padEnd(22)} ${String(storedCapacity).padEnd(12)} ${items.join(' | ')}`);
  }

  return new NextResponse(report.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
