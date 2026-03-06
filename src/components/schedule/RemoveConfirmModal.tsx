import { useEffect } from 'react'
import type { Teacher } from '../../types'

interface Props {
  teacher: Teacher
  subject: string
  slotLabel: string
  dayLabel: string
  gradeLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export default function RemoveConfirmModal({
  teacher,
  subject,
  slotLabel,
  dayLabel,
  gradeLabel,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onConfirm, onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onMouseDown={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${teacher.color}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{teacher.name}</p>
            <p className="text-xs text-slate-500 truncate">{subject}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-slate-700 mb-1">
            ¿Eliminar esta asignación del horario?
          </p>
          <p className="text-xs text-slate-400">
            {gradeLabel} · {dayLabel} · {slotLabel}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            autoFocus
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
