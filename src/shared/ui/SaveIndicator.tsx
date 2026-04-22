'use client'

import { useEffect, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  status: SaveStatus
}

export function SaveIndicator({ status }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status !== 'idle') {
      setVisible(true)
    }
    if (status === 'saved') {
      const t = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(t)
    }
  }, [status])

  if (!visible) return null

  if (status === 'saving') {
    return <span className="text-xs text-gray-400">saving…</span>
  }
  if (status === 'saved') {
    return <span className="text-xs text-green-500">✓</span>
  }
  if (status === 'error') {
    return <span className="text-xs text-red-500">!</span>
  }
  return null
}
