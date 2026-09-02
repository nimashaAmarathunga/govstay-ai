import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const bungalows = await prisma.circuitBungalow.findMany({
    include: { rooms: true },
  });

  console.log("Bungalow                  Rooms   Beds   Calculated   Stored   Status");
  console.log("----------------------------------------------------------------------");

  for (const b of bungalows) {
    let totalRooms = b.rooms.length;
    let totalBeds = 0;
    let calculatedCapacity = 0;

    for (const r of b.rooms) {
      totalBeds += r.noOfBeds || 0;
      calculatedCapacity += r.capacity || 0;
    }

    const storedCapacity = b.capacity;
    const diff = calculatedCapacity - storedCapacity;
    const status = diff === 0 ? "VALID" : "INVALID";
    
    console.log(`${b.name.padEnd(25)} ${String(totalRooms).padEnd(7)} ${String(totalBeds).padEnd(6)} ${String(calculatedCapacity).padEnd(12)} ${String(storedCapacity).padEnd(8)} ${status}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
