import { useState, useEffect, useMemo } from 'react'
import { DSForestPlot } from '@ops-dss/charts/forest-plot'
import { DSScatterChart } from '@ops-dss/charts/scatter-chart'
import { AnalyticsDualChart } from './AnalyticsDualChart'
import { ExpandablePanel } from '@/components/ExpandablePanel'
import {
  ANALYTICS_INDICATORS,
  type AnalyticsIndicatorKey,
} from './mockIndicators'
import type {
  ForestPlotDataRow,
  AnalyticsMaternalRow,
  ScatterMaternalRow,
} from '@/lib/parquet'

// ── Constants ─────────────────────────────────────────────────────────────────

const MATERNAL_LABEL = 'Mortalidad materna (x100k NV)'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalyticsPageContentProps {
  forestPlotData?: ForestPlotDataRow[]
  analyticsMaternalData?: AnalyticsMaternalRow[]
  scatterMaternalData?: ScatterMaternalRow[]
}

// ── Main component ────────────────────────────────────────────────────────────

export const AnalyticsPageContent = ({
  forestPlotData,
  analyticsMaternalData,
  scatterMaternalData,
}: AnalyticsPageContentProps) => {
  const [selectedIndicator, setSelectedIndicator] =
    useState<AnalyticsIndicatorKey>('traslado')

  // ── Year selection ──────────────────────────────────────────────────────────

  // Derive available years from scatter data (sorted descending for display)
  const availableYears = useMemo(() => {
    if (!scatterMaternalData || scatterMaternalData.length === 0) return []
    const years = [...new Set(scatterMaternalData.map((r) => r.anio))].sort(
      (a, b) => b - a,
    )
    return years
  }, [scatterMaternalData])

  const lastYear = availableYears[0] ?? null

  // selectedYear === null means "use lastYear" (default, pre-selected)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const effectiveYear: number | null = selectedYear ?? lastYear

  // ── Derived values ─────────────────────────────────────────────────────────

  const hasData =
    (forestPlotData && forestPlotData.length > 0) ||
    (analyticsMaternalData && analyticsMaternalData.length > 0) ||
    (scatterMaternalData && scatterMaternalData.length > 0)

  const selectedMeta = ANALYTICS_INDICATORS[selectedIndicator]

  // Forest plot: filter to the selected year; rows without data for this year
  // are simply absent (the R script skips indicator-year combos with n < 4).
  const forestPlotForYear = useMemo(() => {
    if (!forestPlotData || effectiveYear === null) return forestPlotData ?? []
    return forestPlotData.filter((r) => r.anio === effectiveYear)
  }, [forestPlotData, effectiveYear])

  const scatterPoints =
    scatterMaternalData && effectiveYear !== null
      ? scatterMaternalData
          .filter((r) => r.anio === effectiveYear)
          .map((r) => ({
            x: (r[selectedIndicator] as number) * 100,
            y: r.valor,
            label: r.territorio,
            size: r.nacimientos,
          }))
          .filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y))
      : []

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
                Correlaciones con mortalidad materna
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Correlación de Spearman entre cada indicador y la mortalidad
                materna (barrios de San Martín del Valle,{' '}
                {effectiveYear !== null
                  ? `año ${effectiveYear}`
                  : 'último año disponible'}
                ). Haz clic en un indicador para explorar su relación.
              </p>
              {forestPlotForYear.length > 0 ? (
                <DSForestPlot
                  data={forestPlotForYear}
                  selectedIndicator={selectedIndicator}
                  onSelectIndicator={(ind) =>
                    setSelectedIndicator(ind as AnalyticsIndicatorKey)
                  }
                />
              ) : (
                <p className="text-gray-400 italic text-sm py-6 text-center">
                  Sin datos suficientes para {effectiveYear}.
                </p>
              )}
            </ExpandablePanel>
          )}

          {/* ── Temporal trends ── */}
          {analyticsMaternalData && analyticsMaternalData.length > 0 && (
            <ExpandablePanel className="relative border rounded-lg p-4 flex flex-col gap-4">
              {(isFullscreen) => (
                <AnalyticsDualChart
                  data={analyticsMaternalData}
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
                  vs Mortalidad materna (x100k NV)
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Cada punto es un barrio de San Martín del Valle (
                  {effectiveYear !== null
                    ? `año ${effectiveYear}`
                    : 'último año disponible'}
                  ). El tamaño refleja el número de nacidos vivos. La línea
                  punteada muestra la tendencia lineal.
                </p>
              </div>
              <DSScatterChart
                data={scatterPoints}
                xLabel={selectedMeta.axisLabel}
                yLabel="Mortalidad materna (×100k NV)"
                width={800}
              />
            </ExpandablePanel>
          )}
        </div>
      </div>
    </div>
  )
}
