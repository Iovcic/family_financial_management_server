'use client'

import { MONTH_NAMES } from '@/shared/lib/monthNames'
import { totalExpenses, savings } from '@/entities/monthly-budget/model/calculations'
import { MonthHeader } from './MonthHeader'
import { MonthFooter } from './MonthFooter'
import { EntryRow } from '@/entities/entry/ui/EntryRow'
import type { SerializedBudget, SerializedEntry } from '@/shared/lib/serializeDecimal'

interface Props {
  budget: SerializedBudget | null
  month: number
  boardId: string
  year: number
  onBudgetCreated?: (budget: SerializedBudget) => void
  onAddEntry?: (budgetId: string) => void
  onUpdateEntry?: (entryId: string, field: string, value: string | null) => void
  onDeleteEntry?: (entryId: string) => void
  onIncomeUpdate?: (budgetId: string, newIncome: string) => void
}

export function MonthColumn({
  budget,
  month,
  boardId,
  year,
  onBudgetCreated,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onIncomeUpdate,
}: Props) {
  const monthName = MONTH_NAMES[month - 1]
  const entries = budget?.entries ?? []

  const loanEntries: SerializedEntry[] = entries.filter(e => e.loanId !== null)
  const regularEntries: SerializedEntry[] = entries.filter(e => e.loanId === null)

  const expensesTotal = totalExpenses(entries)
  const savingsAmount = budget ? savings(budget) : 0

  return (
    <div className="flex w-[280px] flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      <MonthHeader
        monthName={monthName}
        income={budget ? parseFloat(budget.income) : 0}
        totalExpenses={expensesTotal}
        budgetId={budget?.id ?? null}
        boardId={boardId}
        year={year}
        month={month}
        onBudgetCreated={onBudgetCreated}
        onIncomeUpdate={
          budget && onIncomeUpdate
            ? newIncome => onIncomeUpdate(budget.id, newIncome)
            : undefined
        }
      />

      {budget ? (
        <div className="flex-1 overflow-y-auto">
          {/* Loan entries */}
          {loanEntries.map((entry, i) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              rowIndex={i}
              boardId={boardId}
              onUpdate={onUpdateEntry}
              onDelete={onDeleteEntry}
            />
          ))}

          {loanEntries.length > 0 && regularEntries.length > 0 && (
            <div className="mx-2 my-1 border-t border-dashed border-blue-200" />
          )}

          {/* Regular entries */}
          {regularEntries.map((entry, i) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              rowIndex={loanEntries.length + i}
              boardId={boardId}
              onUpdate={onUpdateEntry}
              onDelete={onDeleteEntry}
            />
          ))}

          {onAddEntry && (
            <button
              onClick={() => onAddEntry(budget.id)}
              className="w-full px-3 py-1.5 text-left text-xs text-gray-400 hover:bg-gray-50 hover:text-blue-500"
            >
              + Add row
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-xs text-gray-300">
          No data
        </div>
      )}

      <MonthFooter totalExpenses={expensesTotal} savings={savingsAmount} />
    </div>
  )
}
