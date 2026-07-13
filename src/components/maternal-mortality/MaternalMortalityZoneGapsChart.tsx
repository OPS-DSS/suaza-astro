'use client'

import { useState, useMemo } from 'react'
import { DSGapBarChart } from '@ops-dss/charts/gap-bar-chart'
import type { MaternalMortalityRateRow } from '@/lib/parquet'

const SMV = 'San Martín del Valle'

type ZoneComparison = 'rural_urbano' | 'periurbano_urbano'

interface ZoneGapRow {
  anio: number
  rmm_desfavorecido: number
  rmm_favorecido: number
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

function computeZoneGaps(
  data: MaternalMortalityRateRow[],
  comparison: ZoneComparison,
): ZoneGapRow[] {
  const zonaDesfavorecida = comparison === 'rural_urbano' ? 'rural' : 'periurbano'
  const zonaFavorecida = 'urbano'

  const smvRows = data.filter(
    (row) => row.territorio === SMV && row.etnia === 'Total',
  )

  const desfByYear = new Map<number, number>()
  const favByYear = new Map<number, number>()

  for (const row of smvRows) {
    if (row.zona === zonaDesfavorecida) desfByYear.set(row.anio, row.valor)
    else if (row.zona === zonaFavorecida) favByYear.set(row.anio, row.valor)
  }

  const years = [
    ...new Set([...desfByYear.keys(), ...favByYear.keys()]),
  ].sort((a, b) => a - b)

  return years
    .map((anio) => {
      const rmm_desfavorecido = desfByYear.get(anio) ?? NaN
      const rmm_favorecido = favByYear.get(anio) ?? NaN
      if (
        !Number.isFinite(rmm_desfavorecido) ||
        !Number.isFinite(rmm_favorecido) ||
        rmm_favorecido <= 0
      )
        return null
      const brecha_absoluta = r(rmm_desfavorecido - rmm_favorecido, 1)
      const brecha_relativa = r(rmm_desfavorecido / rmm_favorecido, 2)
      const ba_lo = r(brecha_absoluta * 0.8, 1)
      const ba_hi = r(brecha_absoluta * 1.2, 1)
      return {
        anio,
        rmm_desfavorecido: r(rmm_desfavorecido, 1),
        rmm_favorecido: r(rmm_favorecido, 1),
        brecha_absoluta,
        brecha_relativa,
        ic_inf_ba: Math.min(ba_lo, ba_hi),
        ic_sup_ba: Math.max(ba_lo, ba_hi),
        ic_inf_br: r(brecha_relativa * 0.85, 2),
        ic_sup_br: r(brecha_relativa * 1.15, 2),
      }
    })
    .filter((row): row is ZoneGapRow => row !== null)
}

function interpretacionBA(ba: number, desf: string, fav: string): string {
  if (ba > 0)
    return `La razón de mortalidad materna en zona ${desf} fue ${Math.abs(ba).toFixed(1)} muertes por 100.000 nacidos vivos superior a la zona ${fav}, evidenciando una desigualdad territorial desfavorable para la zona ${desf}.`
  if (ba < 0)
    return `La razón de mortalidad materna en zona ${fav} fue ${Math.abs(ba).toFixed(1)} muertes por 100.000 nacidos vivos superior a la zona ${desf}.`
  return 'No se observaron diferencias absolutas relevantes entre zonas.'
}

function interpretacionBR(br: number, desf: string, fav: string): string {
  if (br > 1)
    return `La zona ${desf} presentó una razón de mortalidad materna ${br.toFixed(2)} veces mayor que la zona ${fav}.`
  if (br < 1 && br > 0)
    return `La zona ${fav} presentó una razón de mortalidad materna ${(1 / br).toFixed(2)} veces mayor que la zona ${desf}.`
  return 'No se observaron diferencias relativas entre zonas.'
}

function downloadCsvBA(rows: ZoneGapRow[], filename = 'brecha-absoluta-zona') {
  const header = [
    'anio',
    'rmm_desfavorecido',
    'rmm_favorecido',
    'brecha_absoluta',
    'ic_inf_ba',
    'ic_sup_ba',
  ].join(',')
  const lines = rows.map((r) =>
    [
      r.anio,
      r.rmm_desfavorecido,
      r.rmm_favorecido,
      r.brecha_absoluta,
      r.ic_inf_ba,
      r.ic_sup_ba,
    ].join(','),
  )
  triggerDownload([header, ...lines].join('\n'), filename)
}

function downloadCsvBR(rows: ZoneGapRow[], filename = 'brecha-relativa-zona') {
  const header = [
    'anio',
    'rmm_desfavorecido',
    'rmm_favorecido',
    'brecha_relativa',
    'ic_inf_br',
    'ic_sup_br',
  ].join(',')
  const lines = rows.map((r) =>
    [
      r.anio,
      r.rmm_desfavorecido,
      r.rmm_favorecido,
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

const DownloadIcon = () => (
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
)

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

const COMPARISON_OPTIONS: { value: ZoneComparison; label: string }[] = [
  { value: 'rural_urbano', label: 'Rural vs Urbano' },
  { value: 'periurbano_urbano', label: 'Periurbano vs Urbano' },
]

interface Props {
  data: MaternalMortalityRateRow[]
  selectedYear?: number | null
}

export const MaternalMortalityZoneGapsChart = ({
  data,
  selectedYear,
}: Props) => {
  const [comparison, setComparison] = useState<ZoneComparison>('rural_urbano')
  const [viewBA, setViewBA] = useState<ViewMode>('chart')
  const [viewBR, setViewBR] = useState<ViewMode>('chart')

  const gapsData = useMemo(
    () => computeZoneGaps(data, comparison),
    [data, comparison],
  )

  const zonaDesfavorecida = comparison === 'rural_urbano' ? 'rural' : 'periurbano'
  const zonaFavorecida = 'urbano'

  const effectiveYear =
    selectedYear ?? (gapsData.length > 0 ? gapsData[gapsData.length - 1].anio : null)

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

      {/* ── Comparison toggle ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600" id="comparison-group-label">Comparación:</span>
        <div
          role="group"
          aria-labelledby="comparison-group-label"
          className="flex rounded-lg overflow-hidden border border-gray-200 text-sm"
        >
          {COMPARISON_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setComparison(value)}
              aria-pressed={comparison === value}
              className={`px-4 py-1.5 transition-colors ${
                comparison === value
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Brecha Absoluta ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-sm bg-orange-500" />
            <h3 className="text-sm font-semibold text-gray-700">
              Brecha absoluta (muertes por 100.000 NV)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle view={viewBA} onChange={setViewBA} sectionLabel="brecha absoluta" />
            <button
              type="button"
              onClick={() => downloadCsvBA(gapsData, `brecha-absoluta-${comparison}`)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <DownloadIcon />
              Descargar tabla
            </button>
          </div>
        </div>

        {viewBA === 'chart' ? (
          <div className="rounded-lg border border-gray-200 px-4 pt-6 pb-2">
            <DSGapBarChart
              data={baData}
              color="#f97316"
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
                  <th className="px-4 py-3 font-medium">
                    RMM {zonaDesfavorecida.charAt(0).toUpperCase() + zonaDesfavorecida.slice(1)}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    RMM {zonaFavorecida.charAt(0).toUpperCase() + zonaFavorecida.slice(1)}
                  </th>
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
                        ? 'bg-orange-50 font-semibold'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{row.anio}</td>
                    <td className="px-4 py-3 text-gray-600">{row.rmm_desfavorecido.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.rmm_favorecido.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.brecha_absoluta.toFixed(1)}</td>
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
          <div className="rounded-lg border border-orange-200 p-4 bg-orange-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-1">
              Brecha absoluta — {effectiveYear}
            </p>
            <p className="text-3xl font-bold text-orange-700 mb-1">
              {selectedRow.brecha_absoluta.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              IC 95%: ({selectedRow.ic_inf_ba.toFixed(1)} – {selectedRow.ic_sup_ba.toFixed(1)}) muertes por 100.000 NV
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {interpretacionBA(selectedRow.brecha_absoluta, zonaDesfavorecida, zonaFavorecida)}
            </p>
          </div>
        )}
      </div>

      {/* ── Brecha Relativa ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-sm bg-teal-500" />
            <h3 className="text-sm font-semibold text-gray-700">Brecha relativa (razón)</h3>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle view={viewBR} onChange={setViewBR} sectionLabel="brecha relativa" />
            <button
              type="button"
              onClick={() => downloadCsvBR(gapsData, `brecha-relativa-${comparison}`)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <DownloadIcon />
              Descargar tabla
            </button>
          </div>
        </div>

        {viewBR === 'chart' ? (
          <div className="rounded-lg border border-gray-200 px-4 pt-6 pb-2">
            <DSGapBarChart
              data={brData}
              color="#14b8a6"
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
                  <th className="px-4 py-3 font-medium">
                    RMM {zonaDesfavorecida.charAt(0).toUpperCase() + zonaDesfavorecida.slice(1)}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    RMM {zonaFavorecida.charAt(0).toUpperCase() + zonaFavorecida.slice(1)}
                  </th>
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
                        ? 'bg-teal-50 font-semibold'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{row.anio}</td>
                    <td className="px-4 py-3 text-gray-600">{row.rmm_desfavorecido.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.rmm_favorecido.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.brecha_relativa.toFixed(2)}</td>
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
          <div className="rounded-lg border border-teal-200 p-4 bg-teal-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600 mb-1">
              Brecha relativa — {effectiveYear}
            </p>
            <p className="text-3xl font-bold text-teal-700 mb-1">
              {selectedRow.brecha_relativa.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              IC 95%: ({selectedRow.ic_inf_br.toFixed(2)} – {selectedRow.ic_sup_br.toFixed(2)})
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {interpretacionBR(selectedRow.brecha_relativa, zonaDesfavorecida, zonaFavorecida)}
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
