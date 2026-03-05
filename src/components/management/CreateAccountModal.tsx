import { useState, type FormEvent } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { Teacher } from '../../types'

interface Props {
  teacher: Teacher
  onClose: () => void
}

export default function CreateAccountModal({ teacher, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
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

    const res = await supabase.functions.invoke('create-teacher-account', {
      body: { email, password, teacherId: teacher.id },
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.error) {
      let message = res.error.message
      if (res.error instanceof FunctionsHttpError) {
        try {
          const body = await res.error.context.json()
          message = body?.error ?? message
        } catch {
          const text = await res.error.context.text?.()
          console.log('[CreateAccount] error text:', text)
        }
      }
      setError(message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4" style={{ background: '#fff' }}>
        {success ? (
          <>
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800">Cuenta creada</h3>
              <p className="text-sm text-slate-500 mt-1">
                <strong>{teacher.name}</strong> puede iniciar sesión con <strong>{email}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Listo
            </button>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-base font-bold text-slate-800">Crear cuenta de acceso</h3>
              <p className="text-sm text-slate-500 mt-0.5">Para <strong>{teacher.name}</strong></p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@lamatepec.edu.sv"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Contraseña temporal</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creando…' : 'Crear cuenta'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
