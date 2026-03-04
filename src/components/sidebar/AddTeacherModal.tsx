import { useState } from 'react'
import { useScheduleStore } from '../../store/useScheduleStore'

interface Props {
  onClose: () => void
}

export default function AddTeacherModal({ onClose }: Props) {
  const addTeacher = useScheduleStore((s) => s.addTeacher)
  const [name, setName] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState('')

  function addSubject() {
    const trimmed = subjectInput.trim()
    if (!trimmed || subjects.includes(trimmed)) return
    setSubjects((prev) => [...prev, trimmed])
    setSubjectInput('')
  }

  function removeSubject(s: string) {
    setSubjects((prev) => prev.filter((x) => x !== s))
  }

  function handleSubjectKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSubject()
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || subjects.length === 0) return
    addTeacher(name.trim(), subjects)
    onClose()
  }

  const canSubmit = name.trim().length > 0 && subjects.length > 0

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4"
        style={{ background: '#0f1e35', border: '1px solid #1e3a5f' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-white mb-4">Agregar Profesor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
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

          {/* Subjects */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Materias
              {subjects.length > 0 && (
                <span className="ml-1.5 text-slate-500">({subjects.length})</span>
              )}
            </label>

            {/* Subject tags */}
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {subjects.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ background: '#1d3461', border: '1px solid #2d4f8f' }}
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSubject(s)}
                      className="text-slate-400 hover:text-white transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Subject input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={handleSubjectKeyDown}
                placeholder="Ej: Matemáticas"
                className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ background: '#162844', border: '1px solid #1e3a5f' }}
              />
              <button
                type="button"
                onClick={addSubject}
                disabled={!subjectInput.trim()}
                className="px-3 py-2 text-xs font-semibold rounded-lg text-white bg-blue-700 hover:bg-blue-600 disabled:opacity-30 transition-colors"
              >
                + Agregar
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1">Presiona Enter o el botón para agregar cada materia.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
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
              disabled={!canSubmit}
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
