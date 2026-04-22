'use client'

import { useRef } from 'react'

const PRESET_COLORS = [
  '#86efac', // green-300
  '#fca5a5', // red-300
  '#93c5fd', // blue-300
  '#fcd34d', // yellow-300
  '#c4b5fd', // violet-300
  '#f9a8d4', // pink-300
  '#6ee7b7', // emerald-300
  '#fdba74', // orange-300
]

interface Props {
  value: string | null
  onChange: (color: string | null) => void
}

export function ColorPicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-1">
      {/* Current color swatch / click to open native picker */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="h-4 w-4 flex-shrink-0 rounded-full border border-gray-200"
        style={{ backgroundColor: value ?? '#e5e7eb' }}
        title="Pick color"
      />

      {/* Preset colors */}
      <div className="flex gap-0.5">
        {PRESET_COLORS.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-3 w-3 rounded-full border ${
              value === color ? 'border-gray-600 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="h-3 w-3 rounded-full border border-gray-200 bg-white text-gray-400 text-[8px] leading-none"
            title="Clear color"
          >
            ×
          </button>
        )}
      </div>

      {/* Hidden native color input */}
      <input
        ref={inputRef}
        type="color"
        value={value ?? '#ffffff'}
        onChange={e => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  )
}
