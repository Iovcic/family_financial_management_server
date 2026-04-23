'use client'

import { formatCurrency } from '@/shared/lib/formatCurrency'
import { useBoardContext } from '@/shared/contexts/boardContext'
import { InlineCell } from './InlineCell'
import { CategoryAutocomplete } from './CategoryAutocomplete'
import { ColorPicker } from './ColorPicker'
import type { SerializedEntry } from '@/shared/lib/serializeDecimal'

interface Props {
  entry: SerializedEntry
  rowIndex: number
}

export function EntryRow({ entry, rowIndex }: Props) {
  const { boardId, onUpdateEntry, onDeleteEntry } = useBoardContext()
  const amount = parseFloat(entry.amount)

  return (
    <div
      className="group flex min-h-[28px] items-center gap-1 px-2 py-0.5 text-sm hover:bg-gray-50"
      style={{ backgroundColor: entry.color ? `${entry.color}28` : undefined }}
    >
      <div className="flex-shrink-0">
        <ColorPicker
          value={entry.color}
          onChange={color => onUpdateEntry(entry.id, 'color', color)}
        />
      </div>

      <div className="w-[90px] flex-shrink-0 overflow-hidden">
        <CategoryAutocomplete
          boardId={boardId}
          value={entry.categoryName}
          onChange={v => onUpdateEntry(entry.id, 'categoryName', v)}
          data-row={rowIndex}
          data-col={0}
        />
        {entry.loanId && (
          <span className="ml-1 text-xs text-blue-400">⬡</span>
        )}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <InlineCell
          value={entry.note ?? ''}
          onCommit={v => onUpdateEntry(entry.id, 'note', v || null)}
          placeholder="—"
          data-row={rowIndex}
          data-col={1}
          className="w-full text-gray-500"
        />
      </div>

      <div className="w-20 flex-shrink-0">
        <InlineCell
          value={entry.amount}
          displayValue={formatCurrency(amount)}
          onCommit={v => onUpdateEntry(entry.id, 'amount', v)}
          inputType="number"
          className="w-full text-right font-medium"
          data-row={rowIndex}
          data-col={2}
        />
      </div>

      <button
        onClick={() => onDeleteEntry(entry.id)}
        className="ml-0.5 flex-shrink-0 text-gray-300 opacity-0 hover:text-red-400 group-hover:opacity-100"
        aria-label="Delete row"
      >
        ×
      </button>
    </div>
  )
}
