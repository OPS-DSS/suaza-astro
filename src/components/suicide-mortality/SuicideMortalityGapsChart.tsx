import { useState, useMemo } from 'react'
import { DSQuintilBarChart } from '@ops-dss/charts/quintil-bar-chart'
import { DSCILineChart } from '@ops-dss/charts/ci-line-chart'
import type {
  SuicideMortalityQuintilRow,
  SuicideMortalityGapsRow,
} from '@/lib/parquet'

interface SuicideMortalityGapsChartProps {
  quintilData: SuicideMortalityQuintilRow[]
  gapsData: SuicideMortalityGapsRow[]
  metric: 'brecha_absoluta' | 'brecha_relativa'
  onMetricChange: (m: 'brecha_absoluta' | 'brecha_relativa') => void
  quintilCsvPath?: string
  gapsCsvPath?: string
}

type ViewMode = 'chart' | 'table'

// ── Download buttons ───────────────────────────────────────────────────────────

const DownloadButton = ({ href }: { href: string }) => (
  <a
    href={href}
    download
    className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
  >
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
    Descargar tabla
  </a>
)

// ── View toggle ────────────────────────────────────────────────────────────────

const ViewToggle = ({
  view,
  onChange,
}: {
  view: ViewMode
  onChange: (v: ViewMode) => void
}) => (
  <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
    {(['chart', 'table'] as const).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-4 py-1.5 transition-colors ${
          view === v
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        {v === 'chart' ? 'Gráfico' : 'Tabla'}
      </button>
    ))}
  </div>
)

// ── Metric toggle ──────────────────────────────────────────────────────────────

const MetricToggle = ({
  metric,
  onChange,
}: {
  metric: 'brecha_absoluta' | 'brecha_relativa'
  onChange: (m: 'brecha_absoluta' | 'brecha_relativa') => void
}) => (
  <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
    <button
      onClick={() => onChange('brecha_absoluta')}
      className={`px-4 py-1.5 transition-colors ${
        metric === 'brecha_absoluta'
          ? 'bg-gray-800 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      Brecha Absoluta
    </button>
    <button
      onClick={() => onChange('brecha_relativa')}
      className={`px-4 py-1.5 transition-colors ${
        metric === 'brecha_relativa'
          ? 'bg-gray-800 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      Brecha Relativa
    </button>
  </div>
)

// ── Main component ─────────────────────────────────────────────────────────────

export const SuicideMortalityGapsChart = ({
  quintilData,
  gapsData,
  metric,
  onMetricChange,
  quintilCsvPath,
  gapsCsvPath,
}: SuicideMortalityGapsChartProps) => {
  const [quintilView, setQuintilView] = useState<ViewMode>('chart')
  const [gapsView, setGapsView] = useState<ViewMode>('chart')
  // Latest year for the quintil bar chart
  const lastYear = useMemo(
    () =>
      quintilData.length > 0
        ? Math.max(...quintilData.map((r) => r.anio))
        : null,
    [quintilData],
  )

  const lastYearQuintils = useMemo(
    () =>
      lastYear !== null
        ? quintilData
            .filter((r) => r.anio === lastYear)
            .sort((a, b) => a.quintil_dss - b.quintil_dss)
        : [],
    [quintilData, lastYear],
  )

  const quintilChartData = lastYearQuintils.map((r) => ({
    quintil: r.quintil_dss,
    tasa_ponderada: r.tasa_ponderada,
    ic_inf: Number.isFinite(r.ic_inf) ? r.ic_inf : r.tasa_ponderada,
    ic_sup: Number.isFinite(r.ic_sup) ? r.ic_sup : r.tasa_ponderada,
  }))

  // Gaps over time — select the active metric
  const isAbs = metric === 'brecha_absoluta'
  const gapsChartData = gapsData.map((r) => ({
    anio: r.anio,
    valor: isAbs ? r.brecha_absoluta : r.brecha_relativa,
    ic_inf: isAbs ? r.ic_inf_abs : r.ic_inf_rel,
    ic_sup: isAbs ? r.ic_sup_abs : r.ic_sup_rel,
  }))

  const hasQuintilData = lastYearQuintils.length > 0
  const hasGapsData = gapsData.length > 0

  return (
    <div className="flex flex-col gap-8">
      {/* ── Section 1: Quintil bar chart ───────────────────────────────────── */}
      <div>
        <div className="py-4">
          <h2 className="text-xl font-bold">
            Tasa de mortalidad por suicidio por quintil de deserción escolar
          </h2>
          {lastYear !== null && (
            <p className="text-sm text-gray-500 mt-1">
              Último año disponible: {lastYear}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <ViewToggle view={quintilView} onChange={setQuintilView} />
          <div className="flex items-center gap-2">
            {quintilCsvPath && <DownloadButton href={quintilCsvPath} />}
          </div>
        </div>

        {!hasQuintilData ? (
          <p className="text-gray-500 italic py-8 text-center">
            No hay datos disponibles.
          </p>
        ) : quintilView === 'chart' ? (
          <div>
            <DSQuintilBarChart
              data={quintilChartData}
              height={400}
              yAxisLabel="Tasa (×100.000 NV)"
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Quintil DSS</th>
                  <th className="px-4 py-3 font-medium">
                    Tasa ponderada (x 100.000 NV)
                  </th>
                  <th className="px-4 py-3 font-medium">IC 95% inferior</th>
                  <th className="px-4 py-3 font-medium">IC 95% superior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lastYearQuintils.map((row) => (
                  <tr
                    key={row.quintil_dss}
                    className="bg-white hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.quintil_dss}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.tasa_ponderada.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {Number.isFinite(row.ic_inf)
                        ? row.ic_inf.toFixed(2)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {Number.isFinite(row.ic_sup)
                        ? row.ic_sup.toFixed(2)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section 2: Brecha over time ────────────────────────────────────── */}
      <div>
        <div className="py-4">
          <h2 className="text-xl font-bold">
            {isAbs
              ? 'Brecha Absoluta (Q5 − Q1) por año'
              : 'Brecha Relativa (Q5 / Q1) por año'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAbs
              ? 'Diferencia en tasas de mortalidad materna entre el quintil con mayor y menor deserción escolar'
              : 'Razón de tasas de mortalidad materna entre el quintil con mayor y menor deserción escolar'}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <ViewToggle view={gapsView} onChange={setGapsView} />
            <MetricToggle metric={metric} onChange={onMetricChange} />
          </div>
          <div className="flex items-center gap-2">
            {gapsCsvPath && <DownloadButton href={gapsCsvPath} />}
          </div>
        </div>

        {!hasGapsData ? (
          <p className="text-gray-500 italic py-8 text-center">
            No hay datos disponibles.
          </p>
        ) : gapsView === 'chart' ? (
          <div>
            <DSCILineChart
              data={gapsChartData.map((d) => ({
                x: d.anio,
                valor: Number.isFinite(d.valor) ? d.valor : null,
                ic_inf: Number.isFinite(d.ic_inf) ? d.ic_inf : null,
                ic_sup: Number.isFinite(d.ic_sup) ? d.ic_sup : null,
              }))}
              xAxisKey="x"
              valueLabel={isAbs ? 'Brecha absoluta' : 'Brecha relativa'}
              referenceLine={isAbs ? 0 : 1}
              decimals={isAbs ? 1 : 2}
              xAxisLabel="Año"
              yAxisLabel={isAbs ? 'Brecha (×100.000 NV)' : 'Razón Q5/Q1'}
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Año</th>
                  <th className="px-4 py-3 font-medium">
                    {isAbs ? 'Brecha absoluta' : 'Brecha relativa'}
                  </th>
                  <th className="px-4 py-3 font-medium">IC 95% inferior</th>
                  <th className="px-4 py-3 font-medium">IC 95% superior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gapsData.map((row) => {
                  const val = isAbs ? row.brecha_absoluta : row.brecha_relativa
                  const lo = isAbs ? row.ic_inf_abs : row.ic_inf_rel
                  const hi = isAbs ? row.ic_sup_abs : row.ic_sup_rel
                  return (
                    <tr
                      key={row.anio}
                      className="bg-white hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {row.anio}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {Number.isFinite(val) ? val.toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {Number.isFinite(lo) ? lo.toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {Number.isFinite(hi) ? hi.toFixed(2) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
