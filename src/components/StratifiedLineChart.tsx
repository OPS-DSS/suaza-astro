import { useState, useMemo, useRef } from 'react'
import { DSLineChart } from '@ops-dss/charts/line-chart'
import type { StratifiedRow } from '@/lib/parquet'
import type { IndicatorStratifier } from '@/lib/indicators'
import { ExpandablePanel } from './ExpandablePanel'

// ── Canonical aggregate labels ────────────────────────────────────────────────
// Legacy format (Excel mocks): sexo/grupo_edad/zona
const TOTAL_SEXO = 'Todos/as'
const TOTAL_EDAD = 'Todas las edades'
const TOTAL_ZONA_LEGACY = 'Todas las zonas'
// Simulation format (etnia-based): zona/etnia
const TOTAL_ETNIA = 'Total'
const TOTAL_ZONA_SIM = 'Total'

// ── Stratifier type ───────────────────────────────────────────────────────────
type Stratifier = 'total' | 'sexo' | 'grupo_edad' | 'zona' | 'etnia'

// ── Colour palettes ───────────────────────────────────────────────────────────
const SEX_COLORS: Record<string, string> = {
  Hombres: '#3b82f6',
  Mujeres: '#ec4899',
}
const ZONA_COLORS: Record<string, string> = {
  urbano: '#22c55e',
  periurbano: '#f59e0b',
  rural: '#ef4444',
  Urbano: '#22c55e',
  Periurbano: '#f59e0b',
  Rural: '#ef4444',
}
const ETNIA_COLORS: Record<string, string> = {
  Indígena: '#8b5cf6',
  'No indígena': '#06b6d4',
}
const AGE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#6366f1',
]
const TOTAL_COLOR = '#6b7280'

// ── Icons ─────────────────────────────────────────────────────────────────────
const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

// ── Data pivot ────────────────────────────────────────────────────────────────

/**
 * Detect whether the data uses the simulation format (etnia/Total sentinels)
 * or the legacy Excel format (sexo/Todos/as sentinels).
 */
function isSimFormat(rows: StratifiedRow[]): boolean {
  return rows.length > 0 && rows[0].etnia !== undefined
}

function pivotData(rows: StratifiedRow[], stratifier: Stratifier) {
  let filtered: StratifiedRow[]
  const sim = isSimFormat(rows)

  if (stratifier === 'total') {
    filtered = sim
      ? rows.filter((r) => r.etnia === TOTAL_ETNIA && r.zona === TOTAL_ZONA_SIM)
      : rows.filter(
          (r) =>
            r.sexo === TOTAL_SEXO &&
            r.grupo_edad === TOTAL_EDAD &&
            r.zona === TOTAL_ZONA_LEGACY,
        )
  } else if (stratifier === 'etnia') {
    filtered = rows.filter(
      (r) => r.zona === TOTAL_ZONA_SIM && r.etnia !== TOTAL_ETNIA,
    )
  } else if (stratifier === 'sexo') {
    filtered = rows.filter(
      (r) =>
        r.grupo_edad === TOTAL_EDAD &&
        r.zona === TOTAL_ZONA_LEGACY &&
        r.sexo !== TOTAL_SEXO,
    )
  } else if (stratifier === 'grupo_edad') {
    filtered = rows.filter(
      (r) =>
        r.sexo === TOTAL_SEXO &&
        r.zona === TOTAL_ZONA_LEGACY &&
        r.grupo_edad !== TOTAL_EDAD,
    )
  } else {
    // zona
    filtered = sim
      ? rows.filter((r) => r.etnia === TOTAL_ETNIA && r.zona !== TOTAL_ZONA_SIM)
      : rows.filter(
          (r) =>
            r.sexo === TOTAL_SEXO &&
            r.grupo_edad === TOTAL_EDAD &&
            r.zona !== TOTAL_ZONA_LEGACY,
        )
  }

  const byYear = new Map<number, Record<string, number>>()
  const keySet = new Set<string>()

  for (const row of filtered) {
    const key =
      stratifier === 'total'
        ? 'Total'
        : stratifier === 'etnia'
          ? (row.etnia ?? '')
          : stratifier === 'sexo'
            ? (row.sexo ?? '')
            : stratifier === 'grupo_edad'
              ? (row.grupo_edad ?? '')
              : row.zona

    keySet.add(key)
    if (!byYear.has(row.anio)) byYear.set(row.anio, { anio: row.anio })
    byYear.get(row.anio)![key] = row.valor * 100
  }

  const chartData = Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([anio, vals]) => ({ anio, ...vals }))

  // Sort keys: age groups numerically, others alphabetically
  const keys = Array.from(keySet).sort((a, b) => {
    const na = parseInt(a)
    const nb = parseInt(b)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.localeCompare(b, 'es')
  })

  const lines = keys.map((key, i) => ({
    dataKey: key,
    name: key,
    color:
      stratifier === 'total'
        ? TOTAL_COLOR
        : stratifier === 'etnia'
          ? (ETNIA_COLORS[key] ?? AGE_COLORS[i % AGE_COLORS.length])
          : stratifier === 'sexo'
            ? (SEX_COLORS[key] ?? '#8b5cf6')
            : stratifier === 'zona'
              ? (ZONA_COLORS[key] ?? AGE_COLORS[i % AGE_COLORS.length])
              : AGE_COLORS[i % AGE_COLORS.length],
  }))

  return { chartData, lines, keys }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface StratifiedLineChartProps {
  data: StratifiedRow[]
  stratifiers?: IndicatorStratifier[]
  yAxisLabel?: string
  csvPath?: string
}

export const StratifiedLineChart = ({
  data,
  stratifiers,
  yAxisLabel = 'Valor',
  csvPath,
}: StratifiedLineChartProps) => {
  const [stratifier, setStratifier] = useState<Stratifier>('total')
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const chartRef = useRef<HTMLDivElement>(null)

  // ── Year selection (shared between chart highlight and map) ───────────────
  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return []
    return [...new Set(data.map((r) => r.anio))].sort((a, b) => b - a)
  }, [data])

  const lastYear = availableYears[0] ?? null
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const effectiveYear: number | null = selectedYear ?? lastYear

  const { chartData, lines, keys } = useMemo(
    () => pivotData(data, stratifier),
    [data, stratifier],
  )

  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 italic py-8 text-center">
        No hay datos disponibles.
      </p>
    )
  }

  const ALL_STRATIFIER_OPTIONS: { value: Stratifier; label: string }[] = [
    { value: 'total', label: 'Total' },
    { value: 'zona', label: 'Zona' },
    { value: 'etnia', label: 'Etnia' },
    { value: 'sexo', label: 'Sexo' },
    { value: 'grupo_edad', label: 'Grupo de Edad' },
  ]

  const STRATIFIER_OPTIONS = stratifiers
    ? ALL_STRATIFIER_OPTIONS.filter(
        (opt) =>
          opt.value === 'total' ||
          (stratifiers as string[]).includes(opt.value),
      )
    : ALL_STRATIFIER_OPTIONS

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      {/* ── Sticky year selector ─────────────────────────────────────────────── */}
      {availableYears.length > 1 && (
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm py-2 border-b border-gray-100 -mx-2 px-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 overflow-x-auto mb-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm w-fit">
            {availableYears.map((yr) => {
              const isActive = yr === effectiveYear
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    const next = yr === lastYear ? null : yr
                    setSelectedYear(next)
                  }}
                  className={`px-3 py-1 text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {yr}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Stratifier selector ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between gap-1 mb-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
          <button
            type="button"
            onClick={() => setView('chart')}
            className={`px-4 py-1.5 transition-colors ${
              view === 'chart'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Gráfico
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            className={`px-4 py-1.5 transition-colors ${
              view === 'table'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tabla
          </button>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
          {STRATIFIER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStratifier(value)}
              className={`px-4 py-1.5 transition-colors ${
                stratifier === value
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {csvPath && (
          <a
            href={csvPath}
            download
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <DownloadIcon />
            Descargar tabla
          </a>
        )}
      </div>

      {/* ── Chart or Table ─────────────────────────────────────────────────── */}
      {view === 'chart' ? (
        <ExpandablePanel className="relative border rounded-lg px-4 pt-6">
          {(isFullscreen) => (
            <div ref={chartRef}>
              <DSLineChart
                data={chartData}
                xAxisKey="anio"
                lines={lines}
                height={
                  isFullscreen ? Math.max(300, window.innerHeight - 200) : 400
                }
                xAxisLabel="Año"
                yAxisLabel={yAxisLabel}
                yAxisDomain={[0, 100]}
                highlightX={effectiveYear ?? undefined}
              />
            </div>
          )}
        </ExpandablePanel>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">Año</th>
                {keys.map((k) => (
                  <th key={k} className="px-4 py-3 font-medium">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chartData.map((row) => (
                <tr
                  key={row.anio}
                  className="bg-white hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.anio}
                  </td>
                  {keys.map((k) => {
                    const value = (row as Record<string, unknown>)[k]
                    return (
                      <td key={k} className="px-4 py-3 text-gray-600">
                        {typeof value === 'number' ? value.toFixed(1) : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
