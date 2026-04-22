import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as { prisma?: PrismaClient }

function makeAdapter() {
  const raw = process.env.DATABASE_URL!
  const url = new URL(raw)
  const sslMode = url.searchParams.get('ssl-mode')
  const ssl = sslMode ? { rejectUnauthorized: sslMode === 'VERIFY_CA' || sslMode === 'VERIFY_IDENTITY' } : undefined
  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    ssl,
  })
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: makeAdapter() })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
