'use client'

import { useMemo } from 'react'
import { MonthColumn } from './MonthColumn'
import type { SerializedBudget } from '@/shared/lib/serializeDecimal'

interface Props {
  budgets: SerializedBudget[]
}

export function BoardGrid({ budgets }: Props) {
  const budgetsByMonth = useMemo(
    () => new Map(budgets.map(b => [b.month, b])),
    [budgets],
  )

  return (
    <div className="flex h-full flex-row overflow-x-auto">
      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
        <MonthColumn
          key={month}
          month={month}
          budget={budgetsByMonth.get(month) ?? null}
        />
      ))}
    </div>
  )
}
