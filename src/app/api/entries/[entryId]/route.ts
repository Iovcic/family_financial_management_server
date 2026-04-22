import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/shared/auth/getServerSession'
import { prisma } from '@/shared/db/prisma'
import { patchEntrySchema } from '@/features/entry-editing/model/entrySchema'

async function getEntryWithAuth(entryId: string) {
  const session = await getServerSession()
  if (!session?.user) return { error: 'Unauthorized', status: 401 } as const

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { monthlyBudget: { select: { boardId: true } } },
  })
  if (!entry) return { error: 'Not found', status: 404 } as const

  const member = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId: entry.monthlyBudget.boardId,
        userId: session.user.id,
      },
    },
  })
  if (!member) return { error: 'Forbidden', status: 403 } as const

  return { entry, session }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params
  const auth = await getEntryWithAuth(entryId)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await req.json()
  const parsed = patchEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.entry.update({
    where: { id: entryId },
    data: parsed.data,
  })

  return NextResponse.json({ ...updated, amount: updated.amount.toString() })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params
  const auth = await getEntryWithAuth(entryId)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  await prisma.entry.delete({ where: { id: entryId } })
  return new NextResponse(null, { status: 204 })
}
