'use client'

import { formatCurrency } from '@/shared/lib/formatCurrency'
import type { LoanWithProgress } from '@/entities/loan/model/types'

interface Props {
  loan: LoanWithProgress
  onClose?: (loanId: string) => void
}

export function LoanCard({ loan, onClose }: Props) {
  return (
    <div className="rounded border border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{loan.name}</p>
          {loan.lender && <p className="text-xs text-gray-400">{loan.lender}</p>}
        </div>
        {onClose && (
          <button
            onClick={() => onClose(loan.id)}
            className="text-xs text-gray-400 hover:text-red-400"
            title="Close loan"
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${loan.progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Plătit: {formatCurrency(parseFloat(loan.paidAmount))}</span>
        <span>Rămas: {formatCurrency(loan.remainingAmount)}</span>
      </div>

      <div className="mt-1 flex justify-between text-xs text-gray-400">
        <span>Total: {formatCurrency(parseFloat(loan.totalAmount))}</span>
        {loan.remainingMonths !== null && (
          <span>{loan.remainingMonths} luni rămase</span>
        )}
      </div>
    </div>
  )
}
