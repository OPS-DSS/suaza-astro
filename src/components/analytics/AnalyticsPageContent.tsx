import { useState, useMemo } from 'react'
import { DSForestPlot } from '@ops-dss/charts/forest-plot'
import { AnalyticsDualChart } from './AnalyticsDualChart'
import { ExpandablePanel } from '@/components/ExpandablePanel'
import { type AnalyticsIndicatorKey } from '@/lib/indicators'
import type { ForestPlotDataRow, AnalyticsRow } from '@/lib/parquet'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalyticsPageContentProps {
  forestPlotData?: ForestPlotDataRow[]
  analyticsData?: AnalyticsRow[]
}

// ── Main component ────────────────────────────────────────────────────────────

export const AnalyticsPageContent = ({
  forestPlotData,
  analyticsData,
}: AnalyticsPageContentProps) => {
  const [selectedIndicator, setSelectedIndicator] =
    useState<AnalyticsIndicatorKey>('cobertura_bruta')

  // ── Derived values ─────────────────────────────────────────────────────────

  const hasData =
    (forestPlotData && forestPlotData.length > 0) ||
    (analyticsData && analyticsData.length > 0)

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
      <div className="flex flex-col md:flex-row gap-4">
        {/* ── Forest plot ── */}
        {forestPlotData && forestPlotData.length > 0 && (
          <ExpandablePanel className="flex flex-col md:basis-1/2 flex-1 gap-4 relative border rounded-lg p-4">
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
          <ExpandablePanel className="relative  md:basis-1/2 border rounded-lg p-4 flex flex-col gap-4">
            {(isFullscreen) => (
              <AnalyticsDualChart
                data={analyticsData}
                selectedIndicator={selectedIndicator}
                isFullscreen={isFullscreen}
              />
            )}
          </ExpandablePanel>
        )}
      </div>
    </div>
  )
}
