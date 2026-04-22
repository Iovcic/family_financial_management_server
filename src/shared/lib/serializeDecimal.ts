export type SerializedEntry = {
  id: string
  monthlyBudgetId: string
  categoryName: string
  note: string | null
  amount: string
  type: 'expense' | 'income'
  color: string | null
  sortOrder: number
  loanId: string | null
  createdAt: Date
  updatedAt: Date
}

export type SerializedBudget = {
  id: string
  boardId: string
  year: number
  month: number
  income: string
  createdAt: Date
  entries: SerializedEntry[]
}

export type SerializedLoan = {
  id: string
  boardId: string
  name: string
  lender: string | null
  totalAmount: string
  paidAmount: string
  monthlyPayment: string
  startDate: Date
  endDate: Date | null
  isActive: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

type DecimalLike = { toString(): string }

type RawEntry = {
  id: string
  monthlyBudgetId: string
  categoryName: string
  note: string | null
  amount: DecimalLike
  type: 'expense' | 'income'
  color: string | null
  sortOrder: number
  loanId: string | null
  createdAt: Date
  updatedAt: Date
}

type RawBudget = {
  id: string
  boardId: string
  year: number
  month: number
  income: DecimalLike
  createdAt: Date
  entries: RawEntry[]
}

type RawLoan = {
  id: string
  boardId: string
  name: string
  lender: string | null
  totalAmount: DecimalLike
  paidAmount: DecimalLike
  monthlyPayment: DecimalLike
  startDate: Date
  endDate: Date | null
  isActive: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export function serializeEntry(entry: RawEntry): SerializedEntry {
  return { ...entry, amount: entry.amount.toString() }
}

export function serializeBudget(budget: RawBudget): SerializedBudget {
  return {
    ...budget,
    income: budget.income.toString(),
    entries: budget.entries.map(serializeEntry),
  }
}

export function serializeBudgets(budgets: RawBudget[]): SerializedBudget[] {
  return budgets.map(serializeBudget)
}

export function serializeLoan(loan: RawLoan): SerializedLoan {
  return {
    ...loan,
    totalAmount: loan.totalAmount.toString(),
    paidAmount: loan.paidAmount.toString(),
    monthlyPayment: loan.monthlyPayment.toString(),
  }
}
