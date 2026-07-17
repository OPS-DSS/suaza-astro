import { useState, useMemo, useRef } from 'react'
import { DSLineChart } from '@ops-dss/charts/line-chart'
import type { StratifiedRow } from '@/lib/parquet'
import type { IndicatorStratifier } from '@/lib/indicators'
import { ExpandablePanel } from '../ExpandablePanel'
import { Icon } from '@iconify/react'

const TOTAL = 'Total'

// ── Stratifier type ───────────────────────────────────────────────────────────
type Stratifier = 'total' | 'regimen'

// ── Colour palettes ───────────────────────────────────────────────────────────
const REGIMEN_COLORS: Record<string, string> = {
  Contributivo: '#3b82f6',
  Subsidiado: '#ec4899',
  Excepción: '#f97316',
}
const TOTAL_COLOR = '#6b7280'

// ── Data pivot ────────────────────────────────────────────────────────────────

function pivotData(rows: StratifiedRow[], stratifier: Stratifier) {
  let filtered: StratifiedRow[]

  if (stratifier === 'total') {
    filtered = rows.filter((r) => r.regimen === TOTAL)
  } else {
    filtered = rows.filter((r) => r.regimen !== TOTAL)
  }

  const byYear = new Map<number, Record<string, number>>()
  const keySet = new Set<string>()

  for (const row of filtered) {
    const key = stratifier === 'total' ? 'Total' : row.regimen

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

  const lines = keys.map((key) => ({
    dataKey: key,
    name: key,
    color: stratifier === 'total' ? TOTAL_COLOR : REGIMEN_COLORS[key],
  }))

  return { chartData, lines, keys }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface StratifiedLineChartProps {
  data: StratifiedRow[]
  stratifiers?: IndicatorStratifier[]
  yAxisLabel?: string
  csvPath?: string
  geojsonUrls?: Record<number, string>
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
    { value: 'regimen', label: 'Régimen' },
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
            <Icon icon="mdi:download" className="size-4 opacity-50" />
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
