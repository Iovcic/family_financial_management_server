import type { SerializedLoan } from '@/shared/lib/serializeDecimal'

export type LoanData = SerializedLoan

export interface LoanWithProgress extends LoanData {
  remainingAmount: number
  progressPercent: number
  remainingMonths: number | null
}
