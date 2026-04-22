'use client'

import { MonthColumn } from '@/entities/monthly-budget/ui/MonthColumn'
import type { SerializedBudget } from '@/shared/lib/serializeDecimal'

interface Props {
  boardId: string
  year: number
  budgets: SerializedBudget[]
  onBudgetCreated?: (budget: SerializedBudget) => void
  onAddEntry?: (budgetId: string) => void
  onUpdateEntry?: (entryId: string, field: string, value: string | null) => void
  onDeleteEntry?: (entryId: string) => void
  onIncomeUpdate?: (budgetId: string, newIncome: string) => void
}

export function BoardGrid({
  boardId,
  year,
  budgets,
  onBudgetCreated,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onIncomeUpdate,
}: Props) {
  const budgetsByMonth = new Map(budgets.map(b => [b.month, b]))

  return (
    <div className="flex h-full flex-row overflow-x-auto">
      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
        <MonthColumn
          key={month}
          month={month}
          boardId={boardId}
          year={year}
          budget={budgetsByMonth.get(month) ?? null}
          onBudgetCreated={onBudgetCreated}
          onAddEntry={onAddEntry}
          onUpdateEntry={onUpdateEntry}
          onDeleteEntry={onDeleteEntry}
          onIncomeUpdate={onIncomeUpdate}
        />
      ))}
    </div>
  )
}
