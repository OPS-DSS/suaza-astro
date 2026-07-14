/**
 * Stratifier dimensions available for StratifiedLineChart.
 * Each indicator declares which ones apply to its data.
 */
export type IndicatorStratifier = 'zona' | 'etnia' | 'sexo' | 'grupo_edad'

export type IndicatorMeta = {
  slug: string
  title: string
  text: string
  description: string
  date: string
  dimension: string
  subdimensions: string[]
  priority: boolean
  /** Stratifier buttons shown in the chart (always includes implicit "total"). */
  source: string
}

export const suicideMortalityIndicators: IndicatorMeta[] = [
  {
    slug: 'aprobacion',
    title: 'Aprobación',
    text: 'Aprobación',
    description: 'Aprobación',
    date: '2026-04-10',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de aprobación',
  },
  {
    slug: 'reprobacion',
    title: 'Reprobación',
    text: 'Reprobación',
    description: 'Reprobación',
    date: '2026-04-10',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de reprobación',
  },
  {
    slug: 'prevision-social',
    title: 'Previsión social',
    text: 'Previsión social',
    description: 'Previsión social',
    date: '2026-05-10',
    dimension: 'policy',
    subdimensions: ['programas sociales'],
    priority: true,
    source: 'Registros administrativos del sistema previsional',
  },
]
