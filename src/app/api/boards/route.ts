import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from '@/shared/auth/getServerSession'
import { prisma } from '@/shared/db/prisma'

const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function GET() {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const boards = await prisma.board.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(boards)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createBoardSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const board = await prisma.$transaction(async tx => {
    const newBoard = await tx.board.create({
      data: { name: parsed.data.name, ownerId: session.user.id },
    })
    await tx.boardMember.create({
      data: { boardId: newBoard.id, userId: session.user.id, role: 'owner' },
    })
    return newBoard
  })

  return NextResponse.json(board, { status: 201 })
}
