import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as { prisma?: PrismaClient }

function parseSsl(sslMode: string | null) {
  if (!sslMode || sslMode === 'DISABLED') return undefined
  if (sslMode === 'VERIFY_CA' || sslMode === 'VERIFY_IDENTITY') return { rejectUnauthorized: true }
  return { rejectUnauthorized: false } // REQUIRED or unknown
}

function makeAdapter() {
  const raw = process.env.DATABASE_URL!
  const url = new URL(raw)
  const ssl = parseSsl(url.searchParams.get('ssl-mode'))
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
