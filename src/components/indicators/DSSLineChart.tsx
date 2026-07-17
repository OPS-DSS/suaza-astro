import { useState, useRef } from 'react'
import { DSLineChart } from '@ops-dss/charts/line-chart'
import type { SimpleRow } from '@/lib/parquet'
import { ExpandablePanel } from '../ExpandablePanel'
import { Icon } from '@iconify/react'

interface StratifiedLineChartProps {
  data: SimpleRow[]
  yAxisLabel?: string
  csvPath?: string
}

export const DSSLineChart = ({
  data,
  yAxisLabel = 'Valor',
  csvPath,
}: StratifiedLineChartProps) => {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const chartRef = useRef<HTMLDivElement>(null)

  if (!data || data.length === 0) {
    return (
      <p className="text-gray-500 italic py-8 text-center">
        No hay datos disponibles.
      </p>
    )
  }

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
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
      {view === 'chart' ? (
        <ExpandablePanel className="relative border rounded-lg px-4 pt-6">
          {(isFullscreen) => (
            <div ref={chartRef}>
              <DSLineChart
                data={data}
                xAxisKey="anio"
                lines={[
                  { dataKey: 'valor', name: yAxisLabel, color: undefined },
                ]}
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
                <th className="px-4 py-3 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => (
                <tr
                  key={row.anio}
                  className="bg-white hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.anio}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.valor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
