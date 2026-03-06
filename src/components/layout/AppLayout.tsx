import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { useScheduleStore } from '../../store/useScheduleStore'
import type { DayOfWeek, DraggableTeacherData, DroppableCellData, Teacher } from '../../types'
import { TIME_SLOTS } from '../../constants/schedule'
import TeacherPanel from '../sidebar/TeacherPanel'
import MainContent from './MainContent'
import TeacherChip from '../schedule/TeacherChip'
import SubjectPicker from '../schedule/SubjectPicker'
import ConflictBlockModal from '../schedule/ConflictBlockModal'
import LimitBlockModal from '../schedule/LimitBlockModal'
import OccupiedCellModal from '../schedule/OccupiedCellModal'
import WelcomeToast from '../WelcomeToast'
import TeacherScheduleModal from '../TeacherScheduleModal'
import { DragHighlightContext } from '../../context/DragHighlightContext'
import { useAuth } from '../../hooks/useAuth'

export type MainTab = 'schedule' | 'manage' | 'reports'

const CLASS_SLOT_IDS = new Set(TIME_SLOTS.filter((s) => !s.isBreak).map((s) => s.id))

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

interface LimitBlocked {
  subject: string
  gradeId: string
  limit: number
  currentCount: number
}

interface OccupiedCellBlocked {
  targetGradeId: string
  targetSlotId: string
  targetDay: DayOfWeek
  existingTeacherId: string
  existingSubject: string
  sourceTeacherId: string | null
  sourceSubject: string
  sourceGradeId: string | null
  sourceSlotId: string | null
  sourceDay: DayOfWeek | null
}

export default function AppLayout() {
  const teachers = useScheduleStore((s) => s.teachers)
  const grades = useScheduleStore((s) => s.grades)
  const assignments = useScheduleStore((s) => s.assignments)
  const assignTeacher = useScheduleStore((s) => s.assignTeacher)
  const moveAssignment = useScheduleStore((s) => s.moveAssignment)
  const initStore = useScheduleStore((s) => s.initStore)
  const isLoading = useScheduleStore((s) => s.isLoading)
  const subjectLimits = useScheduleStore((s) => s.subjectLimits)

  const { user, logout } = useAuth()

  const [activeTab, setActiveTab] = useState<MainTab>('reports')
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<Teacher | null>(null)
  const [draggingData, setDraggingData] = useState<DraggableTeacherData | null>(null)
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null)
  const [conflictBlocked, setConflictBlocked] = useState<ConflictBlocked | null>(null)
  const [limitBlocked, setLimitBlocked] = useState<LimitBlocked | null>(null)
  const [occupiedCellBlocked, setOccupiedCellBlocked] = useState<OccupiedCellBlocked | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    initStore()
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const teacherMap = new Map(teachers.map((t) => [t.id, t]))
  const gradeMap = new Map(grades.map((g) => [g.id, g]))
  const draggingTeacher = draggingData ? (teacherMap.get(draggingData.teacherId) ?? null) : null
  const pendingTeacher = pendingDrop ? (teacherMap.get(pendingDrop.teacherId) ?? null) : null

  /**
   * Slots ocupados por el profesor que se está arrastrando.
   * Excluye la celda origen cuando es un movimiento de chip (esa se vaciará).
   */
  const busySlotKeys = useMemo<Set<string>>(() => {
    if (!draggingData) return new Set()
    const { teacherId, sourceGradeId, sourceSlotId, sourceDay } = draggingData
    const keys = new Set<string>()
    for (const a of assignments) {
      if (a.teacherId !== teacherId) continue
      // Si viene de una celda, ese slot quedará libre — no lo marcamos como ocupado
      if (
        sourceGradeId !== null &&
        a.gradeId === sourceGradeId &&
        a.slotId === sourceSlotId &&
        a.day === sourceDay
      ) continue
      keys.add(`${a.slotId}::${a.day}`)
    }
    return keys
  }, [draggingData, assignments])

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

  function checkAndBlockOccupiedCell(
    targetGradeId: string,
    targetSlotId: string,
    targetDay: DayOfWeek,
    sourceTeacherId: string | null,
    sourceGradeId: string | null,
    sourceSlotId: string | null,
    sourceDay: DayOfWeek | null,
  ): boolean {
    const existing = assignments.find(
      (a) =>
        a.gradeId === targetGradeId &&
        a.slotId === targetSlotId &&
        a.day === targetDay &&
        !(sourceGradeId === targetGradeId && sourceSlotId === targetSlotId && sourceDay === targetDay),
    )
    if (existing && sourceTeacherId) {
      let sourceSubject = ''
      if (sourceGradeId && sourceSlotId && sourceDay) {
        const sourceAssignment = assignments.find(
          (a) => a.gradeId === sourceGradeId && a.slotId === sourceSlotId && a.day === sourceDay,
        )
        sourceSubject = sourceAssignment?.subject ?? ''
      } else {
        const sourceTeacher = teacherMap.get(sourceTeacherId)
        sourceSubject = sourceTeacher?.subjects[0] ?? ''
      }
      setOccupiedCellBlocked({
        targetGradeId,
        targetSlotId,
        targetDay,
        existingTeacherId: existing.teacherId,
        existingSubject: existing.subject,
        sourceTeacherId,
        sourceSubject,
        sourceGradeId,
        sourceSlotId,
        sourceDay,
      })
      return false
    }
    return true
  }

  /**
   * Returns true if the assignment is allowed.
   * Returns false and shows the limit modal if this would exceed the subject's weekly limit.
   * sourceGradeId/sourceSlotId/sourceDay: set for chip moves (source slot is excluded from count).
   */
  function checkAndBlockLimit(
    subject: string,
    targetGradeId: string,
    sourceGradeId: string | null,
    sourceSlotId: string | null,
    sourceDay: DayOfWeek | null,
  ): boolean {
    const limits = subjectLimits[targetGradeId]
    if (!limits || !(subject in limits)) return true
    const limit = limits[subject]
    const currentCount = assignments.filter(
      (a) =>
        a.gradeId === targetGradeId &&
        a.subject === subject &&
        CLASS_SLOT_IDS.has(a.slotId) &&
        !(sourceGradeId === targetGradeId && a.slotId === sourceSlotId && a.day === sourceDay),
    ).length
    if (currentCount >= limit) {
      setLimitBlocked({ subject, gradeId: targetGradeId, limit, currentCount })
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

      if (!checkAndBlockOccupiedCell(targetGradeId, targetSlotId, targetDay, teacherId, null, null, null)) return

      if (teacher.subjects.length === 1) {
        const subject = teacher.subjects[0]
        if (!checkAndBlockLimit(subject, targetGradeId, null, null, null)) return
        assignTeacher(targetGradeId, targetSlotId, targetDay, teacherId, subject)
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

      if (!checkAndBlockOccupiedCell(targetGradeId, targetSlotId, targetDay, teacherId, sourceGradeId, sourceSlotId, sourceDay)) return

      // Find the subject being moved
      const sourceAssignment = assignments.find(
        (a) => a.gradeId === sourceGradeId && a.slotId === sourceSlotId && a.day === sourceDay,
      )
      if (sourceAssignment) {
        if (!checkAndBlockLimit(sourceAssignment.subject, targetGradeId, sourceGradeId, sourceSlotId, sourceDay)) return
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

  function handleSubjectSelected(subject: string) {
    if (!pendingDrop) return
    const { teacherId, gradeId, slotId, day } = pendingDrop
    setPendingDrop(null)
    if (!checkAndBlockLimit(subject, gradeId, null, null, null)) return
    assignTeacher(gradeId, slotId, day, teacherId, subject)
  }

  const blockedTeacher = conflictBlocked ? teacherMap.get(conflictBlocked.teacherId) : null
  const blockedEntries = conflictBlocked
    ? conflictBlocked.conflictingEntries.map((e) => ({
        gradeLabel: gradeMap.get(e.gradeId)?.label ?? '?',
        subject: e.subject,
      }))
    : []

  // All hooks must be called before any conditional return
  const dragHighlightValue = useMemo(
    () => ({ draggingTeacherId: draggingData?.teacherId ?? null, busySlotKeys }),
    [draggingData, busySlotKeys],
  )

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0c1424' }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <>
    <DragHighlightContext.Provider value={dragHighlightValue}>
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

          {/* User info + logout */}
          <div className="px-3 py-2 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid #1e2d42' }}>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <p className="text-xs text-blue-500 font-medium">Admin</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Drag hint */}
          <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #1e2d42' }}>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              {activeTab === 'schedule' ? (
                <>
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                  Arrastra profesores al horario
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Clic para ver horario
                </>
              )}
            </p>
          </div>

          <TeacherPanel
            activeTab={activeTab}
            onTeacherClick={(teacher) => setSelectedTeacherModal(teacher)}
          />
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

          <MainContent activeTab={activeTab} onTabChange={setActiveTab} />
        </main>
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 220,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0' } },
          }),
        }}
      >
        {draggingTeacher && (
          <div
            className="w-44"
            style={{
              transform: 'scale(1.06) rotate(2deg)',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.22))',
              transition: 'transform 150ms ease, filter 150ms ease',
            }}
          >
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

      {/* Limit block modal */}
      {limitBlocked && (
        <LimitBlockModal
          subject={limitBlocked.subject}
          gradeLabel={gradeMap.get(limitBlocked.gradeId)?.label ?? '?'}
          limit={limitBlocked.limit}
          currentCount={limitBlocked.currentCount}
          onClose={() => setLimitBlocked(null)}
        />
      )}

      {/* Occupied cell modal */}
      {occupiedCellBlocked && (
        <OccupiedCellModal
          targetGradeLabel={gradeMap.get(occupiedCellBlocked.targetGradeId)?.label ?? '?'}
          existingTeacherName={teacherMap.get(occupiedCellBlocked.existingTeacherId)?.name ?? '?'}
          existingTeacherColor={teacherMap.get(occupiedCellBlocked.existingTeacherId)?.color ?? 'bg-gray-500'}
          existingSubject={occupiedCellBlocked.existingSubject}
          sourceTeacherName={teacherMap.get(occupiedCellBlocked.sourceTeacherId ?? '')?.name ?? '?'}
          sourceTeacherColor={teacherMap.get(occupiedCellBlocked.sourceTeacherId ?? '')?.color ?? 'bg-gray-500'}
          sourceSubject={occupiedCellBlocked.sourceSubject}
          day={occupiedCellBlocked.targetDay}
          slotId={occupiedCellBlocked.targetSlotId}
          onReplace={() => {
            const { targetGradeId, targetSlotId, targetDay, sourceTeacherId, sourceSubject, sourceGradeId, sourceSlotId, sourceDay } = occupiedCellBlocked
            setOccupiedCellBlocked(null)
            if (sourceTeacherId && sourceGradeId && sourceSlotId && sourceDay) {
              moveAssignment(
                sourceGradeId,
                sourceSlotId,
                sourceDay,
                targetGradeId,
                targetSlotId,
                targetDay,
                sourceTeacherId,
              )
            } else if (sourceTeacherId) {
              if (sourceSubject) {
                assignTeacher(targetGradeId, targetSlotId, targetDay, sourceTeacherId, sourceSubject)
              } else {
                const teacher = teacherMap.get(sourceTeacherId)
                if (teacher && teacher.subjects.length === 1) {
                  assignTeacher(targetGradeId, targetSlotId, targetDay, sourceTeacherId, teacher.subjects[0])
                } else if (teacher) {
                  setPendingDrop({ teacherId: sourceTeacherId, gradeId: targetGradeId, slotId: targetSlotId, day: targetDay })
                }
              }
            }
          }}
          onCancel={() => setOccupiedCellBlocked(null)}
        />
      )}
    </DndContext>
    </DragHighlightContext.Provider>
    <WelcomeToast name={user?.email ?? ''} role="admin" />
    {selectedTeacherModal && (
      <TeacherScheduleModal
        teacher={selectedTeacherModal}
        onClose={() => setSelectedTeacherModal(null)}
      />
    )}
    </>
  )
}
