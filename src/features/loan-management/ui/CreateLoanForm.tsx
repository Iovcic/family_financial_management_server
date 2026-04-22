'use client'

import { useState } from 'react'
import type { SerializedLoan } from '@/shared/lib/serializeDecimal'

interface Props {
  boardId: string
  onCreated?: (loan: SerializedLoan) => void
  onCancel?: () => void
}

export function CreateLoanForm({ boardId, onCreated, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    lender: '',
    totalAmount: '',
    monthlyPayment: '',
    startDate: '',
    endDate: '',
    notes: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body = {
      name: form.name,
      lender: form.lender || undefined,
      totalAmount: form.totalAmount,
      monthlyPayment: form.monthlyPayment,
      startDate: form.startDate,
      endDate: form.endDate || null,
      notes: form.notes || null,
    }

    const res = await fetch(`/api/boards/${boardId}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to create loan')
      setLoading(false)
      return
    }

    const loan = await res.json()
    onCreated?.(loan)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500">Denumire *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Credit Maib"
            className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Creditor</label>
          <input
            type="text"
            value={form.lender}
            onChange={e => update('lender', e.target.value)}
            placeholder="Maib"
            className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Suma totală *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.totalAmount}
            onChange={e => update('totalAmount', e.target.value)}
            className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Plată lunară *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.monthlyPayment}
            onChange={e => update('monthlyPayment', e.target.value)}
            className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Data start *</label>
          <input
            type="date"
            required
            value={form.startDate}
            onChange={e => update('startDate', e.target.value)}
            className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Data final</label>
          <input
            type="date"
            value={form.endDate}
            onChange={e => update('endDate', e.target.value)}
            className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500">Note</label>
        <textarea
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          rows={2}
          className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Create loan'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
