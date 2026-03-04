import { useState } from 'react'
import { useScheduleStore } from '../../store/useScheduleStore'
import ConfirmDialog from './ConfirmDialog'

export default function TeacherManager() {
  const teachers = useScheduleStore((s) => s.teachers)
  const updateTeacher = useScheduleStore((s) => s.updateTeacher)
  const removeTeacher = useScheduleStore((s) => s.removeTeacher)
  const addTeacher = useScheduleStore((s) => s.addTeacher)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newSubject, setNewSubject] = useState('')

  function startEdit(id: string, name: string, subject: string) {
    setEditingId(id)
    setEditName(name)
    setEditSubject(subject)
  }

  function saveEdit() {
    if (!editingId || !editName.trim() || !editSubject.trim()) return
    updateTeacher(editingId, editName.trim(), editSubject.trim())
    setEditingId(null)
  }

  function handleAddNew(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newSubject.trim()) return
    addTeacher(newName.trim(), newSubject.trim())
    setNewName('')
    setNewSubject('')
  }

  const confirmTeacher = teachers.find((t) => t.id === confirmDeleteId)

  return (
    <div className="p-4 space-y-4">
      {/* Add new */}
      <form onSubmit={handleAddNew} className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Nombre</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del profesor"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Materia</label>
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Materia"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={!newName.trim() || !newSubject.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-40"
        >
          Agregar
        </button>
      </form>

      {/* Table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-xs text-gray-500">
            <th className="border border-gray-200 px-3 py-2">Color</th>
            <th className="border border-gray-200 px-3 py-2">Nombre</th>
            <th className="border border-gray-200 px-3 py-2">Materia</th>
            <th className="border border-gray-200 px-3 py-2 w-24">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-gray-400 py-6 text-xs">
                Sin profesores registrados
              </td>
            </tr>
          )}
          {teachers.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-3 py-2">
                <span className={`inline-block w-4 h-4 rounded-full ${t.color}`} />
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
                  <span className="cursor-pointer hover:text-blue-600" onClick={() => startEdit(t.id, t.name, t.subject)}>
                    {t.name}
                  </span>
                )}
              </td>
              <td className="border border-gray-200 px-3 py-2">
                {editingId === t.id ? (
                  <input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="border border-blue-400 rounded px-1 py-0.5 text-sm w-full focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                ) : (
                  <span className="cursor-pointer hover:text-blue-600" onClick={() => startEdit(t.id, t.name, t.subject)}>
                    {t.subject}
                  </span>
                )}
              </td>
              <td className="border border-gray-200 px-3 py-2">
                {editingId === t.id ? (
                  <button onClick={saveEdit} className="text-xs text-blue-600 hover:underline mr-2">
                    Guardar
                  </button>
                ) : null}
                <button
                  onClick={() => setConfirmDeleteId(t.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Eliminar
                </button>
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
    </div>
  )
}
