import { useState, useMemo } from 'react'
import { DSForestPlot } from '@ops-dss/charts/forest-plot'
import { DSScatterChart } from '@ops-dss/charts/scatter-chart'
import { AnalyticsDualChart } from './AnalyticsDualChart'
import { ExpandablePanel } from '@/components/ExpandablePanel'
import {
  ANALYTICS_INDICATORS,
  type AnalyticsIndicatorKey,
} from './mockIndicators'
import type { ForestPlotDataRow, AnalyticsRow, ScatterRow } from '@/lib/parquet'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalyticsPageContentProps {
  forestPlotData?: ForestPlotDataRow[]
  analyticsData?: AnalyticsRow[]
  scatterData?: ScatterRow[]
}

// ── Main component ────────────────────────────────────────────────────────────

export const AnalyticsPageContent = ({
  forestPlotData,
  analyticsData,
  scatterData,
}: AnalyticsPageContentProps) => {
  const [selectedIndicator, setSelectedIndicator] =
    useState<AnalyticsIndicatorKey>('cobertura_bruta')

  // ── Year selection ──────────────────────────────────────────────────────────

  // Derive available years from scatter data (sorted descending for display)
  const availableYears = useMemo(() => {
    if (!scatterData || scatterData.length === 0) return []
    const years = [...new Set(scatterData.map((r) => r.anio))].sort(
      (a, b) => b - a,
    )
    return years
  }, [scatterData])

  const lastYear = availableYears[0] ?? null

  // selectedYear === null means "use lastYear" (default, pre-selected)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const effectiveYear: number | null = selectedYear ?? lastYear

  // ── Derived values ─────────────────────────────────────────────────────────

  const hasData =
    (forestPlotData && forestPlotData.length > 0) ||
    (analyticsData && analyticsData.length > 0) ||
    (scatterData && scatterData.length > 0)

  const selectedMeta = ANALYTICS_INDICATORS[selectedIndicator]

  // Scatter: one point per year for the selected indicator (x = indicator
  // value that year, y = suicide mortality that year). The data is
  // municipality-level (Suaza only), so there is no barrio breakdown anymore.
  const scatterPoints = useMemo(() => {
    if (!scatterData) return []
    return scatterData
      .filter((r) => r.indicador === selectedIndicator)
      .map((r) => ({
        x: r.valor_indicador,
        y: r.valor_suicidio,
        label: String(r.anio),
      }))
      .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y))
  }, [scatterData, selectedIndicator])

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!hasData) {
    return (
      <p className="text-gray-500 italic py-8 text-center">
        No hay datos disponibles.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 mb-10">
      {/* ── Year selector ── */}
      {availableYears.length > 1 && (
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm py-2 border-b border-gray-100 -mx-2 px-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 overflow-x-auto">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm w-fit">
            {availableYears.map((yr) => {
              const isActive = yr === effectiveYear
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr === lastYear ? null : yr)}
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col md:basis-1/2 flex-1 gap-4">
          {/* ── Forest plot ── */}
          {forestPlotData && forestPlotData.length > 0 && (
            <ExpandablePanel>
              <h2 className="text-xl font-bold text-gray-900 mr-8">
                Correlaciones con mortalidad por suicidio
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Correlación de Spearman entre cada indicador y la mortalidad por
                suicidio. Haz clic en un indicador para explorar su relación.
              </p>
              <DSForestPlot
                data={forestPlotData}
                selectedIndicator={selectedIndicator}
                onSelectIndicator={(ind) =>
                  setSelectedIndicator(ind as AnalyticsIndicatorKey)
                }
              />
            </ExpandablePanel>
          )}

          {/* ── Temporal trends ── */}
          {analyticsData && analyticsData.length > 0 && (
            <ExpandablePanel className="relative border rounded-lg p-4 flex flex-col gap-4">
              {(isFullscreen) => (
                <AnalyticsDualChart
                  data={analyticsData}
                  selectedIndicator={selectedIndicator}
                  selectedYear={effectiveYear}
                  isFullscreen={isFullscreen}
                />
              )}
            </ExpandablePanel>
          )}
        </div>

        <div className="flex flex-col md:basis-1/2 gap-4 flex-1">
          {/* ── Scatter chart ── */}
          {scatterPoints.length > 0 && (
            <ExpandablePanel className="relative border rounded-lg p-4 flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mr-8">
                  Dispersión:{' '}
                  <span style={{ color: selectedMeta.color }}>
                    {selectedMeta.title}
                  </span>{' '}
                  vs Mortalidad por suicidio (x100k NV)
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Cada punto es un año en el municipio de Suaza. La línea
                  punteada muestra la tendencia lineal.
                </p>
              </div>
              <DSScatterChart
                data={scatterPoints}
                xLabel={selectedMeta.axisLabel}
                yLabel="Mortalidad por suicidio (×100k NV)"
                width={800}
              />
            </ExpandablePanel>
          )}
        </div>
      </div>
    </div>
  )
}
