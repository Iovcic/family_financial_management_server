import type { LoanData, LoanWithProgress } from './types'

export function remainingAmount(loan: LoanData): number {
  return parseFloat(loan.totalAmount) - parseFloat(loan.paidAmount)
}

export function progressPercent(loan: LoanData): number {
  const total = parseFloat(loan.totalAmount)
  if (total === 0) return 100
  return Math.min(100, (parseFloat(loan.paidAmount) / total) * 100)
}

export function remainingMonths(loan: LoanData): number | null {
  if (loan.endDate) {
    const now = new Date()
    const end = new Date(loan.endDate)
    const diff = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
    return Math.max(0, diff)
  }
  const monthly = parseFloat(loan.monthlyPayment)
  if (monthly === 0) return null
  return Math.ceil(remainingAmount(loan) / monthly)
}

export function enrichLoan(loan: LoanData): LoanWithProgress {
  return {
    ...loan,
    remainingAmount: remainingAmount(loan),
    progressPercent: progressPercent(loan),
    remainingMonths: remainingMonths(loan),
  }
}
