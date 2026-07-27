// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const dbUrl = new URL(process.env.DATABASE_URL!);
const sslMode = dbUrl.searchParams.get('sslmode');
dbUrl.searchParams.delete('sslmode');
dbUrl.searchParams.delete('sslaccept');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
    connectionString: dbUrl.toString(),
    ssl: (isProduction || sslMode === 'require') ? {
        rejectUnauthorized: false,
    } : undefined,
});

const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;