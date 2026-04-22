'use client'

import { useCallback } from 'react'

export function useKeyboardNav() {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    const rowStr = target.getAttribute('data-row')
    const colStr = target.getAttribute('data-col')
    if (rowStr === null || colStr === null) return

    const row = parseInt(rowStr)
    const col = parseInt(colStr)

    if (e.key === 'Enter') {
      e.preventDefault()
      const next = document.querySelector<HTMLElement>(
        `[data-row="${row + 1}"][data-col="${col}"]`,
      )
      next?.focus()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const nextCol = document.querySelector<HTMLElement>(
        `[data-row="${row}"][data-col="${col + 1}"]`,
      )
      if (nextCol) {
        nextCol.focus()
      } else {
        const nextRow = document.querySelector<HTMLElement>(
          `[data-row="${row + 1}"][data-col="0"]`,
        )
        nextRow?.focus()
      }
    }
    // Escape is handled per-cell in InlineCell
  }, [])

  return { handleKeyDown }
}
