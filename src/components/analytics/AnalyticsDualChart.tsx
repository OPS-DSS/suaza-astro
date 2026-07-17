import { DSLineChart } from '@ops-dss/charts/line-chart'
import type { LineChartData } from '@ops-dss/charts/line-chart'
import type { AnalyticsRow } from '@/lib/parquet'
import {
  indicatorsBySlug,
  type AnalyticsIndicatorKey,
} from '@/lib/indicators'

interface AnalyticsDualChartProps {
  data: AnalyticsRow[]
  selectedIndicator?: AnalyticsIndicatorKey
  selectedYear?: number | null
  isFullscreen?: boolean
}

/**
 * Two vertically stacked line charts:
 *   - Top: Mortalidad materna (Suaza, por 100.000 NV)
 *   - Bottom: Selected education indicator (Suaza weighted mean)
 */
export const AnalyticsDualChart = ({
  data,
  selectedIndicator = 'cobertura_bruta',
  selectedYear,
  isFullscreen = false,
}: AnalyticsDualChartProps) => {
  const chartHeight = isFullscreen
    ? Math.max(180, Math.floor((window.innerHeight - 260) / 2))
    : 320
  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 italic py-8 text-center">
        No hay datos disponibles.
      </p>
    )
  }

  const indicatorMeta = indicatorsBySlug[selectedIndicator]
  const mortalityData = data.map((row) => ({
    anio: row.anio,
    valor: row.valor,
  }))
  const indicatorData: LineChartData[] = data.flatMap((row) => {
    const raw = row[selectedIndicator]

    return raw == null || !Number.isFinite(raw)
      ? []
      : [
          {
            anio: row.anio,
            [selectedIndicator]: raw,
          },
        ]
  })

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900 mr-8">
        Tendencias temporales
      </h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <DSLineChart
            data={mortalityData as LineChartData[]}
            xAxisKey="anio"
            lines={[
              {
                dataKey: 'valor',
                name: 'Mortalidad por suicidio (×100k NV)',
                color: '#e11d48',
              },
            ]}
            height={chartHeight}
            xAxisLabel="Año"
            yAxisLabel="Mortalidad por suicidio (×100k NV)"
            highlightX={selectedYear ?? undefined}
            yAxisDomain={[0, 100]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <DSLineChart
            data={indicatorData}
            xAxisKey="anio"
            lines={[
              {
                dataKey: selectedIndicator,
                name: indicatorMeta.label ?? indicatorMeta.title,
                color: indicatorMeta.color,
              },
            ]}
            height={chartHeight}
            xAxisLabel="Año"
            yAxisLabel={indicatorMeta.axisLabel}
            highlightX={selectedYear ?? undefined}
            yAxisDomain={[0, 100]}
          />
        </div>
      </div>
    </div>
  )
}
