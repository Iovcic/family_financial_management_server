import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/shared/auth/getServerSession";
import { prisma } from "@/shared/db/prisma";
import { InviteMemberForm } from "@/features/board-management/invite-member/ui/InviteMemberForm";

export default async function BoardSettingsPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const session = await getServerSession();
  if (!session) redirect("/login");

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: {
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!board) redirect("/");

  const currentMember = board.members.find((m) => m.userId === session.user.id);
  if (!currentMember) redirect("/");

  const isOwner = currentMember.role === "owner";

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/board/${boardId}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to board
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{board.name}</h1>
          <p className="text-sm text-gray-500">Board settings</p>
        </div>

        <div className="rounded border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Members
          </h2>
          <ul className="divide-y divide-gray-100">
            {board.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.user.name ?? member.user.email}
                  </p>
                  {member.user.name && (
                    <p className="text-xs text-gray-400">{member.user.email}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    member.role === "owner"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {member.role}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {isOwner && (
          <div className="rounded border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Invite member
            </h2>
            <InviteMemberForm boardId={boardId} />
          </div>
        )}
      </div>
    </main>
  );
}
