'use client'

import useSWR from 'swr'
import type { SerializedLoan } from '@/shared/lib/serializeDecimal'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Props {
  boardId: string
  value: string | null
  onChange: (loanId: string | null) => void
}

export function LoanSelector({ boardId, value, onChange }: Props) {
  const { data: loans = [] } = useSWR<SerializedLoan[]>(
    `/api/boards/${boardId}/loans`,
    fetcher,
    { revalidateOnFocus: false },
  )

  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
    >
      <option value="">— None —</option>
      {loans.map(loan => (
        <option key={loan.id} value={loan.id}>
          {loan.name}{loan.lender ? ` (${loan.lender})` : ''}
        </option>
      ))}
    </select>
  )
}
