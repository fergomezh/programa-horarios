import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(friendlyError(error.message))
    setLoading(false)
  }

  function friendlyError(message: string): string {
    const m = message.toLowerCase()
    if (m.includes('invalid login credentials') || m.includes('invalid_credentials') || m.includes('user not found')) {
      return 'Correo no registrado o contraseña incorrecta. Si no tienes una cuenta, comunícate con el administrador.'
    }
    if (m.includes('email not confirmed')) {
      return 'El correo aún no ha sido confirmado. Contacta al administrador.'
    }
    if (m.includes('too many requests') || m.includes('rate limit')) {
      return 'Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.'
    }
    return message
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0c1424' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Colegio Lamatepec</h1>
          <p className="text-sm text-slate-400 mt-1">Sistema de Horarios</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: '#111827', border: '1px solid #1e2d42' }}
        >
          <h2 className="text-base font-semibold text-white mb-2">Iniciar sesión</h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@lamatepec.edu.sv"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: '#0c1424', border: '1px solid #1e2d42' }}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: '#0c1424', border: '1px solid #1e2d42' }}
            />
          </div>

          {error && (
            <div className="flex gap-2.5 text-xs text-rose-400 bg-rose-950/50 border border-rose-900 rounded-lg px-3 py-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
