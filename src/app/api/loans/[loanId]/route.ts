import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from '@/shared/auth/getServerSession'
import { prisma } from '@/shared/db/prisma'
import { serializeLoan } from '@/shared/lib/serializeDecimal'

const patchLoanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  lender: z.string().nullable().optional(),
  paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
})

async function getLoanWithAuth(loanId: string) {
  const session = await getServerSession()
  if (!session?.user) return { error: 'Unauthorized', status: 401 } as const

  const loan = await prisma.loan.findUnique({ where: { id: loanId } })
  if (!loan) return { error: 'Not found', status: 404 } as const

  const member = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId: loan.boardId, userId: session.user.id } },
  })
  if (!member) return { error: 'Forbidden', status: 403 } as const

  return { loan, session }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ loanId: string }> },
) {
  const { loanId } = await params
  const auth = await getLoanWithAuth(loanId)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await req.json()
  const parsed = patchLoanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.endDate !== undefined) {
    data.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null
  }

  const updated = await prisma.loan.update({ where: { id: loanId }, data })
  return NextResponse.json(serializeLoan(updated))
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ loanId: string }> },
) {
  const { loanId } = await params
  const auth = await getLoanWithAuth(loanId)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  await prisma.loan.delete({ where: { id: loanId } })
  return new NextResponse(null, { status: 204 })
}
