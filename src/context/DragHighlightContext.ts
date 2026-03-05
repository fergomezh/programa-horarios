import { createContext, useContext } from 'react'

interface DragHighlightContextValue {
  /** ID del profesor que se está arrastrando, o null si no hay drag activo */
  draggingTeacherId: string | null
  /**
   * Claves `${slotId}::${day}` donde el profesor ya tiene asignación
   * (en cualquier grado) y no podrá ser colocado sin conflicto.
   */
  busySlotKeys: Set<string>
}

export const DragHighlightContext = createContext<DragHighlightContextValue>({
  draggingTeacherId: null,
  busySlotKeys: new Set(),
})

export const useDragHighlight = () => useContext(DragHighlightContext)
