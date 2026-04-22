'use client'

import { useState } from 'react'

interface Props {
  boardId: string
  onInvited?: () => void
}

export function InviteMemberForm({ boardId, onInvited }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setMessage(null)

    const res = await fetch(`/api/boards/${boardId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })

    const data = await res.json()
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error ?? 'Failed to invite member' })
    } else {
      setMessage({ type: 'success', text: `${data.email} added to board` })
      setEmail('')
      onInvited?.()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email address…"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Inviting…' : 'Invite'}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
    </form>
  )
}
