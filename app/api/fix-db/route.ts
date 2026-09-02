import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function calculateBedsAndCapacity(items: string[]): { physicalBeds: number, sleepingCapacity: number } {
  let physicalBeds = 0;
  let sleepingCapacity = 0;

  for (const item of items) {
    const lowerItem = item.toLowerCase();
    
    if (lowerItem.includes("1 double + 1 single bed")) {
      physicalBeds += 2;
      sleepingCapacity += 3;
    } else if (lowerItem.includes("two single beds") || lowerItem.includes("twin single beds")) {
      physicalBeds += 2;
      sleepingCapacity += 2;
    } else if (lowerItem.includes("double bed") || lowerItem.includes("queen bed") || lowerItem.includes("king size bed") || lowerItem.includes("king bed")) {
      physicalBeds += 1;
      sleepingCapacity += 2;
    } else if (lowerItem.includes("single bed")) {
      physicalBeds += 1;
      sleepingCapacity += 1;
    }
  }
  return { physicalBeds, sleepingCapacity };
}

export async function GET() {
  try {
    const rooms = await prisma.room.findMany();
    
    let updatedRooms = 0;
    for (const room of rooms) {
      const { physicalBeds, sleepingCapacity } = calculateBedsAndCapacity(room.items);
      
      const finalPhysicalBeds = physicalBeds > 0 ? physicalBeds : (room.noOfBeds || 1);
      const finalSleepingCapacity = sleepingCapacity > 0 ? sleepingCapacity : (room.noOfBeds || 1) * 2;

      await prisma.room.update({
        where: { id: room.id },
        data: {
          bed_count: finalPhysicalBeds,
          capacity: finalSleepingCapacity,
        }
      });
      updatedRooms++;
    }

    const bungalows = await prisma.circuitBungalow.findMany({
      include: { rooms: true }
    });

    let updatedBungalows = 0;
    for (const b of bungalows) {
      let totalCapacity = 0;
      for (const r of b.rooms) {
        totalCapacity += r.capacity || 0;
      }
      
      if (totalCapacity > 0) {
        await prisma.circuitBungalow.update({
          where: { id: b.id },
          data: { capacity: totalCapacity }
        });
        updatedBungalows++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedRooms} rooms and ${updatedBungalows} bungalows.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
