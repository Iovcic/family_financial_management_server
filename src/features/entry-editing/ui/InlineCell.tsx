'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string
  onCommit: (value: string) => void
  displayValue?: string
  placeholder?: string
  inputType?: 'text' | 'number'
  className?: string
  'data-row'?: number
  'data-col'?: number
}

export function InlineCell({
  value,
  onCommit,
  displayValue,
  placeholder = '—',
  inputType = 'text',
  className = '',
  'data-row': dataRow,
  'data-col': dataCol,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(value)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing, value])

  function commit() {
    setEditing(false)
    if (draft !== value) {
      onCommit(draft)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      commit()
      // Let parent handleKeyDown manage focus
      const parent = inputRef.current?.closest('[data-row]')?.parentElement
      if (parent) {
        const nextCol = parent.querySelector<HTMLElement>(
          `[data-row="${dataRow}"][data-col="${(dataCol ?? 0) + 1}"]`,
        )
        if (nextCol) nextCol.focus()
      }
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={inputType}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full rounded border border-blue-400 bg-white px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-blue-400 ${className}`}
        data-row={dataRow}
        data-col={dataCol}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`block cursor-text rounded px-1 py-0.5 text-sm hover:bg-blue-50 ${
        !value ? 'text-gray-300' : ''
      } ${className}`}
      data-row={dataRow}
      data-col={dataCol}
      tabIndex={0}
      onFocus={() => setEditing(true)}
    >
      {(displayValue ?? value) || placeholder}
    </span>
  )
}
