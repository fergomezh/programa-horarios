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
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0D1B35' }}
    >
      {/* Subtle background texture — crimson radial glow top-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 15% 0%, rgba(185,28,58,0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 35% at 85% 100%, rgba(200,146,26,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Institutional header */}
        <div className="flex flex-col items-center mb-8">
          {/* Crest icon — crimson shield */}
          <div
            className="w-16 h-16 flex items-center justify-center mb-5 shadow-xl"
            style={{
              background: 'linear-gradient(145deg, #C41F40, #8B1230)',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(185,28,58,0.4), 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {/* Graduation cap icon */}
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>

          {/* Thin crimson rule */}
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-10 bg-crimson-700/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-crimson-500 uppercase">APCE</span>
            <span className="h-px w-10 bg-crimson-700/60" />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Colegio Lamatepec</h1>
          <p className="text-sm text-navy-500 mt-1.5" style={{ color: '#6B84A8' }}>Sistema de Gestión de Horarios</p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: '#112040',
            border: '1px solid #1A2E4A',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          <h2 className="text-sm font-semibold text-slate-300 mb-1">Iniciar sesión</h2>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@lamatepec.edu.sv"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-crimson-600"
              style={{ background: '#0D1B35', border: '1px solid #1A2E4A' }}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-crimson-600"
              style={{ background: '#0D1B35', border: '1px solid #1A2E4A' }}
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
            className="w-full py-2.5 rounded-lg text-white text-sm font-bold transition-all disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #C41F40, #991230)',
              boxShadow: '0 4px 14px rgba(185,28,58,0.4)',
            }}
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[11px] mt-5" style={{ color: '#374F6B' }}>
          © Colegio Lamatepec · APCE El Salvador
        </p>
      </div>
    </div>
  )
}
