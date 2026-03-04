import { useState } from 'react'
import ScheduleBoard from '../schedule/ScheduleBoard'
import ManagementPanel from '../management/ManagementPanel'
import { useConflicts } from '../../hooks/useConflicts'

type Tab = 'schedule' | 'manage'

export default function MainContent() {
  const [activeTab, setActiveTab] = useState<Tab>('schedule')
  const conflicts = useConflicts()
  const conflictCount = conflicts.size

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 border-b border-slate-200 bg-white flex-shrink-0" style={{ minHeight: 48 }}>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`relative flex items-center gap-2 px-3 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'schedule'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Horario
          {conflictCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-xs font-bold leading-none">
              {conflictCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-3 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'manage'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Gestionar
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'schedule' ? <ScheduleBoard /> : <ManagementPanel />}
      </div>
    </div>
  )
}
