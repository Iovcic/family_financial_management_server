"use client";

import { useRouter } from "next/navigation";

interface Props {
  year: number;
  boardId: string;
}

export function YearNavigator({ year, boardId }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => router.push(`/board/${boardId}?year=${year - 1}`)}
        className="flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100"
        aria-label="Previous year"
      >
        ‹
      </button>
      <span className="text-sm font-semibold text-gray-700">{year}</span>
      <button
        onClick={() => router.push(`/board/${boardId}?year=${year + 1}`)}
        className="flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100"
        aria-label="Next year"
      >
        ›
      </button>
    </div>
  );
}
