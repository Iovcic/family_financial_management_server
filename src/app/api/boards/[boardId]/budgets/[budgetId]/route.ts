import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withBoardAccess } from '@/shared/middleware/withBoardAccess'
import { prisma } from '@/shared/db/prisma'

const patchBudgetSchema = z.object({
  income: z.string().regex(/^\d+(\.\d{1,2})?$/),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string; budgetId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (innerReq, { params: p }) => {
    const budget = await prisma.monthlyBudget.findFirst({
      where: { id: p.budgetId, boardId: p.boardId },
    })
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    const body = await innerReq.json()
    const parsed = patchBudgetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.monthlyBudget.update({
      where: { id: p.budgetId },
      data: { income: parsed.data.income },
    })

    return NextResponse.json({ ...updated, income: updated.income.toString() })
  })(req, { params: resolvedParams })
}
