/**
 * Stratifier dimensions available for StratifiedLineChart.
 * Indicator declares which ones apply to its data.
 */
export type IndicatorStratifier = 'regimen'

export type IndicatorMeta = {
  slug: string
  title: string
  text: string
  description: string
  date: string
  dimension: string
  subdimensions: string[]
  priority: boolean
  stratifiers?: IndicatorStratifier[]
  source: string
}

export const suicideMortalityIndicators: IndicatorMeta[] = [
  {
    slug: 'aprobacion',
    title: 'Aprobación',
    text: 'Aprobación',
    description: 'Aprobación',
    date: '2026-07-15',
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
    date: '2026-07-15',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de reprobación',
  },
  {
    slug: 'cobertura_bruta',
    title: 'Cobertura bruta',
    text: 'Cobertura bruta',
    description: 'Cobertura bruta',
    date: '2026-07-15',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de cobertura bruta',
  },
  {
    slug: 'cobertura_neta',
    title: 'Cobertura neta',
    text: 'Cobertura neta',
    description: 'Cobertura neta',
    date: '2026-07-15',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de cobertura neta',
  },
  {
    slug: 'desercion',
    title: 'Deserción',
    text: 'Deserción',
    description: 'Deserción',
    date: '2026-07-15',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de deserción',
  },
  {
    slug: 'repitencia',
    title: 'Repitencia',
    text: 'Repitencia',
    description: 'Repitencia',
    date: '2026-07-15',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de repitencia',
  },
  {
    slug: 'prevision-social',
    title: 'Previsión social',
    text: 'Previsión social',
    description: 'Previsión social',
    date: '2026-07-15',
    dimension: 'policy',
    subdimensions: ['programas sociales'],
    priority: true,
    stratifiers: ['regimen'],
    source: 'Registros administrativos del sistema previsional',
  },
]
