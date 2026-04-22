import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withBoardAccess } from '@/shared/middleware/withBoardAccess'
import { prisma } from '@/shared/db/prisma'

const duplicateSchema = z.object({
  targetBudgetId: z.string().min(1),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; budgetId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (innerReq, { params: p }) => {
    const body = await innerReq.json()
    const parsed = duplicateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const [sourceBudget, targetBudget] = await Promise.all([
      prisma.monthlyBudget.findFirst({
        where: { id: p.budgetId, boardId: p.boardId },
        include: { entries: { orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.monthlyBudget.findFirst({
        where: { id: parsed.data.targetBudgetId, boardId: p.boardId },
      }),
    ])

    if (!sourceBudget || !targetBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    if (sourceBudget.entries.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    await prisma.$transaction(
      sourceBudget.entries.map(e =>
        prisma.entry.create({
          data: {
            monthlyBudgetId: targetBudget.id,
            categoryName: e.categoryName,
            note: e.note,
            amount: e.amount,
            type: e.type,
            color: e.color,
            loanId: e.loanId,
            sortOrder: e.sortOrder,
          },
        }),
      ),
    )

    return NextResponse.json({ count: sourceBudget.entries.length })
  })(req, { params: resolvedParams })
}
