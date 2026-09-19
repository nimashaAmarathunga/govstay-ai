import { prisma } from "./lib/prisma";

async function main() {
  try {
    const bungalows = await prisma.bungalow.findMany({
      select: { image: true }
    });
    console.log(JSON.stringify(bungalows.map(b => b.image)));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
