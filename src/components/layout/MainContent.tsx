import ScheduleBoard from '../schedule/ScheduleBoard'
import ManagementPanel from '../management/ManagementPanel'
import ReportsPanel from '../reports/ReportsPanel'
import { useConflicts } from '../../hooks/useConflicts'
import type { MainTab } from './AppLayout'

interface Props {
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  onHelpClick: () => void
}

export default function MainContent({ activeTab, onTabChange, onHelpClick }: Props) {
  const conflicts = useConflicts()
  const conflictCount = conflicts.size

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Main navigation tab bar ── */}
      {/* Visual identity: crimson-filled pills = primary nav. Sub-tabs inside each panel use underline style. */}
      <div
        className="flex items-center gap-1 px-4 flex-shrink-0"
        style={{
          background: '#fff',
          borderBottom: '2px solid #EDE8E3',
          paddingTop: '10px',
          paddingBottom: '10px',
        }}
      >
        {/* Thin crimson left rule — institutional accent */}
        <span className="w-0.5 h-6 rounded-full bg-crimson-600 mr-2 flex-shrink-0" />

        <button
          onClick={() => onTabChange('reports')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-150 active:scale-95 ${
            activeTab === 'reports'
              ? 'bg-crimson-600 text-white shadow-md hover:bg-crimson-700'
              : 'text-slate-500 hover:bg-crimson-50 hover:text-crimson-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Reportes
        </button>

        <button
          onClick={() => onTabChange('schedule')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-150 active:scale-95 ${
            activeTab === 'schedule'
              ? 'bg-crimson-600 text-white shadow-md hover:bg-crimson-700'
              : 'text-slate-500 hover:bg-crimson-50 hover:text-crimson-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Horario
          {conflictCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
              {conflictCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('manage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-150 active:scale-95 ${
            activeTab === 'manage'
              ? 'bg-crimson-600 text-white shadow-md hover:bg-crimson-700'
              : 'text-slate-500 hover:bg-crimson-50 hover:text-crimson-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Gestionar
        </button>

        <div className="flex-1" />

        <button
          onClick={onHelpClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 active:scale-95 text-white text-sm font-semibold shadow-sm transition-all duration-150 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          Ayuda
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'schedule' && <ScheduleBoard />}
        {activeTab === 'manage' && <ManagementPanel />}
        {activeTab === 'reports' && <ReportsPanel />}
      </div>
    </div>
  )
}
