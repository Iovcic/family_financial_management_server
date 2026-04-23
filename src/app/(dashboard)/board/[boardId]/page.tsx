import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/shared/auth/getServerSession";
import { prisma } from "@/shared/db/prisma";
import { serializeBudgets } from "@/shared/lib/serializeDecimal";
import { BoardGridClient } from "@/widgets/board-grid/ui/BoardGridClient";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const [{ boardId }, { year: yearParam }, session] = await Promise.all([
    params,
    searchParams,
    getServerSession(),
  ]);
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  if (!session) redirect("/login");

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      members: { where: { userId: session.user.id } },
    },
  });

  if (!board || board.members.length === 0) redirect("/");

  const rawBudgets = await prisma.monthlyBudget.findMany({
    where: { boardId, year },
    include: { entries: { orderBy: { sortOrder: "asc" } } },
    orderBy: { month: "asc" },
  });

  const budgets = serializeBudgets(rawBudgets);
  return (
    <div className="flex h-screen flex-col">
      <nav className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-2 text-sm">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          ← Boards
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-700">{board.name}</span>
        <div className="flex-1" />
        <Link
          href={`/board/${boardId}/settings`}
          className="text-gray-400 hover:text-gray-600"
        >
          Settings
        </Link>
      </nav>

      <div className="flex-1 overflow-hidden">
        <BoardGridClient
          boardId={boardId}
          boardName={board.name}
          initialBudgets={budgets}
          year={year}
        />
      </div>
    </div>
  );
}
