import { useEffect, useState } from 'react'

interface Props {
  name: string
  role: 'admin' | 'teacher'
}

export default function WelcomeToast({ name, role }: Props) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 4000)
    const hideTimer = setTimeout(() => setVisible(false), 4600)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border max-w-xs transition-all duration-500 ${
        fading ? 'opacity-0 translate-y-[-6px]' : 'opacity-100 translate-y-0'
      }`}
      style={{ background: '#112040', borderColor: '#1A2E4A' }}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-crimson-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">
          ¡Bienvenido/a!
        </p>
        <p className="text-xs text-slate-400 truncate mt-0.5">{name}</p>
        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          role === 'admin'
            ? 'bg-crimson-800/60 text-crimson-200 border border-crimson-700'
            : 'bg-emerald-900/60 text-emerald-300 border border-emerald-800'
        }`}>
          {role === 'admin' ? 'Administrador' : 'Profesor'}
        </span>
      </div>

      {/* Close */}
      <button
        onClick={() => setVisible(false)}
        className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 mt-0.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
