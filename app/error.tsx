'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="font-syne font-black text-3xl mb-3">Something went wrong</h1>
        <p className="text-zinc-500 mb-2">कुछ गलत हो गया। कृपया पुनः प्रयास करें।</p>
        {error.message && (
          <p className="text-xs font-mono text-zinc-700 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 mb-6 text-left">
            {error.message}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-amber-400 text-black font-syne font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="border border-zinc-700 text-zinc-400 font-syne font-bold px-6 py-3 rounded-xl hover:border-zinc-500 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
