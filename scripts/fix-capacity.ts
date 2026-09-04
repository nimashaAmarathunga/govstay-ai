import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

  // Fallback if no recognizable beds are found in items, use noOfBeds as physical beds and 2x as capacity (conservative)
  // Actually, wait, let's just use the exact items as they are the source of truth!
  return { physicalBeds, sleepingCapacity };
}

async function main() {
  console.log("Starting DB capacity fix...");
  const rooms = await prisma.room.findMany();
  
  let updatedRooms = 0;
  for (const room of rooms) {
    const { physicalBeds, sleepingCapacity } = calculateBedsAndCapacity(room.items);
    
    // If it couldn't detect any beds from items but noOfBeds > 0, fallback
    const finalPhysicalBeds = physicalBeds > 0 ? physicalBeds : (room.noOfBeds || 1);
    const finalSleepingCapacity = sleepingCapacity > 0 ? sleepingCapacity : (room.noOfBeds || 1) * 2;

    await prisma.room.update({
      where: { id: room.id },
      data: {
        bed_count: finalPhysicalBeds,
        capacity: finalSleepingCapacity,
        // Optional: you can sync noOfBeds if needed, but we'll rely on bed_count and capacity.
      }
    });
    updatedRooms++;
  }
  
  console.log(`Updated ${updatedRooms} rooms with explicit bed_count and capacity.`);

  // Now update bungalows
  const bungalows = await prisma.circuitBungalow.findMany({
    include: { rooms: true }
  });

  for (const b of bungalows) {
    let totalCapacity = 0;
    for (const r of b.rooms) {
      totalCapacity += r.capacity || 0;
    }
    
    if (totalCapacity > 0) {
      await prisma.circuitBungalow.update({
        where: { id: b.id },
        data: {
          capacity: totalCapacity
        }
      });
      console.log(`Updated Bungalow '${b.name}' to capacity: ${totalCapacity}`);
    }
  }
  
  console.log("Database update complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
