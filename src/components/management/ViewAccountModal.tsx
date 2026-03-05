import { useState, type FormEvent } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { Teacher } from '../../types'

interface Props {
  teacher: Teacher
  onClose: () => void
}

export default function ViewAccountModal({ teacher, onClose }: Props) {
  const [resetting, setResetting] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      setError('No hay sesión activa.')
      setLoading(false)
      return
    }

    const res = await supabase.functions.invoke('reset-teacher-password', {
      body: { teacherId: teacher.id, password },
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.error) {
      let message = res.error.message
      if (res.error instanceof FunctionsHttpError) {
        try {
          const body = await res.error.context.json()
          message = body?.error ?? message
        } catch { /* keep generic message */ }
      }
      setError(message)
    } else {
      setSuccess(true)
      setPassword('')
    }
    setLoading(false)
  }

  function handleClose() {
    setResetting(false)
    setPassword('')
    setShowPassword(false)
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4" style={{ background: '#fff' }}>

        <div>
          <h3 className="text-base font-bold text-slate-800">Cuenta de acceso</h3>
          <p className="text-sm text-slate-500 mt-0.5">Para <strong>{teacher.name}</strong></p>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Correo electrónico</label>
          <div className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 select-all">
            {teacher.email}
          </div>
        </div>

        {!resetting && !success && (
          <button
            onClick={() => setResetting(true)}
            className="w-full py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Restablecer contraseña
          </button>
        )}

        {resetting && !success && (
          <form onSubmit={handleReset} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setResetting(false); setPassword(''); setError(null) }}
                className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || password.length < 6}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        )}

        {success && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs text-emerald-700 font-medium">Contraseña restablecida correctamente</p>
          </div>
        )}

        <button
          onClick={handleClose}
          className="w-full py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          Cerrar
        </button>

      </div>
    </div>
  )
}
