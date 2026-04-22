'use client'

import { formatCurrency } from '@/shared/lib/formatCurrency'
import { InlineCell } from '@/features/entry-editing/ui/InlineCell'
import { CategoryAutocomplete } from '@/features/entry-editing/ui/CategoryAutocomplete'
import { ColorPicker } from '@/features/entry-editing/ui/ColorPicker'
import type { SerializedEntry } from '@/shared/lib/serializeDecimal'

interface Props {
  entry: SerializedEntry
  rowIndex: number
  boardId?: string
  onUpdate?: (entryId: string, field: string, value: string | null) => void
  onDelete?: (entryId: string) => void
}

export function EntryRow({ entry, rowIndex, boardId, onUpdate, onDelete }: Props) {
  const amount = parseFloat(entry.amount)
  const editable = !!onUpdate && !!boardId

  return (
    <div
      className="group flex min-h-[28px] items-center gap-1 px-2 py-0.5 text-sm hover:bg-gray-50"
      style={{ backgroundColor: entry.color ? `${entry.color}28` : undefined }}
    >
      {/* Color picker */}
      {editable ? (
        <div className="flex-shrink-0">
          <ColorPicker
            value={entry.color}
            onChange={color => onUpdate!(entry.id, 'color', color)}
          />
        </div>
      ) : (
        <div
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: entry.color ?? '#e5e7eb' }}
        />
      )}

      {/* Category */}
      <div className="w-[90px] flex-shrink-0 overflow-hidden">
        {editable ? (
          <CategoryAutocomplete
            boardId={boardId!}
            value={entry.categoryName}
            onChange={v => onUpdate!(entry.id, 'categoryName', v)}
            data-row={rowIndex}
            data-col={0}
          />
        ) : (
          <span className="block truncate text-gray-900" title={entry.categoryName}>
            {entry.categoryName}
            {entry.loanId && <span className="ml-1 text-xs text-blue-400">⬡</span>}
          </span>
        )}
      </div>

      {/* Note */}
      <div className="min-w-0 flex-1 overflow-hidden">
        {editable ? (
          <InlineCell
            value={entry.note ?? ''}
            onCommit={v => onUpdate!(entry.id, 'note', v || null)}
            placeholder="—"
            data-row={rowIndex}
            data-col={1}
            className="w-full text-gray-500"
          />
        ) : (
          <span className="block truncate text-gray-400" title={entry.note ?? ''}>
            {entry.note}
          </span>
        )}
      </div>

      {/* Amount */}
      <div className="w-20 flex-shrink-0">
        {editable ? (
          <InlineCell
            value={entry.amount}
            displayValue={formatCurrency(amount)}
            onCommit={v => onUpdate!(entry.id, 'amount', v)}
            inputType="number"
            className="w-full text-right font-medium"
            data-row={rowIndex}
            data-col={2}
          />
        ) : (
          <span className="block text-right font-medium text-gray-900">
            {formatCurrency(amount)}
          </span>
        )}
      </div>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(entry.id)}
          className="ml-0.5 flex-shrink-0 text-gray-300 opacity-0 hover:text-red-400 group-hover:opacity-100"
          aria-label="Delete row"
        >
          ×
        </button>
      )}
    </div>
  )
}
