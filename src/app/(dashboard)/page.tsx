import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/shared/auth/getServerSession";
import { prisma } from "@/shared/db/prisma";
import { CreateBoardForm } from "@/features/board-management/create-board/ui/CreateBoardForm";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const boards = await prisma.board.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">My Boards</h1>

        {boards.length > 0 ? (
          <ul className="mb-6 space-y-2">
            {boards.map((board) => (
              <li key={board.id}>
                <Link
                  href={`/board/${board.id}`}
                  className="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3 hover:border-blue-300 hover:shadow-sm"
                >
                  <span className="font-medium text-gray-900">
                    {board.name}
                  </span>
                  <span className="text-sm text-gray-400">
                    {board._count.members} member
                    {board._count.members !== 1 ? "s" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-6 text-gray-500">No boards yet. Create one below.</p>
        )}

        <div className="rounded border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-700">
            Create new board
          </h2>
          <CreateBoardForm />
        </div>
      </div>
    </main>
  );
}
