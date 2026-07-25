// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const dbUrl = new URL(process.env.DATABASE_URL!);
dbUrl.searchParams.delete('sslmode');
dbUrl.searchParams.delete('sslaccept');

const isLocal = dbUrl.hostname === 'localhost';

const pool = new Pool({
    connectionString: dbUrl.toString(),
    ...(isLocal ? {} : {
        ssl: {
            rejectUnauthorized: false,
        }
    }),
});

const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;