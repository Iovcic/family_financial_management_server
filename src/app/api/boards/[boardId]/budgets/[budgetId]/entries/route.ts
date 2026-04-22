import { NextRequest, NextResponse } from 'next/server'
import { withBoardAccess } from '@/shared/middleware/withBoardAccess'
import { prisma } from '@/shared/db/prisma'
import { createEntrySchema } from '@/features/entry-editing/model/entrySchema'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; budgetId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (innerReq, { params: p }) => {
    const budgetId = p.budgetId

    const budget = await prisma.monthlyBudget.findFirst({
      where: { id: budgetId, boardId: p.boardId },
    })
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    const body = await innerReq.json()
    const parsed = createEntrySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const maxOrder = await prisma.entry.aggregate({
      where: { monthlyBudgetId: budgetId },
      _max: { sortOrder: true },
    })
    const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1000

    const entry = await prisma.entry.create({
      data: {
        monthlyBudgetId: budgetId,
        categoryName: parsed.data.categoryName,
        note: parsed.data.note ?? null,
        amount: parsed.data.amount,
        type: parsed.data.type,
        color: parsed.data.color ?? null,
        loanId: parsed.data.loanId ?? null,
        sortOrder,
      },
    })

    return NextResponse.json(
      { ...entry, amount: entry.amount.toString() },
      { status: 201 },
    )
  })(req, { params: resolvedParams })
}
