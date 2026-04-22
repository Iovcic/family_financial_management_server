'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { MONTH_NAMES } from '@/shared/lib/monthNames'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { totalExpenses, savings } from '@/entities/monthly-budget/model/calculations'
import type { SerializedBudget } from '@/shared/lib/serializeDecimal'

interface Props {
  budgets: SerializedBudget[]
  year: number
}

export function YearlyChart({ budgets, year }: Props) {
  const data = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const budget = budgets.find(b => b.month === month)
    return {
      month: MONTH_NAMES[i].slice(0, 3),
      expenses: budget ? totalExpenses(budget.entries) : 0,
      savings: budget ? savings(budget) : 0,
    }
  })

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{year} — Grafic anual</h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={v => formatCurrency(v).replace(/\s?MDL/i, '').trim()}
            width={70}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              name === 'expenses' ? 'Cheltuieli' : 'Economii',
            ]}
          />
          <Legend
            formatter={name => (name === 'expenses' ? 'Cheltuieli' : 'Economii')}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="expenses" fill="#ef4444" radius={[2, 2, 0, 0]} />
          <Line
            type="monotone"
            dataKey="savings"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
