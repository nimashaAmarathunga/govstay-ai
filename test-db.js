const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bungalows = await prisma.bungalow.findMany({
    select: { image: true }
  });
  console.log(bungalow.map(b => b.image));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
