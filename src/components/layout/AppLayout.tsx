import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useScheduleStore } from '../../store/useScheduleStore'
import type { DraggableTeacherData, DroppableCellData } from '../../types'
import TeacherPanel from '../sidebar/TeacherPanel'
import MainContent from './MainContent'
import TeacherChip from '../schedule/TeacherChip'

export default function AppLayout() {
  const teachers = useScheduleStore((s) => s.teachers)
  const assignTeacher = useScheduleStore((s) => s.assignTeacher)
  const moveAssignment = useScheduleStore((s) => s.moveAssignment)

  const [draggingData, setDraggingData] = useState<DraggableTeacherData | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const teacherMap = new Map(teachers.map((t) => [t.id, t]))
  const draggingTeacher = draggingData ? (teacherMap.get(draggingData.teacherId) ?? null) : null

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DraggableTeacherData | undefined
    if (data?.type === 'teacher') setDraggingData(data)
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingData(null)
    const { active, over } = event
    if (!over) return

    const dragData = active.data.current as DraggableTeacherData
    const dropData = over.data.current as DroppableCellData

    if (!dragData || dragData.type !== 'teacher') return
    if (!dropData || dropData.type !== 'cell') return

    const { teacherId, sourceGradeId, sourceSlotId, sourceDay } = dragData
    const { gradeId: targetGradeId, slotId: targetSlotId, day: targetDay } = dropData

    if (sourceGradeId === null) {
      assignTeacher(targetGradeId, targetSlotId, targetDay, teacherId)
    } else {
      if (
        sourceGradeId === targetGradeId &&
        sourceSlotId === targetSlotId &&
        sourceDay === targetDay
      ) {
        return
      }
      moveAssignment(
        sourceGradeId,
        sourceSlotId!,
        sourceDay!,
        targetGradeId,
        targetSlotId,
        targetDay,
        teacherId,
      )
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen overflow-hidden" style={{ background: '#f1f5f9' }}>
        {/* Dark sidebar */}
        <aside
          className="w-64 flex flex-col flex-shrink-0 overflow-hidden"
          style={{ background: '#0c1424', borderRight: '1px solid #1e2d42' }}
        >
          {/* Branding header */}
          <div
            className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid #1e2d42' }}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white leading-tight truncate">Colegio Lamatepec</h1>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">Sistema de Horarios</p>
            </div>
          </div>

          {/* Drag hint */}
          <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #1e2d42' }}>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              Arrastra profesores al horario
            </p>
          </div>

          <TeacherPanel />
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <MainContent />
        </main>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {draggingTeacher && (
          <div className="w-44">
            <TeacherChip teacher={draggingTeacher} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
