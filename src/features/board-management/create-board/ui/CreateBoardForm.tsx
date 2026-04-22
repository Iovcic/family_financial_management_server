"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  onCreated?: (board: { id: string; name: string }) => void;
}

export function CreateBoardForm({ onCreated }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create board");
      setLoading(false);
      return;
    }

    const board = await res.json();
    if (onCreated) {
      onCreated(board);
    } else {
      router.push(`/board/${board.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Board name…"
        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create"}
      </button>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </form>
  );
}
