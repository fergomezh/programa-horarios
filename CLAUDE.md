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

Single-page React app with Supabase backend. State managed by Zustand (no persist — data lives in Supabase DB). Auth via Supabase Auth.

### Data flow

```
useScheduleStore (Zustand, no persist)
  └─ teachers[], grades[], assignments[], subjectLimits{}
       └─ computeConflicts() → Map<conflictKey, Conflict>
            └─ useConflicts() hook (useMemo wrapper)
                 └─ passed as prop into ScheduleGrid → ScheduleCell
```

**Conflict key format:** `teacherId::slotId::day`
**Cell ID format:** `gradeId::slotId::day` (built/parsed via `src/utils/idHelpers.ts`)
**Busy slot key format:** `slotId::day` (used in `DragHighlightContext`)

### Teacher subjects

A teacher has `subjects: string[]` (multiple). An `Assignment` carries `subject: string` — which specific subject that teacher is teaching in that slot. When dragging from the sidebar:
- 1 subject → assigns directly
- 2+ subjects → `SubjectPicker` modal appears (state `pendingDrop` in `AppLayout`)

Moving a chip between cells preserves its existing `subject` (the store looks it up from the source assignment in `moveAssignment`).

### Drag-and-drop

`DndContext` lives in `AppLayout` — it must wrap **both** the sidebar (draggables) and the schedule grid (droppables). Moving it inside `ScheduleBoard` breaks cross-component DnD.

Two drag sources:
- `TeacherCard` (sidebar) → `sourceGradeId: null` → calls `assignTeacher()`
- `DraggableTeacherChip` (inside cell) → `sourceGradeId` populated → calls `moveAssignment()`

Drop targets: `ScheduleCell` via `useDroppable`. Break rows are **not** droppable.

#### Drop validation chain (AppLayout `handleDragEnd`)

Three checks run in order before any assignment is made:

1. **Conflict check** (`checkAndBlockConflict`): teacher already has an assignment at that `slotId+day` in another grade → shows `ConflictBlockModal`, cancels drop.
2. **Occupied cell check** (`checkAndBlockOccupiedCell`): target cell already has a *different* teacher → shows `OccupiedCellModal` with Replace / Cancel options.
3. **Subject limit check** (`checkAndBlockLimit`): assignment would exceed the configured weekly limit for that subject in that grade → shows `LimitBlockModal`, cancels drop.

When moving a chip, the source slot is excluded from the conflict check only when `sourceSlotId === targetSlotId && sourceDay === targetDay`.

#### Drag highlight

`DragHighlightContext` (`src/context/DragHighlightContext.ts`) is provided by `AppLayout` and consumed by every `ScheduleCell`. While dragging, it holds:
- `draggingTeacherId` — ID of the teacher in flight
- `busySlotKeys` — `Set<string>` of `slotId::day` keys where that teacher already has assignments (source cell excluded for chip moves)

`ScheduleCell` uses this to apply visual highlights:
- **Emerald tint** → safe cell (no conflict)
- **Rose tint** → blocked cell (would conflict)
- Brighter border + background on hover within each state

### Subject limits

`subjectLimits: Record<gradeId, Record<subject, limitHours>>` in the store. Persisted in the `subject_limits` Supabase table. Managed via `SubjectLimitsManager` in the Gestionar → Límites tab.

- `setSubjectLimit(gradeId, subject, limit | null)` — upserts or deletes the limit in Supabase.
- Limit of `0` means the subject is forbidden for that grade.
- Only `CLASS_SLOT_IDS` (non-break slots) are counted against limits.

### Key constants (`src/constants/schedule.ts`)

- `TIME_SLOTS` — 11 rows: 8 class slots + 3 breaks (Recreo `break-1`, Misa `break-missa`, Almuerzo `break-2`)
- `DAYS_OF_WEEK` — lunes–viernes
- `TEACHER_COLORS` / `SUBJECT_COLORS` — 18-color Tailwind palette
- `getTeacherColor(name)` / `getSubjectColor(subject)` — deterministic hash → color

### Responsive layout

The sidebar is `fixed` on mobile and `relative` on `md+` (Tailwind breakpoint). On mobile a top bar with a hamburger button toggles `sidebarOpen` state in `AppLayout`, sliding in the sidebar as a drawer with a backdrop overlay. Modals use `w-full max-w-sm mx-4` so they fit narrow screens.

### Tailwind

Uses **TailwindCSS v4** via `@tailwindcss/vite` plugin — no `postcss.config.js`, no `tailwind.config.js`. Import in CSS is `@import "tailwindcss"`. The `@theme` directive can extend the theme if needed.

### Teacher colors

`teacher.color` is a Tailwind class string (e.g. `bg-blue-500`). It is applied directly to divs as a className for color stripes and dots — you cannot extract a hex value from it at runtime.

---

## Modals reference

| Modal | File | Trigger |
|---|---|---|
| `SubjectPicker` | `src/components/schedule/SubjectPicker.tsx` | Drop from sidebar, teacher has 2+ subjects |
| `ConflictBlockModal` | `src/components/schedule/ConflictBlockModal.tsx` | Drop would double-book teacher |
| `OccupiedCellModal` | `src/components/schedule/OccupiedCellModal.tsx` | Drop on occupied cell (different teacher) |
| `LimitBlockModal` | `src/components/schedule/LimitBlockModal.tsx` | Drop would exceed subject weekly limit |
| `RemoveConfirmModal` | `src/components/schedule/RemoveConfirmModal.tsx` | Right-click chip → confirm before removing |
| `TeacherScheduleModal` | `src/components/TeacherScheduleModal.tsx` | Click a teacher in sidebar → see their personal schedule + PDF download |
| `CreateAccountModal` | `src/components/management/CreateAccountModal.tsx` | Admin creates Supabase login for a teacher |
| `ViewAccountModal` | `src/components/management/ViewAccountModal.tsx` | Admin views/resets a teacher's password |
| `WelcomeToast` | `src/components/WelcomeToast.tsx` | Auto-shown on login, fades out after 4.6 s |

---

## Main tabs (AppLayout → MainContent)

Default active tab: `'reports'`.

| Tab key | Label | Content |
|---|---|---|
| `schedule` | Horario | `ScheduleBoard` — drag-and-drop grid |
| `manage` | Gestionar | `ManagementPanel` — teachers, grades, limits |
| `reports` | Reportes | `ReportsPanel` — 4 sub-tabs |

### Reports sub-tabs (`ReportsPanel`)

| Sub-tab | Label | Content |
|---|---|---|
| `dashboard` | Resumen | Stat cards + horizontal bar chart (recharts) of hours per teacher |
| `teacher-hours` | Por Profesor | Select one teacher (or "Todos") → breakdown by grade + subject + total hours. PDF download per teacher |
| `teacher-summary` | Resumen Docente | All teachers, subjects, total hours. Searchable. PDF download |
| `grade-team` | Equipo Educador | Select grade section → all teachers assigned, their subjects + hours. PDF download |

Reports use `recharts` for charts. PDF generation uses `@react-pdf/renderer` via `pdf().toBlob()`.

### Management sub-tabs (`ManagementPanel`)

| Sub-tab | Content |
|---|---|
| Profesores | `TeacherManager` — add/edit/delete teachers; "Crear cuenta" / "Ver cuenta" for Supabase auth |
| Grados | `GradeManager` — add/edit/delete grade sections |
| Límites | `SubjectLimitsManager` — set max hours/week per subject per grade |

---

## Sidebar (`TeacherPanel`)

- Subject filter dropdown to narrow the teacher list.
- Hint message changes based on `activeTab`: "Arrastra profesores al horario" (schedule) vs "Clic para ver horario" (other tabs).
- Clicking a teacher card (non-schedule tab) opens `TeacherScheduleModal`.
- Dragging a teacher card (schedule tab) starts a DnD operation.

---

## Auth & Routing

- `App.tsx`: loading spinner → `LoginPage` (no session) → `TeacherView` (role=teacher) → `AppLayout` (role=admin)
- `AppLayout`: calls `initStore()` on mount; has logout button + user email in sidebar header.
- `TeacherView`: read-only schedule table + PDF download; calls `initStore()` on mount.
- **IMPORTANT**: `onAuthStateChange` in supabase-js v2 does NOT support async callbacks. Use `.then().finally()` chaining, not `async/await` inside the callback.

---

## Store (`useScheduleStore`)

Key state: `teachers[]`, `grades[]`, `assignments[]`, `subjectLimits{}`, `activeGradeId`, `isLoading`, `storeError`.

`activeGradeId` is NOT persisted (in-memory only). `initStore()` loads all data from Supabase in parallel (teachers, grades, assignments, subject_limits). On load, teacher colors are re-derived from name hash and updated in DB if they differ.

Edge functions invoked by the store:
- `delete-teacher-account` — called in `removeTeacher()` when teacher has an auth account.

---

## Supabase setup

1. Run `supabase/schema.sql` in dashboard SQL editor
2. Create admin user in Auth dashboard → `insert into profiles (id, role) values ('<uuid>', 'admin')`
3. Fill `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (restart dev server after)
4. Deploy edge functions:
   - `supabase functions deploy create-teacher-account`
   - `supabase functions deploy reset-teacher-password`
   - `supabase functions deploy delete-teacher-account`

### Key files
- `src/lib/supabase.ts` — `createClient`
- `src/context/AuthContext.tsx` — `AuthProvider`; `onAuthStateChange` with `.then().finally()`
- `supabase/schema.sql` — full SQL schema
- `supabase/functions/create-teacher-account/index.ts` — admin-only, uses service role client
- `supabase/functions/reset-teacher-password/index.ts` — admin-only
- `supabase/functions/delete-teacher-account/index.ts` — admin-only

---

## PDF exports

| PDF | Component | Downloaded from |
|---|---|---|
| Grade schedule (A4 landscape) | `src/components/pdf/SchedulePDF.tsx` | ScheduleBoard print button |
| Teacher personal schedule | `src/components/pdf/TeacherSchedulePDF.tsx` | TeacherView + TeacherScheduleModal |
| Teacher hours report | `src/components/pdf/ReportsPDF.tsx` — `TeacherHoursReportPDF` | ReportsPanel |
| Teacher summary report | `src/components/pdf/ReportsPDF.tsx` — `TeacherSummaryReportPDF` | ReportsPanel |
| Grade team report | `src/components/pdf/ReportsPDF.tsx` — `GradeTeamReportPDF` | ReportsPanel |

All use `pdf().toBlob()` + `URL.createObjectURL()` pattern via `PrintButton` or inline handlers.
