import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withBoardAccess } from '@/shared/middleware/withBoardAccess'
import { prisma } from '@/shared/db/prisma'

const inviteSchema = z.object({
  email: z.string().email(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const resolvedParams = await params
  return withBoardAccess(async (innerReq, { params: p, session }) => {
    // Only owners can invite
    const callerMember = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId: p.boardId, userId: session.user.id } },
    })
    if (callerMember?.role !== 'owner') {
      return NextResponse.json({ error: 'Only board owners can invite members' }, { status: 403 })
    }

    const body = await innerReq.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existing = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId: p.boardId, userId: targetUser.id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 })
    }

    const member = await prisma.boardMember.create({
      data: { boardId: p.boardId, userId: targetUser.id, role: 'member' },
    })

    return NextResponse.json(
      { id: member.id, userId: targetUser.id, email: targetUser.email, role: member.role },
      { status: 201 },
    )
  })(req, { params: resolvedParams })
}
