'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { enrichLoan } from '@/entities/loan/model/calculations'
import { LoanCard } from '@/entities/loan/ui/LoanCard'
import { CreateLoanForm } from '@/features/loan-management/ui/CreateLoanForm'
import type { SerializedLoan } from '@/shared/lib/serializeDecimal'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Props {
  boardId: string
}

export function LoansPanel({ boardId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const { data: loans = [], mutate } = useSWR<SerializedLoan[]>(
    `/api/boards/${boardId}/loans`,
    fetcher,
  )

  async function handleClose(loanId: string) {
    await fetch(`/api/loans/${loanId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    })
    mutate()
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Credite active</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add loan'}
        </button>
      </div>

      {showForm && (
        <CreateLoanForm
          boardId={boardId}
          onCreated={() => {
            mutate()
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loans.length === 0 && !showForm && (
        <p className="text-xs text-gray-400">No active loans.</p>
      )}

      {loans.map(loan => (
        <LoanCard key={loan.id} loan={enrichLoan(loan)} onClose={handleClose} />
      ))}
    </div>
  )
}
