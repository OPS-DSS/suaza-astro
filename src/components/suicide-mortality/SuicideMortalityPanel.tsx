'use client'

import { useState, useMemo } from 'react'
import { SuicideMortalityChart } from './SuicideMortalityChart'
import type { Stratifier } from './SuicideMortalityChart'
import { SuicideMortalityEthnicGapsChart } from './SuicideMortalityEthnicGapsChart'
import type { SuicideMortalityRateRow } from '@/lib/parquet'

const SMV = 'Suaza'
const TOTAL_SEXO = 'Total'

interface SuicideMortalityPanelProps {
  data: SuicideMortalityRateRow[]
  csvPath?: string
}

export const SuicideMortalityPanel = ({
  data,
  csvPath,
}: SuicideMortalityPanelProps) => {
  const availableYears = useMemo(() => {
    const smvRows = data.filter(
      (r) => r.territorio === SMV && r.sexo === TOTAL_SEXO,
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
      <SuicideMortalityChart
        data={data}
        csvPath={csvPath}
        highlightYear={effectiveYear ?? undefined}
        stratifier={stratifier}
        onStratifierChange={setStratifier}
      />

      {/* ── Gender analysis chart ────────────────────────────────────────────────── */}
      {stratifier === 'sexo' && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold">
              Análisis de brechas de género en mortalidad por suicidio
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Brecha absoluta y relativa entre población femenina y masculina.
            </p>
          </div>
          <SuicideMortalityEthnicGapsChart
            data={data}
            selectedYear={effectiveYear}
          />
        </section>
      )}
    </div>
  )
}
