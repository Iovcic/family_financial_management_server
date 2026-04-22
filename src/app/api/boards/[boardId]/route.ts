import { NextRequest, NextResponse } from 'next/server'
import { withBoardAccess } from '@/shared/middleware/withBoardAccess'
import { prisma } from '@/shared/db/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (_req, { params: p }) => {
    const board = await prisma.board.findUnique({
      where: { id: p.boardId },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, name: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    })
    if (!board) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(board)
  })(req, { params: resolvedParams })
}
