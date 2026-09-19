const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const dbUrl = new URL(connectionString);
dbUrl.searchParams.delete('sslmode');
dbUrl.searchParams.delete('sslaccept');
dbUrl.searchParams.delete('pgbouncer');
dbUrl.searchParams.delete('connection_limit');

const pool = new Pool({
  connectionString: dbUrl.toString(),
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "system_config" (
        "id" TEXT NOT NULL,
        "bankName" TEXT NOT NULL DEFAULT 'ABC Bank',
        "accountName" TEXT NOT NULL DEFAULT 'GovSewana Official Bank Account',
        "accountNumber" TEXT NOT NULL DEFAULT '123456',
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
      );
    `);
    
    await client.query(`
      INSERT INTO "system_config" ("id", "bankName", "accountName", "accountNumber", "updatedAt")
      VALUES ('global', 'ABC Bank', 'GovSewana Official Bank Account', '123456', NOW())
      ON CONFLICT ("id") DO UPDATE SET 
        "bankName" = EXCLUDED."bankName",
        "accountName" = EXCLUDED."accountName",
        "accountNumber" = EXCLUDED."accountNumber",
        "updatedAt" = EXCLUDED."updatedAt";
    `);
    console.log("system_config table created and seeded successfully.");
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
