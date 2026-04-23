'use client'

import { createContext, use } from 'react'
import type { SerializedBudget } from '@/shared/lib/serializeDecimal'

export interface BoardContextValue {
  boardId: string
  year: number
  onBudgetCreated: (budget: SerializedBudget) => void
  onAddEntry: (budgetId: string) => void
  onUpdateEntry: (entryId: string, field: string, value: string | null) => void
  onDeleteEntry: (entryId: string) => void
  onIncomeUpdate: (budgetId: string, income: string) => void
}

export const BoardContext = createContext<BoardContextValue | null>(null)

export function useBoardContext(): BoardContextValue {
  const ctx = use(BoardContext)
  if (!ctx) throw new Error('useBoardContext must be used within a BoardContext.Provider')
  return ctx
}
