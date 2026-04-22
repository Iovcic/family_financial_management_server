import { formatCurrency } from '@/shared/lib/formatCurrency'

interface Props {
  totalExpenses: number
  savings: number
}

export function MonthFooter({ totalExpenses, savings }: Props) {
  return (
    <div className="sticky bottom-0 border-t-2 border-gray-300 bg-white">
      <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-700">
        <span>Total</span>
        <span>{formatCurrency(totalExpenses)}</span>
      </div>
      <div
        className={`flex items-center justify-between border-t border-gray-100 px-3 py-1.5 text-xs font-semibold ${
          savings >= 0 ? 'text-green-600' : 'text-red-500'
        }`}
      >
        <span>Economii</span>
        <span>{formatCurrency(savings)}</span>
      </div>
    </div>
  )
}
