interface Props {
  subject: string
  gradeLabel: string
  limit: number
  currentCount: number
  onClose: () => void
}

export default function LimitBlockModal({ subject, gradeLabel, limit, currentCount, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-50 px-5 py-4 border-b border-amber-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">Límite de horas alcanzado</h2>
            <p className="text-xs text-amber-600 mt-0.5">
              Sección {gradeLabel}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Subject pill */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">{subject}</span>
          </div>

          {/* Limit info */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
            <div className="flex-1 min-w-0">
              {limit === 0 ? (
                <p className="text-xs text-amber-800 font-medium">
                  Esta sección no recibe <span className="font-bold">{subject}</span>.
                </p>
              ) : (
                <p className="text-xs text-amber-800">
                  Límite configurado: <span className="font-bold">{limit} hora{limit !== 1 ? 's' : ''}/semana</span>
                </p>
              )}
              {limit > 0 && (
                <p className="text-xs text-amber-600 mt-0.5">
                  Horas asignadas actualmente: <span className="font-bold">{currentCount}</span>
                </p>
              )}
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-amber-700 leading-none">{currentCount}</span>
              <span className="text-[9px] text-amber-500 leading-none">/{limit === 0 ? '0' : limit}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            {limit === 0
              ? 'Ajusta el límite en Gestionar → Límites si necesitas permitir esta materia.'
              : 'Reduce las horas asignadas o ajusta el límite en Gestionar → Límites.'}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
