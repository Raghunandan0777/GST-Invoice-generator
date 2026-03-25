import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div
          className="font-syne font-black mb-2 leading-none"
          style={{ fontSize: 120, color: '#f5a623', opacity: 0.15 }}
        >
          404
        </div>
        <div className="text-6xl mb-6 -mt-8">🧾</div>
        <h1 className="font-syne font-black text-3xl mb-3">Page not found</h1>
        <p className="text-zinc-500 mb-2">यह पेज मौजूद नहीं है।</p>
        <p className="text-zinc-600 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-amber-400 text-black font-syne font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="border border-zinc-700 text-zinc-400 font-syne font-bold px-6 py-3 rounded-xl hover:border-zinc-500 hover:text-white transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
