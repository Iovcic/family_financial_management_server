import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withBoardAccess } from '@/shared/middleware/withBoardAccess'
import { prisma } from '@/shared/db/prisma'
import { serializeLoan } from '@/shared/lib/serializeDecimal'

const createLoanSchema = z.object({
  name: z.string().min(1).max(100),
  lender: z.string().optional(),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  monthlyPayment: z.string().regex(/^\d+(\.\d{1,2})?$/),
  startDate: z.string().min(1),
  endDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (_req, { params: p }) => {
    const loans = await prisma.loan.findMany({
      where: { boardId: p.boardId, isActive: true },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(loans.map(serializeLoan))
  })(req, { params: resolvedParams })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (innerReq, { params: p }) => {
    const body = await innerReq.json()
    const parsed = createLoanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const loan = await prisma.loan.create({
      data: {
        boardId: p.boardId,
        name: parsed.data.name,
        lender: parsed.data.lender ?? null,
        totalAmount: parsed.data.totalAmount,
        monthlyPayment: parsed.data.monthlyPayment,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        notes: parsed.data.notes ?? null,
      },
    })

    return NextResponse.json(serializeLoan(loan), { status: 201 })
  })(req, { params: resolvedParams })
}
