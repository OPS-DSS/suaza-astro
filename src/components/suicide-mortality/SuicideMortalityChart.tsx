import { useState, useMemo } from 'react'
import { DSLineChart } from '@ops-dss/charts/line-chart'
import type { SuicideMortalityRateRow } from '@/lib/parquet'
import { ExpandablePanel } from '@/components/ExpandablePanel'

// ── Aggregate label constants (must match R mock script) ──────────────────────
const TOTAL_SEXO = 'Total'
const SMV = 'Suaza'

// ── Stratifier type ───────────────────────────────────────────────────────────
export type Stratifier = 'total' | 'sexo'

// ── Colour palettes ───────────────────────────────────────────────────────────
const SEXO_COLORS: Record<string, string> = {
  Femenino: '#8b5cf6',
  Masculino: '#06b6d4',
}

// Explicit ordering for consistent legend/table display across renders
const SEXO_ORDER = ['Femenino', 'Masculino']
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

function pivotData(rows: SuicideMortalityRateRow[], stratifier: Stratifier) {
  // Only municipality-level aggregates
  const smvRows = rows.filter((r) => r.territorio === SMV)

  let filtered: SuicideMortalityRateRow[]

  if (stratifier === 'total') {
    filtered = smvRows.filter((r) => r.sexo === TOTAL_SEXO)
  } else {
    filtered = smvRows.filter((r) => r.sexo !== TOTAL_SEXO)
  }

  const byYear = new Map<number, Record<string, number>>()
  const keySet = new Set<string>()

  for (const row of filtered) {
    const key = stratifier === 'total' ? SMV : row.sexo

    keySet.add(key)
    if (!byYear.has(row.anio)) byYear.set(row.anio, {})
    byYear.get(row.anio)![key] = row.valor
  }

  const chartData = Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([anio, vals]) => ({ anio, ...vals }))

  const orderArray = stratifier === 'sexo' ? SEXO_ORDER : null

  const keys = Array.from(keySet).sort((a, b) => {
    if (orderArray) return orderArray.indexOf(a) - orderArray.indexOf(b)
    return a.localeCompare(b, 'es')
  })

  const lines = keys.map((key) => ({
    dataKey: key,
    name: key,
    color:
      stratifier === 'total' ? TOTAL_COLOR : (SEXO_COLORS[key] ?? '#6b7280'),
  }))

  return { chartData, lines, keys }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface SuicideMortalityChartProps {
  data: SuicideMortalityRateRow[]
  csvPath?: string
  highlightYear?: number
  stratifier: Stratifier
  onStratifierChange: (s: Stratifier) => void
}

const STRATIFIER_OPTIONS: { value: Stratifier; label: string }[] = [
  { value: 'total', label: 'Total' },
  { value: 'sexo', label: 'Sexo' },
]

export const SuicideMortalityChart = ({
  data,
  csvPath,
  highlightYear,
  stratifier,
  onStratifierChange: setStratifier,
}: SuicideMortalityChartProps) => {
  const [view, setView] = useState<'chart' | 'table'>('chart')

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

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
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

          {/* ── Stratifier selector ──────────────────────────────────────────────── */}
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

          <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* ── Chart or Table ─────────────────────────────────────────────────── */}
      {view === 'chart' ? (
        <ExpandablePanel className="relative border rounded-lg px-4 pt-6">
          {(isFullscreen) => (
            <div>
              <DSLineChart
                data={chartData}
                xAxisKey="anio"
                lines={lines}
                height={
                  isFullscreen ? Math.max(300, window.innerHeight - 200) : 400
                }
                xAxisLabel="Año"
                yAxisLabel="Tasa (×100.000 NV)"
                yAxisDomain={[0, 100]}
                highlightX={highlightYear}
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
