// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    const dbUrl = new URL(connectionString);
    const sslMode = dbUrl.searchParams.get('sslmode');
    dbUrl.searchParams.delete('sslmode');
    dbUrl.searchParams.delete('sslaccept');

    const pool = new Pool({
        connectionString: dbUrl.toString(),
        ssl: sslMode === 'require' ? {
            rejectUnauthorized: false,
        } : undefined,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}