// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Creates a new PrismaClient instance with a PostgreSQL pool adapter.
 * The pool and adapter are only constructed when a client does not already exist.
 * This prevents a new connection pool from being opened on every hot‑reload in
 * Next.js development mode.
 */
function getPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const dbUrl = new URL(connectionString);
  const sslMode = dbUrl.searchParams.get('sslmode');
  // Remove adapter‑specific query params so libpq does not reject them.
  dbUrl.searchParams.delete('sslmode');
  dbUrl.searchParams.delete('sslaccept');

  const pool = new Pool({
    connectionString: dbUrl.toString(),
    ssl: sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Export a singleton Prisma client. In development we store it on globalThis
// so it survives Fast Refresh without creating a new pool each time.
export const prisma: PrismaClient = (globalThis as any).prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).prisma = prisma;
}