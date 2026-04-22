import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/shared/auth/getServerSession'
import { prisma } from '@/shared/db/prisma'

type Handler = (
  req: NextRequest,
  context: { params: Record<string, string>; session: { user: { id: string; email: string } } }
) => Promise<NextResponse>

export function withBoardAccess(handler: Handler) {
  return async (req: NextRequest, { params }: { params: Record<string, string> }) => {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const boardId = params.boardId
    if (!boardId) {
      return NextResponse.json({ error: 'Missing boardId' }, { status: 400 })
    }

    const member = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: session.user.id } },
    })
    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return handler(req, {
      params,
      session: session as { user: { id: string; email: string } },
    })
  }
}
