'use client'

import { useState, useMemo } from 'react'
import { DSGapBarChart } from '@ops-dss/charts/gap-bar-chart'
import type { SuicideMortalityRow } from '@/lib/parquet'
import { Icon } from '@iconify/react'

interface GapRow {
  anio: number
  rmm_male: number
  rmm_female: number
  brecha_absoluta: number
  brecha_relativa: number
  ic_inf_ba: number
  ic_sup_ba: number
  ic_inf_br: number
  ic_sup_br: number
}

function r(v: number, d: number) {
  const f = 10 ** d
  return Math.round(v * f) / f
}

function computeGaps(data: SuicideMortalityRow[]): GapRow[] {
  const rows = data.filter((row) => row.territorio === 'Suaza')
  const maleByYear = new Map<number, number | null>()
  const femaleByYear = new Map<number, number | null>()

  for (const row of rows) {
    if (row.sexo === 'Masculino') maleByYear.set(row.anio, row.valor)
    else if (row.sexo === 'Femenino') femaleByYear.set(row.anio, row.valor)
  }

  const years = [
    ...new Set([...maleByYear.keys(), ...femaleByYear.keys()]),
  ].sort((a, b) => a - b)

  return years
    .map((anio) => {
      const rmm_male = maleByYear.get(anio) ?? NaN
      const rmm_female = femaleByYear.get(anio) ?? NaN
      if (
        !Number.isFinite(rmm_male) ||
        !Number.isFinite(rmm_female) ||
        rmm_female <= 0
      )
        return null
      const brecha_absoluta = r(rmm_male - rmm_female, 1)
      const brecha_relativa = r(rmm_male / rmm_female, 2)
      const ba_lo = r(brecha_absoluta * 0.8, 1)
      const ba_hi = r(brecha_absoluta * 1.2, 1)
      return {
        anio,
        rmm_male: r(rmm_male, 1),
        rmm_female: r(rmm_female, 1),
        brecha_absoluta,
        brecha_relativa,
        ic_inf_ba: Math.min(ba_lo, ba_hi),
        ic_sup_ba: Math.max(ba_lo, ba_hi),
        ic_inf_br: r(brecha_relativa * 0.85, 2),
        ic_sup_br: r(brecha_relativa * 1.15, 2),
      }
    })
    .filter((row): row is GapRow => row !== null)
}

function interpretacionBA(ba: number): string {
  if (ba > 0)
    return `La razón de mortalidad por suicidio en población masculina fue ${Math.abs(ba).toFixed(1)} muertes por 100.000 nacidos vivos superior a la observada en población femenina, evidenciando una desigualdad de género desfavorable para la población masculina.`
  if (ba < 0)
    return `La razón de mortalidad por suicidio en población femenina fue ${Math.abs(ba).toFixed(1)} muertes por 100.000 nacidos vivos superior a la observada en población masculina.`
  return 'No se observaron diferencias absolutas relevantes entre grupos de género.'
}

function interpretacionBR(br: number): string {
  if (br > 1)
    return `La población masculina presentó una razón de mortalidad por suicidio ${br.toFixed(2)} veces mayor que la población femenina.`
  if (br < 1 && br > 0)
    return `La población femenina presentó una razón de mortalidad por suicidio ${(1 / br).toFixed(2)} veces mayor que la población masculina.`
  return 'No se observaron diferencias relativas entre grupos de género.'
}

function downloadCsvBA(rows: GapRow[], filename = 'brecha-absoluta') {
  const header = [
    'anio',
    'rmm_male',
    'rmm_female',
    'brecha_absoluta',
    'ic_inf_ba',
    'ic_sup_ba',
  ].join(',')
  const lines = rows.map((r) =>
    [
      r.anio,
      r.rmm_male,
      r.rmm_female,
      r.brecha_absoluta,
      r.ic_inf_ba,
      r.ic_sup_ba,
    ].join(','),
  )
  triggerDownload([header, ...lines].join('\n'), filename)
}

function downloadCsvBR(rows: GapRow[], filename = 'brecha-relativa') {
  const header = [
    'anio',
    'rmm_male',
    'rmm_female',
    'brecha_relativa',
    'ic_inf_br',
    'ic_sup_br',
  ].join(',')
  const lines = rows.map((r) =>
    [
      r.anio,
      r.rmm_male,
      r.rmm_female,
      r.brecha_relativa,
      r.ic_inf_br,
      r.ic_sup_br,
    ].join(','),
  )
  triggerDownload([header, ...lines].join('\n'), filename)
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

type ViewMode = 'chart' | 'table'

function ViewToggle({
  view,
  onChange,
  sectionLabel,
}: {
  view: ViewMode
  onChange: (v: ViewMode) => void
  sectionLabel: string
}) {
  return (
    <div
      role="group"
      aria-label={`Vista para ${sectionLabel}`}
      className="flex rounded-lg overflow-hidden border border-gray-200 text-sm"
    >
      {(['chart', 'table'] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={view === v}
          aria-label={`${v === 'chart' ? 'Gráfico' : 'Tabla'} — ${sectionLabel}`}
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
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  data: SuicideMortalityRow[]
  selectedYear?: number | null
}

export const SuicideMortalityGenderGapsChart = ({
  data,
  selectedYear,
}: Props) => {
  const gapsData = useMemo(() => computeGaps(data), [data])

  const [viewBA, setViewBA] = useState<ViewMode>('chart')
  const [viewBR, setViewBR] = useState<ViewMode>('chart')

  const effectiveYear =
    selectedYear ??
    (gapsData.length > 0 ? gapsData[gapsData.length - 1].anio : null)

  const selectedRow = useMemo(
    () => gapsData.find((r) => r.anio === effectiveYear) ?? null,
    [gapsData, effectiveYear],
  )

  const baData = gapsData.map((row) => ({
    anio: row.anio,
    value: row.brecha_absoluta,
    ic_inf: row.ic_inf_ba,
    ic_sup: row.ic_sup_ba,
  }))

  const brData = gapsData.map((row) => ({
    anio: row.anio,
    value: row.brecha_relativa,
    ic_inf: row.ic_inf_br,
    ic_sup: row.ic_sup_br,
  }))

  if (gapsData.length === 0) {
    return (
      <p className="text-gray-500 italic py-8 text-center">
        No hay datos disponibles.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Brecha Absoluta ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-sm bg-purple-500" />
            <h3 className="text-sm font-semibold text-gray-700">
              Brecha absoluta (muertes por 100.000 NV)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle
              view={viewBA}
              onChange={setViewBA}
              sectionLabel="brecha absoluta"
            />
            <button
              type="button"
              onClick={() => downloadCsvBA(gapsData)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Icon icon="mdi:download" className="size-4 opacity-50" />
              Descargar tabla
            </button>
          </div>
        </div>

        {viewBA === 'chart' ? (
          <div className="rounded-lg border border-gray-200 px-4 pt-6 pb-2">
            <DSGapBarChart
              data={baData}
              color="#8b5cf6"
              highlightYear={effectiveYear ?? undefined}
              name="Brecha absoluta"
              decimalPlaces={1}
              height={320}
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Año</th>
                  <th className="px-4 py-3 font-medium">RMM Masculina</th>
                  <th className="px-4 py-3 font-medium">RMM Femenina</th>
                  <th className="px-4 py-3 font-medium">Brecha absoluta</th>
                  <th className="px-4 py-3 font-medium">IC 95%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gapsData.map((row) => (
                  <tr
                    key={row.anio}
                    className={`transition-colors ${
                      row.anio === effectiveYear
                        ? 'bg-purple-50 font-semibold'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.anio}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.rmm_male.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.rmm_female.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.brecha_absoluta.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      ({row.ic_inf_ba.toFixed(1)} – {row.ic_sup_ba.toFixed(1)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedRow && (
          <div className="rounded-lg border border-purple-200 p-4 bg-purple-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 mb-1">
              Brecha absoluta — {effectiveYear}
            </p>
            <p className="text-3xl font-bold text-purple-700 mb-1">
              {selectedRow.brecha_absoluta.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              IC 95%: ({selectedRow.ic_inf_ba.toFixed(1)} –{' '}
              {selectedRow.ic_sup_ba.toFixed(1)}) muertes por 100.000 NV
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {interpretacionBA(selectedRow.brecha_absoluta)}
            </p>
          </div>
        )}
      </div>

      {/* ── Brecha Relativa ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-sm bg-cyan-500" />
            <h3 className="text-sm font-semibold text-gray-700">
              Brecha relativa (razón)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle
              view={viewBR}
              onChange={setViewBR}
              sectionLabel="brecha relativa"
            />
            <button
              type="button"
              onClick={() => downloadCsvBR(gapsData)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Icon icon="mdi:download" className="size-4 opacity-50" />
              Descargar tabla
            </button>
          </div>
        </div>

        {viewBR === 'chart' ? (
          <div className="rounded-lg border border-gray-200 px-4 pt-6 pb-2">
            <DSGapBarChart
              data={brData}
              color="#06b6d4"
              highlightYear={effectiveYear ?? undefined}
              name="Brecha relativa"
              decimalPlaces={2}
              referenceLine={1}
              height={320}
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Año</th>
                  <th className="px-4 py-3 font-medium">RMM Masculina</th>
                  <th className="px-4 py-3 font-medium">RMM Femenina</th>
                  <th className="px-4 py-3 font-medium">Brecha relativa</th>
                  <th className="px-4 py-3 font-medium">IC 95%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gapsData.map((row) => (
                  <tr
                    key={row.anio}
                    className={`transition-colors ${
                      row.anio === effectiveYear
                        ? 'bg-cyan-50 font-semibold'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.anio}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.rmm_male.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.rmm_female.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.brecha_relativa.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      ({row.ic_inf_br.toFixed(2)} – {row.ic_sup_br.toFixed(2)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedRow && (
          <div className="rounded-lg border border-cyan-200 p-4 bg-cyan-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 mb-1">
              Brecha relativa — {effectiveYear}
            </p>
            <p className="text-3xl font-bold text-cyan-700 mb-1">
              {selectedRow.brecha_relativa.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              IC 95%: ({selectedRow.ic_inf_br.toFixed(2)} –{' '}
              {selectedRow.ic_sup_br.toFixed(2)})
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {interpretacionBR(selectedRow.brecha_relativa)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
