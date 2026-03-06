import { useState } from 'react'
import { useScheduleStore } from '../../store/useScheduleStore'
import ConfirmDialog from './ConfirmDialog'
import CreateAccountModal from './CreateAccountModal'
import ViewAccountModal from './ViewAccountModal'
import type { Teacher } from '../../types'
import { getSubjectColor } from '../../constants/schedule'

export default function TeacherManager() {
  const teachers = useScheduleStore((s) => s.teachers)
  const updateTeacher = useScheduleStore((s) => s.updateTeacher)
  const removeTeacher = useScheduleStore((s) => s.removeTeacher)
  const addTeacher = useScheduleStore((s) => s.addTeacher)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSubjects, setEditSubjects] = useState<string[]>([])
  const [editSubjectInput, setEditSubjectInput] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [createAccountTeacher, setCreateAccountTeacher] = useState<Teacher | null>(null)
  const [viewAccountTeacher, setViewAccountTeacher] = useState<Teacher | null>(null)

  // "Add new" row state
  const [newName, setNewName] = useState('')
  const [newSubjects, setNewSubjects] = useState<string[]>([])
  const [newSubjectInput, setNewSubjectInput] = useState('')

  function startEdit(id: string, name: string, subjects: string[]) {
    setEditingId(id)
    setEditName(name)
    setEditSubjects([...subjects])
    setEditSubjectInput('')
  }

  function addEditSubject() {
    const trimmed = editSubjectInput.trim()
    if (!trimmed || editSubjects.includes(trimmed)) return
    setEditSubjects((prev) => [...prev, trimmed])
    setEditSubjectInput('')
  }

  function saveEdit() {
    if (!editingId || !editName.trim() || editSubjects.length === 0) return
    updateTeacher(editingId, editName.trim(), editSubjects)
    setEditingId(null)
  }

  function addNewSubject() {
    const trimmed = newSubjectInput.trim()
    if (!trimmed || newSubjects.includes(trimmed)) return
    setNewSubjects((prev) => [...prev, trimmed])
    setNewSubjectInput('')
  }

  function handleAddNew(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || newSubjects.length === 0) return
    addTeacher(newName.trim(), newSubjects)
    setNewName('')
    setNewSubjects([])
    setNewSubjectInput('')
  }

  const confirmTeacher = teachers.find((t) => t.id === confirmDeleteId)

  return (
    <div className="p-4 space-y-4">
      {/* Add new */}
      <form onSubmit={handleAddNew} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nuevo profesor</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Nombre</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del profesor"
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-600 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Materias
            {newSubjects.length > 0 && <span className="ml-1 text-crimson-600">({newSubjects.length})</span>}
          </label>
          {newSubjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {newSubjects.map((s) => (
                <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-crimson-100 text-crimson-700 border border-crimson-200">
                  {s}
                  <button type="button" onClick={() => setNewSubjects((p) => p.filter((x) => x !== s))} className="hover:text-blue-900">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={newSubjectInput}
              onChange={(e) => setNewSubjectInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewSubject() } }}
              placeholder="Agregar materia…"
              className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-600 bg-white"
            />
            <button type="button" onClick={addNewSubject} disabled={!newSubjectInput.trim()} className="px-2.5 py-1.5 text-xs font-medium bg-crimson-600 text-white rounded hover:bg-crimson-700 disabled:opacity-30">
              + Agregar
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={!newName.trim() || newSubjects.length === 0}
          className="px-3 py-1.5 bg-crimson-600 text-white text-sm rounded hover:bg-crimson-700 disabled:opacity-40"
        >
          Crear profesor
        </button>
      </form>

      {/* Table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-xs text-gray-500">
            <th className="border border-gray-200 px-3 py-2 w-8"></th>
            <th className="border border-gray-200 px-3 py-2">Nombre</th>
            <th className="border border-gray-200 px-3 py-2">Materias</th>
            <th className="border border-gray-200 px-3 py-2 w-24">Cuenta</th>
            <th className="border border-gray-200 px-3 py-2 w-24">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-gray-400 py-6 text-xs">
                Sin profesores registrados
              </td>
            </tr>
          )}
          {teachers.map((t) => (
            <tr key={t.id} className="hover:bg-crimson-50/30 transition-colors align-top">
              <td className="border border-gray-200 px-3 py-2.5">
                <span className={`inline-block w-3.5 h-3.5 rounded-full mt-0.5 ${t.subjects[0] ? getSubjectColor(t.subjects[0]) : t.color}`} />
              </td>
              <td className="border border-gray-200 px-3 py-2">
                {editingId === t.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border border-blue-400 rounded px-1 py-0.5 text-sm w-full focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:text-crimson-600"
                    onClick={() => startEdit(t.id, t.name, t.subjects)}
                  >
                    {t.name}
                  </span>
                )}
              </td>
              <td className="border border-gray-200 px-3 py-2">
                {editingId === t.id ? (
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {editSubjects.map((s) => (
                        <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-crimson-100 text-crimson-700 border border-crimson-200">
                          {s}
                          <button type="button" onClick={() => setEditSubjects((p) => p.filter((x) => x !== s))} className="hover:text-blue-900">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <input
                        value={editSubjectInput}
                        onChange={(e) => setEditSubjectInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEditSubject() } }}
                        placeholder="Nueva materia…"
                        className="flex-1 border border-blue-400 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                      />
                      <button type="button" onClick={addEditSubject} disabled={!editSubjectInput.trim()} className="px-2 text-xs bg-crimson-600 text-white rounded disabled:opacity-30">+</button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-wrap gap-1 cursor-pointer"
                    onClick={() => startEdit(t.id, t.name, t.subjects)}
                  >
                    {t.subjects.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                {t.email ? (
                  <button
                    onClick={() => setViewAccountTeacher(t)}
                    className="text-xs text-emerald-700 font-medium px-2 py-0.5 rounded-md hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    Ver cuenta
                  </button>
                ) : (
                  <button
                    onClick={() => setCreateAccountTeacher(t)}
                    className="text-xs text-crimson-600 font-medium px-2 py-0.5 rounded-md hover:bg-crimson-50 hover:text-crimson-700 transition-colors"
                  >
                    Crear cuenta
                  </button>
                )}
              </td>
              <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                {editingId === t.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={saveEdit} disabled={editSubjects.length === 0} className="text-xs text-crimson-600 font-medium px-2 py-0.5 rounded-md hover:bg-crimson-50 transition-colors disabled:opacity-40">
                      Guardar
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 px-2 py-0.5 rounded-md hover:bg-slate-100 hover:text-slate-600 transition-colors">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(t.id)} className="text-xs text-red-500 font-medium px-2 py-0.5 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors">
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmTeacher && (
        <ConfirmDialog
          title={`Eliminar a ${confirmTeacher.name}`}
          message="Se eliminarán todas las asignaciones de este profesor en el horario. ¿Continuar?"
          onConfirm={() => {
            removeTeacher(confirmTeacher.id)
            setConfirmDeleteId(null)
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {createAccountTeacher && (
        <CreateAccountModal
          teacher={createAccountTeacher}
          onClose={() => setCreateAccountTeacher(null)}
        />
      )}

      {viewAccountTeacher && (
        <ViewAccountModal
          teacher={viewAccountTeacher}
          onClose={() => setViewAccountTeacher(null)}
        />
      )}
    </div>
  )
}
