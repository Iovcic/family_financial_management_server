'use client'

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { SaveStatus } from '@/shared/ui/SaveIndicator'

interface Options {
  entryId: string
  field: string
  initialValue: string
}

export function useAutoSave({ entryId, field, initialValue }: Options) {
  const [value, setValue] = useState(initialValue)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const savedRef = useRef(initialValue)
  const debouncedValue = useDebounce(value, 500)

  useEffect(() => {
    if (debouncedValue === savedRef.current) return

    setStatus('saving')
    fetch(`/api/entries/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: debouncedValue }),
    })
      .then(r => {
        if (r.ok) {
          savedRef.current = debouncedValue
          setStatus('saved')
          setTimeout(() => setStatus('idle'), 2000)
        } else {
          setValue(savedRef.current)
          setStatus('error')
        }
      })
      .catch(() => {
        setValue(savedRef.current)
        setStatus('error')
      })
  }, [debouncedValue, entryId, field])

  function saveNow(val: string) {
    if (val === savedRef.current) return
    setStatus('saving')
    fetch(`/api/entries/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: val }),
    })
      .then(r => {
        if (r.ok) {
          savedRef.current = val
          setStatus('saved')
          setTimeout(() => setStatus('idle'), 2000)
        } else {
          setValue(savedRef.current)
          setStatus('error')
        }
      })
      .catch(() => {
        setValue(savedRef.current)
        setStatus('error')
      })
  }

  return { value, setValue, status, saveNow }
}
