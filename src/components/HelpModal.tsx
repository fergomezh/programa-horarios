interface Props {
  onClose: () => void
}

const steps = [
  {
    number: '01',
    title: 'Agregar Profesores',
    tab: 'Gestionar → Profesores',
    color: 'bg-crimson-600',
    content: [
      'Haz clic en "Nuevo profesor" e ingresa el nombre y las materias que imparte.',
      'Un profesor puede tener una o varias materias asignadas.',
      'Opcionalmente, puedes crear una cuenta de acceso para que el profesor vea su horario en línea.',
    ],
  },
  {
    number: '02',
    title: 'Agregar Grados',
    tab: 'Gestionar → Grados',
    color: 'bg-violet-500',
    content: [
      'Registra cada sección o grado de la institución (ej. "1° A", "2° B").',
      'Cada grado tendrá su propia columna en el horario.',
    ],
  },
  {
    number: '03',
    title: 'Configurar Límites de Horas',
    tab: 'Gestionar → Límites',
    color: 'bg-amber-500',
    content: [
      'Define cuántas horas semanales puede tener cada materia por grado.',
      'Pon el límite en 0 si ese grado no lleva esa materia — el sistema bloqueará cualquier asignación.',
      'Si no configuras un límite, la materia no tendrá restricción de cantidad.',
    ],
    highlight: true,
  },
  {
    number: '04',
    title: 'Armar el Horario',
    tab: 'Horario',
    color: 'bg-emerald-500',
    content: [
      'Arrastra un profesor desde el panel izquierdo y suéltalo en cualquier celda del horario.',
      'Si el profesor imparte varias materias, se abrirá un selector para elegir cuál asignar.',
      'También puedes mover una asignación existente arrastrándola de una celda a otra.',
    ],
  },
  {
    number: '05',
    title: 'Eliminar una Asignación',
    tab: 'Horario',
    color: 'bg-rose-500',
    content: [
      'Haz clic derecho sobre el chip de un profesor dentro del horario.',
      'Aparecerá un cuadro de confirmación antes de eliminar.',
    ],
  },
  {
    number: '06',
    title: 'Ver Reportes',
    tab: 'Reportes',
    color: 'bg-slate-500',
    content: [
      'Consulta el resumen de horas por profesor y por grado.',
      'Descarga PDFs del horario completo, del horario personal de cada profesor o del equipo de cada grado.',
    ],
  },
]

const tips = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
      </svg>
    ),
    text: 'Si el horario muestra un número rojo en la pestaña "Horario", hay conflictos: el mismo profesor está asignado en dos grados al mismo tiempo.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
    text: 'Al arrastrar, las celdas disponibles se iluminan en verde y las bloqueadas en rojo para guiarte visualmente.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    text: 'Haz clic en un profesor en el panel lateral (fuera de la pestaña Horario) para ver su horario personal completo.',
  },
]

export default function HelpModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#fff' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: '#0D1B35', borderBottom: '1px solid #1A2E4A' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Manual de uso</h2>
              <p className="text-xs text-slate-400 leading-tight">Sistema de Horarios — Colegio Lamatepec</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Intro */}
          <p className="text-sm text-slate-500 leading-relaxed">
            Sigue estos pasos en orden para configurar y utilizar el sistema correctamente.
          </p>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`rounded-xl border ${step.highlight ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'} p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${step.color} w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <span className="text-white text-[11px] font-bold">{step.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-800">{step.title}</h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500">
                        {step.tab}
                      </span>
                      {step.highlight && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-white">
                          Importante
                        </span>
                      )}
                    </div>
                    <ul className="mt-2 space-y-1">
                      {step.content.map((line, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-crimson-100 bg-crimson-50 p-4">
            <p className="text-xs font-semibold text-crimson-700 mb-2.5 uppercase tracking-wide">Consejos rapidos</p>
            <div className="space-y-2.5">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-crimson-600 flex-shrink-0 mt-0.5">{tip.icon}</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 flex-shrink-0 flex justify-end"
          style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
