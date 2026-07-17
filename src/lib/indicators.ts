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
  dimension: string
  subdimensions: string[]
  priority: boolean
  stratifiers?: IndicatorStratifier[]
  source: string
  label?: string
  axisLabel?: string
  color?: string
}

export const suicideMortalityIndicators: IndicatorMeta[] = [
  {
    slug: 'aprobacion',
    title: 'Aprobación',
    text: 'Aprobación',
    description: 'Aprobación',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de aprobación',
    label: 'Aprobación escolar',
    axisLabel: '% aprobación escolar',
    color: '#10b981',
  },
  {
    slug: 'reprobacion',
    title: 'Reprobación',
    text: 'Reprobación',
    description: 'Reprobación',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de reprobación',
    label: 'Reprobación escolar',
    axisLabel: '% reprobación escolar',
    color: '#3b82f6',
  },
  {
    slug: 'cobertura_bruta',
    title: 'Cobertura bruta',
    text: 'Cobertura bruta',
    description: 'Cobertura bruta',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de cobertura bruta',
    label: 'Cobertura bruta educativa',
    axisLabel: '% cobertura bruta',
    color: '#6366f1',
  },
  {
    slug: 'cobertura_neta',
    title: 'Cobertura neta',
    text: 'Cobertura neta',
    description: 'Cobertura neta',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de cobertura neta',
    label: 'Cobertura neta educativa',
    axisLabel: '% cobertura neta',
    color: '#8b5cf6',
  },
  {
    slug: 'desercion',
    title: 'Deserción',
    text: 'Deserción',
    description: 'Deserción',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de deserción',
    label: 'Deserción escolar',
    axisLabel: '% deserción escolar',
    color: '#f59e0b',
  },
  {
    slug: 'repitencia',
    title: 'Repitencia',
    text: 'Repitencia',
    description: 'Repitencia',
    dimension: 'dss',
    subdimensions: ['educación'],
    priority: true,
    source: 'Registros territoriales de repitencia',
    label: 'Repitencia escolar',
    axisLabel: '% repitencia escolar',
    color: '#ec4899',
  },
  {
    slug: 'aseguramiento',
    title: 'Aseguramiento en salud',
    text: 'Aseguramiento en salud',
    description: 'Aseguramiento en salud',
    dimension: 'policy',
    subdimensions: ['programas sociales'],
    priority: true,
    stratifiers: ['regimen'],
    source: 'Registros administrativos del sistema previsional',
    label: 'Cobertura de aseguramiento en salud',
    axisLabel: '% cobertura de aseguramiento',
    color: '#06b6d4',
  },
]

/** Analytics correlation/trends views index indicators by slug. */
export type AnalyticsIndicatorKey =
  | 'cobertura_bruta'
  | 'cobertura_neta'
  | 'desercion'
  | 'aprobacion'
  | 'reprobacion'
  | 'repitencia'
  | 'aseguramiento'

export const indicatorsBySlug = Object.fromEntries(
  suicideMortalityIndicators.map((ind) => [ind.slug, ind]),
) as Record<AnalyticsIndicatorKey, IndicatorMeta>
