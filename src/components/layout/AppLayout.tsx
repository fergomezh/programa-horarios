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
import type { DayOfWeek, DraggableTeacherData, DroppableCellData } from '../../types'
import TeacherPanel from '../sidebar/TeacherPanel'
import MainContent from './MainContent'
import TeacherChip from '../schedule/TeacherChip'
import SubjectPicker from '../schedule/SubjectPicker'
import ConflictBlockModal from '../schedule/ConflictBlockModal'

interface PendingDrop {
  teacherId: string
  gradeId: string
  slotId: string
  day: DayOfWeek
}

interface ConflictBlocked {
  teacherId: string
  day: DayOfWeek
  slotId: string
  conflictingEntries: { gradeId: string; subject: string }[]
}

export default function AppLayout() {
  const teachers = useScheduleStore((s) => s.teachers)
  const grades = useScheduleStore((s) => s.grades)
  const assignments = useScheduleStore((s) => s.assignments)
  const assignTeacher = useScheduleStore((s) => s.assignTeacher)
  const moveAssignment = useScheduleStore((s) => s.moveAssignment)

  const [draggingData, setDraggingData] = useState<DraggableTeacherData | null>(null)
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null)
  const [conflictBlocked, setConflictBlocked] = useState<ConflictBlocked | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const teacherMap = new Map(teachers.map((t) => [t.id, t]))
  const gradeMap = new Map(grades.map((g) => [g.id, g]))
  const draggingTeacher = draggingData ? (teacherMap.get(draggingData.teacherId) ?? null) : null
  const pendingTeacher = pendingDrop ? (teacherMap.get(pendingDrop.teacherId) ?? null) : null

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DraggableTeacherData | undefined
    if (data?.type === 'teacher') setDraggingData(data)
  }

  /**
   * Returns true if the assignment is allowed.
   * Returns false and shows the conflict modal if the teacher is already busy at that slot.
   */
  function checkAndBlockConflict(
    teacherId: string,
    targetGradeId: string,
    targetSlotId: string,
    targetDay: DayOfWeek,
    excludeGradeId: string | null,
  ): boolean {
    const conflicting = assignments.filter(
      (a) =>
        a.teacherId === teacherId &&
        a.slotId === targetSlotId &&
        a.day === targetDay &&
        a.gradeId !== targetGradeId &&
        a.gradeId !== excludeGradeId,
    )
    if (conflicting.length > 0) {
      setConflictBlocked({
        teacherId,
        day: targetDay,
        slotId: targetSlotId,
        conflictingEntries: conflicting.map((a) => ({ gradeId: a.gradeId, subject: a.subject })),
      })
      return false
    }
    return true
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
      // Dragged from sidebar
      const teacher = teacherMap.get(teacherId)
      if (!teacher) return

      if (!checkAndBlockConflict(teacherId, targetGradeId, targetSlotId, targetDay, null)) return

      if (teacher.subjects.length === 1) {
        assignTeacher(targetGradeId, targetSlotId, targetDay, teacherId, teacher.subjects[0])
      } else {
        setPendingDrop({ teacherId, gradeId: targetGradeId, slotId: targetSlotId, day: targetDay })
      }
    } else {
      // Moving a chip between cells
      if (
        sourceGradeId === targetGradeId &&
        sourceSlotId === targetSlotId &&
        sourceDay === targetDay
      ) {
        return
      }

      // Exclude sourceGradeId only when moving within the same slot+day (that slot will be vacated)
      const excludeGrade =
        sourceSlotId === targetSlotId && sourceDay === targetDay ? sourceGradeId : null

      if (!checkAndBlockConflict(teacherId, targetGradeId, targetSlotId, targetDay, excludeGrade)) return

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

  function handleSubjectSelected(subject: string) {
    if (!pendingDrop) return
    const { teacherId, gradeId, slotId, day } = pendingDrop
    assignTeacher(gradeId, slotId, day, teacherId, subject)
    setPendingDrop(null)
  }

  const blockedTeacher = conflictBlocked ? teacherMap.get(conflictBlocked.teacherId) : null
  const blockedEntries = conflictBlocked
    ? conflictBlocked.conflictingEntries.map((e) => ({
        gradeLabel: gradeMap.get(e.gradeId)?.label ?? '?',
        subject: e.subject,
      }))
    : []

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen overflow-hidden relative" style={{ background: '#f1f5f9' }}>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 md:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:relative inset-y-0 left-0 z-30
            w-72 md:w-64 flex flex-col flex-shrink-0 overflow-hidden
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
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
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-white leading-tight truncate">Colegio Lamatepec</h1>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">Sistema de Horarios</p>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile top bar */}
          <div
            className="md:hidden flex items-center gap-3 px-3 py-2.5 flex-shrink-0"
            style={{ background: '#0c1424', borderBottom: '1px solid #1e2d42' }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">Colegio Lamatepec</span>
            </div>
          </div>

          <MainContent />
        </main>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {draggingTeacher && (
          <div className="w-44">
            <TeacherChip teacher={draggingTeacher} subject={draggingTeacher.subjects[0] ?? ''} isOverlay />
          </div>
        )}
      </DragOverlay>

      {/* Subject picker — shown after drop when teacher has multiple subjects */}
      {pendingDrop && pendingTeacher && (
        <SubjectPicker
          teacher={pendingTeacher}
          slotId={pendingDrop.slotId}
          day={pendingDrop.day}
          onSelect={handleSubjectSelected}
          onCancel={() => setPendingDrop(null)}
        />
      )}

      {/* Conflict block modal */}
      {conflictBlocked && blockedTeacher && (
        <ConflictBlockModal
          teacherName={blockedTeacher.name}
          teacherColor={blockedTeacher.color}
          day={conflictBlocked.day}
          slotId={conflictBlocked.slotId}
          conflictingEntries={blockedEntries}
          onClose={() => setConflictBlocked(null)}
        />
      )}
    </DndContext>
  )
}
