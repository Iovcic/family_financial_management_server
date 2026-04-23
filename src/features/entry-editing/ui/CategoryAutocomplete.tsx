'use client'

import { useState, useRef, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface CategoryOption {
  name: string
  color: string | null
}

interface Props {
  boardId: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'data-row'?: number
  'data-col'?: number
}

export function CategoryAutocomplete({
  boardId,
  value,
  onChange,
  placeholder = 'Category…',
  'data-row': dataRow,
  'data-col': dataCol,
}: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Sync draft from prop when not actively editing (no effect needed)
  if (prevValue !== value && !open) {
    setPrevValue(value)
    setDraft(value)
  }

  const { data } = useSWR<{ categories: CategoryOption[] }>(
    `/api/boards/${boardId}/categories`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const options = (data?.categories ?? []).filter(c =>
    c.name.toLowerCase().includes(draft.toLowerCase()),
  )

  function commit(val: string) {
    setOpen(false)
    onChange(val)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Escape') {
      setDraft(value)
      setOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const first = listRef.current?.querySelector<HTMLElement>('li')
      first?.focus()
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={e => {
          setDraft(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={e => {
          if (!listRef.current?.contains(e.relatedTarget as Node)) {
            commit(draft)
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded border border-blue-400 bg-white px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-blue-400"
        data-row={dataRow}
        data-col={dataCol}
      />

      {open && options.length > 0 && (
        <ul
          ref={listRef}
          className="absolute left-0 top-full z-50 mt-0.5 w-full rounded border border-gray-200 bg-white shadow-lg"
        >
          {options.slice(0, 8).map(opt => (
            <li
              key={opt.name}
              tabIndex={-1}
              onMouseDown={() => commit(opt.name)}
              onKeyDown={e => {
                if (e.key === 'Enter') commit(opt.name)
                if (e.key === 'Escape') {
                  setOpen(false)
                  inputRef.current?.focus()
                }
              }}
              className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
            >
              {opt.color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
