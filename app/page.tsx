import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          Liga Central de MCs
        </h1>
        <p className="text-zinc-400 text-lg">
          O ranking oficial das batalhas de rima do Brasil
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/mc/login"
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 px-6 rounded-lg text-center transition-colors"
        >
          Login MC
        </Link>
        <Link
          href="/batalha/login"
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
        >
          Login Organizador de Batalha
        </Link>
      </div>

      <Link
        href="/ranking"
        className="mt-8 text-zinc-500 hover:text-white text-sm transition-colors underline underline-offset-4"
      >
        Ver ranking público →
      </Link>
    </main>
  )
}