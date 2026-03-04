# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server at localhost:5173
npm run build    # Type-check (tsc -b) then Vite build
npm run preview  # Serve the production build
```

There are no tests. There is no linter configured beyond TypeScript strict mode.

## Architecture

Single-page React app — no backend, all state in localStorage via Zustand persist.

### Data flow

```
useScheduleStore (Zustand + persist)
  └─ teachers[], grades[], assignments[]
       └─ computeConflicts() → Map<conflictKey, Conflict>
            └─ useConflicts() hook (useMemo wrapper)
                 └─ passed as prop into ScheduleGrid → ScheduleCell
```

**Conflict key format:** `teacherId::slotId::day`
**Cell ID format:** `gradeId::slotId::day` (built/parsed via `src/utils/idHelpers.ts`)

### Teacher subjects

A teacher has `subjects: string[]` (multiple). An `Assignment` carries `subject: string` — which specific subject that teacher is teaching in that slot. When dragging from the sidebar:
- 1 subject → assigns directly
- 2+ subjects → `SubjectPicker` modal appears (state `pendingDrop` in `AppLayout`)

Moving a chip between cells preserves its existing `subject` (the store looks it up from the source assignment in `moveAssignment`). localStorage key is `lamatepec-horarios-v2`.

### Drag-and-drop

`DndContext` lives in `AppLayout` — it must wrap **both** the sidebar (draggables) and the schedule grid (droppables). Moving it inside `ScheduleBoard` breaks cross-component DnD.

Two drag sources:
- `TeacherCard` (sidebar) → `sourceGradeId: null` → calls `assignTeacher()`
- `DraggableTeacherChip` (inside cell) → `sourceGradeId` populated → calls `moveAssignment()`

Drop targets: `ScheduleCell` via `useDroppable`. Break rows are **not** droppable.

### Key constants

- `src/constants/schedule.ts` — `TIME_SLOTS` (14 rows: 12 class + 2 breaks), `DAYS_OF_WEEK`, `TEACHER_COLORS` (12-color palette auto-assigned on `addTeacher`)
- localStorage key: `lamatepec-horarios-v1`
- `activeGradeId` is **not** persisted (excluded via `partialize` in the store)

### Tailwind

Uses **TailwindCSS v4** via `@tailwindcss/vite` plugin — no `postcss.config.js`, no `tailwind.config.js`. Import in CSS is `@import "tailwindcss"`. The `@theme` directive can extend the theme if needed.

### Teacher colors

`teacher.color` is a Tailwind class string (e.g. `bg-blue-500`). It is applied directly to divs as a className for color stripes and dots — you cannot extract a hex value from it at runtime.
