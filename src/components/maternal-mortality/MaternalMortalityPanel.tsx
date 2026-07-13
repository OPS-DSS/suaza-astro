'use client'

import { useState, useMemo } from 'react'
import { MaternalMortalityChart } from './MaternalMortalityChart'
import type { Stratifier } from './MaternalMortalityChart'
import { MaternalMortalityEthnicGapsChart } from './MaternalMortalityEthnicGapsChart'
import { MaternalMortalityZoneGapsChart } from './MaternalMortalityZoneGapsChart'
import type { MaternalMortalityRateRow } from '@/lib/parquet'

const SMV = 'San Martín del Valle'
const TOTAL_ZONA = 'Total'
const TOTAL_ETNIA = 'Total'

interface MaternalMortalityPanelProps {
  data: MaternalMortalityRateRow[]
  csvPath?: string
}

export const MaternalMortalityPanel = ({
  data,
  csvPath,
}: MaternalMortalityPanelProps) => {
  const availableYears = useMemo(() => {
    const smvRows = data.filter(
      (r) =>
        r.territorio === SMV && r.zona === TOTAL_ZONA && r.etnia === TOTAL_ETNIA,
    )
    return [...new Set(smvRows.map((r) => r.anio))].sort((a, b) => b - a)
  }, [data])

  const lastYear = availableYears[0] ?? null
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const effectiveYear = selectedYear ?? lastYear

  const [stratifier, setStratifier] = useState<Stratifier>('total')

  return (
    <div className="flex flex-col gap-10">
      {/* ── Sticky year selector ──────────────────────────────────────────────── */}
      {availableYears.length > 1 && (
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm py-2 border-b border-gray-100 -mx-2 px-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 overflow-x-auto">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm w-fit">
            {availableYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr === lastYear ? null : yr)}
                className={`px-3 py-1 transition-colors ${
                  yr === effectiveYear
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Temporal trend chart ───────────────────────────────────────────────── */}
      <MaternalMortalityChart
        data={data}
        csvPath={csvPath}
        highlightYear={effectiveYear ?? undefined}
        stratifier={stratifier}
        onStratifierChange={setStratifier}
      />

      {/* ── Gaps analysis chart ────────────────────────────────────────────────── */}
      {stratifier === 'etnia' && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Análisis de brechas étnicas en mortalidad materna
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Brecha absoluta y relativa entre población indígena y no indígena.
            </p>
          </div>
          <MaternalMortalityEthnicGapsChart
            data={data}
            selectedYear={effectiveYear}
          />
        </section>
      )}

      {stratifier === 'zona' && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Análisis de brechas territoriales en mortalidad materna
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Brecha absoluta y relativa entre zonas geográficas.
            </p>
          </div>
          <MaternalMortalityZoneGapsChart
            data={data}
            selectedYear={effectiveYear}
          />
        </section>
      )}
    </div>
  )
}
