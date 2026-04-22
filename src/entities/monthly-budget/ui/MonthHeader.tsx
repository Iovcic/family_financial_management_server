'use client'

import { useState } from 'react'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import type { SerializedBudget } from '@/shared/lib/serializeDecimal'

interface Props {
  monthName: string
  income: number
  totalExpenses: number
  budgetId: string | null
  boardId: string
  year: number
  month: number
  onBudgetCreated?: (budget: SerializedBudget) => void
  onIncomeUpdate?: (newIncome: string) => void
}

export function MonthHeader({
  monthName,
  income,
  totalExpenses,
  budgetId,
  boardId,
  year,
  month,
  onBudgetCreated,
  onIncomeUpdate,
}: Props) {
  const [creating, setCreating] = useState(false)
  const [editingIncome, setEditingIncome] = useState(false)
  const [incomeDraft, setIncomeDraft] = useState(income.toFixed(2))

  async function handleCreate() {
    setCreating(true)
    const res = await fetch(`/api/boards/${boardId}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month }),
    })
    if (res.ok) {
      const data = await res.json()
      onBudgetCreated?.(data)
    }
    setCreating(false)
  }

  function commitIncome() {
    setEditingIncome(false)
    const val = parseFloat(incomeDraft)
    if (!isNaN(val) && val.toFixed(2) !== income.toFixed(2)) {
      onIncomeUpdate?.(val.toFixed(2))
    }
  }

  return (
    <div className="border-b border-gray-200 bg-white px-3 py-2">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{monthName}</h3>
        {budgetId === null && (
          <button
            onClick={handleCreate}
            disabled={creating}
            className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
          >
            {creating ? '…' : '+ Add'}
          </button>
        )}
      </div>

      {budgetId !== null && (
        <div className="space-y-0.5 text-xs text-gray-500">
          <div className="flex items-center justify-between gap-1">
            <span>Venit</span>
            {editingIncome ? (
              <input
                autoFocus
                type="number"
                value={incomeDraft}
                onChange={e => setIncomeDraft(e.target.value)}
                onBlur={commitIncome}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitIncome()
                  if (e.key === 'Escape') {
                    setIncomeDraft(income.toFixed(2))
                    setEditingIncome(false)
                  }
                }}
                className="w-20 rounded border border-blue-400 px-1 text-right text-xs text-green-600 outline-none"
              />
            ) : (
              <span
                className="cursor-text text-green-600 hover:underline"
                onClick={() => {
                  setIncomeDraft(income.toFixed(2))
                  setEditingIncome(true)
                }}
                title="Click to edit income"
              >
                {formatCurrency(income)}
              </span>
            )}
          </div>
          <div className="flex justify-between">
            <span>Total</span>
            <span>{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
