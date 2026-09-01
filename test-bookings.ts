import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    include: { room: true }
  });
  console.log("Bookings:", bookings.map(b => ({
    id: b.id,
    room: b.room.roomNumber,
    from: b.fromDate,
    to: b.toDate,
    status: b.status
  })));
}
main();
