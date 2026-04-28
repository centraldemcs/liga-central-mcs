'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginBatalha() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/batalha/dashboard')
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-zinc-500 hover:text-white text-sm mb-8 block transition-colors">
          ← voltar
        </Link>

        <h1 className="text-2xl font-bold mb-1">Entrar como Batalha</h1>
        <p className="text-zinc-400 text-sm mb-8">Acesse o painel da sua batalha</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contato@suabatalha.com"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-zinc-500 text-sm mt-6 text-center">
          Ainda não tem conta?{' '}
          <Link href="/batalha/cadastro" className="text-blue-400 hover:text-blue-300 transition-colors">
            Cadastrar batalha
          </Link>
        </p>
      </div>
    </main>
  )
}
