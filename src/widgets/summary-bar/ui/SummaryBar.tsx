import { formatCurrency } from '@/shared/lib/formatCurrency'
import { totalExpenses } from '@/entities/monthly-budget/model/calculations'
import type { SerializedBudget } from '@/shared/lib/serializeDecimal'

interface Props {
  budgets: SerializedBudget[]
}

export function SummaryBar({ budgets }: Props) {
  const totalIncome = budgets.reduce((sum, b) => sum + parseFloat(b.income), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + totalExpenses(b.entries), 0)
  const totalSavings = totalIncome - totalSpent

  return (
    <div className="flex gap-4 rounded border border-gray-200 bg-white px-4 py-3">
      <Stat label="Venit total" value={formatCurrency(totalIncome)} color="text-green-600" />
      <div className="w-px bg-gray-200" />
      <Stat label="Cheltuieli" value={formatCurrency(totalSpent)} color="text-gray-900" />
      <div className="w-px bg-gray-200" />
      <Stat
        label="Economii"
        value={formatCurrency(totalSavings)}
        color={totalSavings >= 0 ? 'text-green-600' : 'text-red-500'}
      />
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}
