import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { hashPassword, needsRehash } from '../lib/auth';

/**
 * Migration script to upgrade all existing plain-text or legacy passwords
 * in the database to secure Argon2id hashes.
 */
async function migratePasswords() {
  console.log("🔒 Starting Argon2id Password Hash Migration...");

  const users = await prisma.user.findMany({
    select: { id: true, username: true, password: true },
  });

  let migratedCount = 0;
  let alreadyHashedCount = 0;

  for (const user of users) {
    if (needsRehash(user.password)) {
      console.log(`Hashing legacy password for user: ${user.username}`);
      const hashedPassword = await hashPassword(user.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      migratedCount++;
    } else {
      alreadyHashedCount++;
    }
  }

  console.log(`\n✅ Migration Complete:`);
  console.log(`- ${migratedCount} user(s) migrated to Argon2id`);
  console.log(`- ${alreadyHashedCount} user(s) were already using Argon2id`);
}

migratePasswords()
  .catch((err) => {
    console.error("❌ Password migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
