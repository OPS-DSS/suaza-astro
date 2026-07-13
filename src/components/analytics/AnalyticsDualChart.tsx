import { DSLineChart } from '@ops-dss/charts/line-chart'
import type { LineChartData } from '@ops-dss/charts/line-chart'
import type { AnalyticsMaternalRow } from '@/lib/parquet'
import {
  ANALYTICS_INDICATORS,
  type AnalyticsIndicatorKey,
} from './mockIndicators'

interface AnalyticsDualChartProps {
  data: AnalyticsMaternalRow[]
  selectedIndicator?: AnalyticsIndicatorKey
  selectedYear?: number | null
  isFullscreen?: boolean
}

/**
 * Two vertically stacked line charts:
 *   - Top: Mortalidad materna (San Martin del Valle, por 100.000 NV)
 *   - Bottom: Selected education indicator (San Martin del Valle weighted mean)
 */
export const AnalyticsDualChart = ({
  data,
  selectedIndicator = 'traslado',
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

  const indicatorMeta = ANALYTICS_INDICATORS[selectedIndicator]
  const mortalityData = data.map((row) => ({
    anio: row.anio,
    valor: row.valor,
  }))
  const indicatorData: LineChartData[] = data.flatMap((row) => {
    const raw = row[selectedIndicator]

    return raw == null
      ? []
      : [
          {
            anio: row.anio,
            [selectedIndicator]: raw * 100,
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
            data={mortalityData}
            xAxisKey="anio"
            lines={[
              {
                dataKey: 'valor',
                name: 'Mortalidad materna (×100k NV)',
                color: '#e11d48',
              },
            ]}
            height={chartHeight}
            xAxisLabel="Año"
            yAxisLabel="Mortalidad materna (×100k NV)"
            yAxisDomain={[0, 100]}
            highlightX={selectedYear ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-2">
          <DSLineChart
            data={indicatorData}
            xAxisKey="anio"
            lines={[
              {
                dataKey: selectedIndicator,
                name: indicatorMeta.label,
                color: indicatorMeta.color,
              },
            ]}
            height={chartHeight}
            xAxisLabel="Año"
            yAxisLabel={indicatorMeta.axisLabel}
            yAxisDomain={[0, 100]}
            highlightX={selectedYear ?? undefined}
          />
        </div>
      </div>
    </div>
  )
}
