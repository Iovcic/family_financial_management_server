import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withBoardAccess } from '@/shared/middleware/withBoardAccess'
import { prisma } from '@/shared/db/prisma'
import { serializeBudgets } from '@/shared/lib/serializeDecimal'

const createBudgetSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (innerReq, { params: p }) => {
    const yearParam = innerReq.nextUrl.searchParams.get('year')
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    const budgets = await prisma.monthlyBudget.findMany({
      where: { boardId: p.boardId, year },
      include: { entries: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { month: 'asc' },
    })

    return NextResponse.json(serializeBudgets(budgets))
  })(req, { params: resolvedParams })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (innerReq, { params: p }) => {
    const body = await innerReq.json()
    const parsed = createBudgetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    try {
      const budget = await prisma.monthlyBudget.create({
        data: { boardId: p.boardId, year: parsed.data.year, month: parsed.data.month },
        include: { entries: true },
      })
      return NextResponse.json(
        {
          ...budget,
          income: budget.income.toString(),
          entries: budget.entries.map(e => ({ ...e, amount: e.amount.toString() })),
        },
        { status: 201 },
      )
    } catch {
      return NextResponse.json({ error: 'Month already exists' }, { status: 409 })
    }
  })(req, { params: resolvedParams })
}
