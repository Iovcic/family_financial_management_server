"use client";

import { useState, startTransition, useOptimistic, useCallback } from "react";
import { YearNavigator } from "@/widgets/year-navigator/ui/YearNavigator";
import { SummaryBar } from "@/widgets/summary-bar/ui/SummaryBar";
import { BoardGrid } from "./BoardGrid";
import { LoansPanel } from "@/widgets/loans-panel/ui/LoansPanel";
import { YearlyChart } from "@/widgets/yearly-chart/ui/YearlyChart";
import { BoardContext } from "@/shared/contexts/boardContext";
import type {
  SerializedBudget,
  SerializedEntry,
} from "@/shared/lib/serializeDecimal";

interface Props {
  boardId: string;
  boardName: string;
  initialBudgets: SerializedBudget[];
  year: number;
}

type BudgetsAction =
  | { type: "ADD_BUDGET"; budget: SerializedBudget }
  | { type: "ADD_ENTRY"; budgetId: string; entry: SerializedEntry };

function budgetsReducer(
  budgets: SerializedBudget[],
  action: BudgetsAction,
): SerializedBudget[] {
  switch (action.type) {
    case "ADD_BUDGET":
      return [...budgets, action.budget].sort((a, b) => a.month - b.month);
    case "ADD_ENTRY":
      return budgets.map((b) =>
        b.id === action.budgetId
          ? { ...b, entries: [...b.entries, action.entry] }
          : b,
      );
    default:
      return budgets;
  }
}

export function BoardGridClient({
  boardId,
  boardName,
  initialBudgets,
  year,
}: Props) {
  const [budgets, setBudgets] = useState<SerializedBudget[]>(initialBudgets);
  const [optimisticBudgets, addOptimistic] = useOptimistic(
    budgets,
    budgetsReducer,
  );
  const [showLoans, setShowLoans] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const handleBudgetCreated = useCallback((budget: SerializedBudget) => {
    setBudgets((prev) => [...prev, budget].sort((a, b) => a.month - b.month));
  }, []);

  const handleAddEntry = useCallback(
    async (budgetId: string) => {
      const tempEntry: SerializedEntry = {
        id: `temp-${Date.now()}`,
        monthlyBudgetId: budgetId,
        categoryName: "",
        note: null,
        amount: "0",
        type: "expense",
        color: null,
        sortOrder: 0,
        loanId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      startTransition(() => {
        addOptimistic({ type: "ADD_ENTRY", budgetId, entry: tempEntry });
      });

      const res = await fetch(
        `/api/boards/${boardId}/budgets/${budgetId}/entries`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryName: "",
            amount: "0",
            type: "expense",
          }),
        },
      );

      if (res.ok) {
        const created: SerializedEntry = await res.json();
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === budgetId
              ? {
                  ...b,
                  entries: [
                    ...b.entries.filter((e) => e.id !== tempEntry.id),
                    created,
                  ],
                }
              : b,
          ),
        );
      } else {
        setBudgets((prev) =>
          prev.map((b) =>
            b.id === budgetId
              ? {
                  ...b,
                  entries: b.entries.filter((e) => e.id !== tempEntry.id),
                }
              : b,
          ),
        );
      }
    },
    [boardId, addOptimistic],
  );

  const handleUpdateEntry = useCallback(
    async (entryId: string, field: string, value: string | null) => {
      const prevBudgets = budgets;
      setBudgets((prev) =>
        prev.map((b) => ({
          ...b,
          entries: b.entries.map((e) =>
            e.id === entryId ? { ...e, [field]: value } : e,
          ),
        })),
      );

      const res = await fetch(`/api/entries/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) setBudgets(prevBudgets);
    },
    [budgets],
  );

  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      const prevBudgets = budgets;
      setBudgets((prev) =>
        prev.map((b) => ({
          ...b,
          entries: b.entries.filter((e) => e.id !== entryId),
        })),
      );
      const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
      if (!res.ok) setBudgets(prevBudgets);
    },
    [budgets],
  );

  const handleIncomeUpdate = useCallback(
    async (budgetId: string, income: string) => {
      const prevBudgets = budgets;
      setBudgets((prev) =>
        prev.map((b) => (b.id === budgetId ? { ...b, income } : b)),
      );
      const res = await fetch(`/api/boards/${boardId}/budgets/${budgetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income }),
      });
      if (!res.ok) setBudgets(prevBudgets);
    },
    [boardId, budgets],
  );

  return (
    <BoardContext.Provider
      value={{
        boardId,
        year,
        onBudgetCreated: handleBudgetCreated,
        onAddEntry: handleAddEntry,
        onUpdateEntry: handleUpdateEntry,
        onDeleteEntry: handleDeleteEntry,
        onIncomeUpdate: handleIncomeUpdate,
      }}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
          <h2 className="text-sm font-semibold text-gray-900">{boardName}</h2>
          <YearNavigator year={year} boardId={boardId} />
          <div className="flex-1" />
          <SummaryBar budgets={optimisticBudgets} />
          <div className="flex gap-2">
            <button
              onClick={() => setShowChart((v) => !v)}
              className={`rounded px-2 py-1 text-xs ${showChart ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              📊 Chart
            </button>
            <button
              onClick={() => setShowLoans((v) => !v)}
              className={`rounded px-2 py-1 text-xs ${showLoans ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}
            >
              💳 Loans
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <BoardGrid budgets={optimisticBudgets} />
          </div>

          {showLoans && (
            <div className="w-72 shrink-0 overflow-y-auto border-l border-gray-200 bg-gray-50">
              <LoansPanel boardId={boardId} />
            </div>
          )}
        </div>

        {showChart && (
          <div className="shrink-0 overflow-y-auto border-t border-gray-200">
            <YearlyChart budgets={optimisticBudgets} year={year} />
          </div>
        )}
      </div>
    </BoardContext.Provider>
  );
}
