import { useState } from 'react'
import { useScheduleStore } from '../../store/useScheduleStore'

interface Props {
  onClose: () => void
}

export default function AddTeacherModal({ onClose }: Props) {
  const addTeacher = useScheduleStore((s) => s.addTeacher)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !subject.trim()) return
    addTeacher(name.trim(), subject.trim())
    onClose()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl p-6 w-80"
        style={{ background: '#0f1e35', border: '1px solid #1e3a5f' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-white mb-4">Agregar Profesor</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Nombre completo</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María López"
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: '#162844', border: '1px solid #1e3a5f' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Materia</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Matemáticas"
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: '#162844', border: '1px solid #1e3a5f' }}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm rounded-lg text-slate-300 hover:text-white transition-colors"
              style={{ background: '#162844', border: '1px solid #1e3a5f' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !subject.trim()}
              className="flex-1 px-3 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
