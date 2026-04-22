import type { SerializedEntry, SerializedBudget } from '@/shared/lib/serializeDecimal'

export function totalExpenses(entries: SerializedEntry[]): number {
  return entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0)
}

export function savings(budget: Pick<SerializedBudget, 'income' | 'entries'>): number {
  return parseFloat(budget.income) - totalExpenses(budget.entries)
}
