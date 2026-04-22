import { NextRequest, NextResponse } from 'next/server'
import { withBoardAccess } from '@/shared/middleware/withBoardAccess'
import { prisma } from '@/shared/db/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (_req, { params: p }) => {
    const [explicitCategories, entryCategories] = await Promise.all([
      prisma.category.findMany({
        where: { boardId: p.boardId },
        orderBy: { name: 'asc' },
      }),
      prisma.entry.findMany({
        where: { monthlyBudget: { boardId: p.boardId } },
        select: { categoryName: true },
        distinct: ['categoryName'],
        orderBy: { categoryName: 'asc' },
      }),
    ])

    const explicitMap = new Map(explicitCategories.map(c => [c.name, c]))

    const fromEntries = entryCategories
      .filter(e => !explicitMap.has(e.categoryName))
      .map(e => ({ name: e.categoryName, color: null }))

    const categories = [
      ...explicitCategories.map(c => ({ name: c.name, color: c.color })),
      ...fromEntries,
    ]

    return NextResponse.json({ categories })
  })(req, { params: resolvedParams })
}
