'use client'
import { useState, useEffect } from 'react'

interface GSTINInputProps {
  value: string
  onChange: (val: string) => void
  label?: string
  placeholder?: string
  required?: boolean
}

// GSTIN format: 2 digit state + 5 char PAN + 4 digit + 1 alpha + 1 + Z + 1
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

function validateGSTIN(gstin: string): { valid: boolean; message: string; stateCode?: string } {
  if (!gstin) return { valid: false, message: '' }
  const upper = gstin.toUpperCase().trim()
  if (upper.length < 15) return { valid: false, message: `${upper.length}/15 characters` }
  if (!GSTIN_REGEX.test(upper)) return { valid: false, message: 'Invalid GSTIN format' }

  const STATE_CODES: Record<string, string> = {
    '01': 'J&K', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
    '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
    '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
    '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
    '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
    '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '27': 'Maharashtra', '28': 'Andhra Pradesh', '29': 'Karnataka', '30': 'Goa',
    '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
    '35': 'Andaman & Nicobar', '36': 'Telangana', '37': 'Andhra Pradesh (new)',
  }
  const code = upper.slice(0, 2)
  const state = STATE_CODES[code]
  return { valid: true, message: `✓ Valid GSTIN${state ? ` · ${state}` : ''}`, stateCode: code }
}

export default function GSTINInput({ value, onChange, label = 'GSTIN', placeholder = '27AAPFU0939F1ZV', required }: GSTINInputProps) {
  const [focused, setFocused] = useState(false)
  const result = value ? validateGSTIN(value.toUpperCase()) : null

  return (
    <div>
      <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-amber-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          maxLength={15}
          className={`w-full bg-zinc-800 border rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest focus:outline-none transition-colors placeholder:text-zinc-600 placeholder:tracking-normal ${
            focused
              ? 'border-amber-400'
              : result?.valid
              ? 'border-green-500/50'
              : value && !result?.valid
              ? 'border-red-500/40'
              : 'border-zinc-700'
          }`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {result?.valid
              ? <span className="text-green-400 text-sm">✓</span>
              : value.length === 15
              ? <span className="text-red-400 text-sm">✕</span>
              : <span className="text-zinc-600 text-xs font-mono">{value.length}/15</span>
            }
          </div>
        )}
      </div>
      {value && result?.message && (
        <p className={`text-xs mt-1.5 font-mono transition-all ${result.valid ? 'text-green-500/80' : 'text-red-400/80'}`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
