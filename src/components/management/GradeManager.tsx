import { useState } from 'react'
import { useScheduleStore } from '../../store/useScheduleStore'
import ConfirmDialog from './ConfirmDialog'

export default function GradeManager() {
  const grades = useScheduleStore((s) => s.grades)
  const updateGrade = useScheduleStore((s) => s.updateGrade)
  const removeGrade = useScheduleStore((s) => s.removeGrade)
  const addGrade = useScheduleStore((s) => s.addGrade)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSection, setEditSection] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newSection, setNewSection] = useState('')

  function startEdit(id: string, name: string, section: string) {
    setEditingId(id)
    setEditName(name)
    setEditSection(section)
  }

  function saveEdit() {
    if (!editingId || !editName.trim() || !editSection.trim()) return
    updateGrade(editingId, editName.trim(), editSection.trim())
    setEditingId(null)
  }

  function handleAddNew(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newSection.trim()) return
    addGrade(newName.trim(), newSection.trim())
    setNewName('')
    setNewSection('')
  }

  const confirmGrade = grades.find((g) => g.id === confirmDeleteId)

  return (
    <div className="p-4 space-y-4">
      {/* Add new */}
      <form onSubmit={handleAddNew} className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Grado (ej: 1°)</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="1°"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-600"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Sección (ej: A)</label>
          <input
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="A"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-600"
          />
        </div>
        <button
          type="submit"
          disabled={!newName.trim() || !newSection.trim()}
          className="px-3 py-1.5 bg-crimson-600 text-white text-sm rounded hover:bg-crimson-700 disabled:opacity-40"
        >
          Agregar
        </button>
      </form>

      {/* Table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-xs text-gray-500">
            <th className="border border-gray-200 px-3 py-2">Etiqueta</th>
            <th className="border border-gray-200 px-3 py-2">Grado</th>
            <th className="border border-gray-200 px-3 py-2">Sección</th>
            <th className="border border-gray-200 px-3 py-2 w-24">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {grades.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-gray-400 py-6 text-xs">
                Sin grados registrados
              </td>
            </tr>
          )}
          {grades.map((g) => (
            <tr key={g.id} className="hover:bg-crimson-50/30 transition-colors">
              <td className="border border-gray-200 px-3 py-2 font-medium">{g.label}</td>
              <td className="border border-gray-200 px-3 py-2">
                {editingId === g.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border border-blue-400 rounded px-1 py-0.5 text-sm w-full focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                ) : (
                  <span className="cursor-pointer hover:text-crimson-600" onClick={() => startEdit(g.id, g.name, g.section)}>
                    {g.name}
                  </span>
                )}
              </td>
              <td className="border border-gray-200 px-3 py-2">
                {editingId === g.id ? (
                  <input
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="border border-blue-400 rounded px-1 py-0.5 text-sm w-full focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                ) : (
                  <span className="cursor-pointer hover:text-crimson-600" onClick={() => startEdit(g.id, g.name, g.section)}>
                    {g.section}
                  </span>
                )}
              </td>
              <td className="border border-gray-200 px-3 py-2">
                <div className="flex items-center gap-1">
                  {editingId === g.id ? (
                    <button onClick={saveEdit} className="text-xs text-crimson-600 font-medium px-2 py-0.5 rounded-md hover:bg-crimson-50 transition-colors">
                      Guardar
                    </button>
                  ) : null}
                  <button
                    onClick={() => setConfirmDeleteId(g.id)}
                    className="text-xs text-red-500 font-medium px-2 py-0.5 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmGrade && (
        <ConfirmDialog
          title={`Eliminar grado ${confirmGrade.label}`}
          message="Se eliminarán todas las asignaciones de este grado en el horario. ¿Continuar?"
          onConfirm={() => {
            removeGrade(confirmGrade.id)
            setConfirmDeleteId(null)
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
