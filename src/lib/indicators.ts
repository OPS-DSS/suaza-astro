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
    title: 'Tasa de aprobación',
    text: 'Porcentaje de estudiantes que aprueban el grado cursado al finalizar el año lectivo, respecto del total de estudiantes evaluados.',
    description:
      'Porcentaje de estudiantes que aprueban el grado cursado al finalizar el año lectivo, respecto del total de estudiantes evaluados.',
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
    title: 'Tasa de reprobación',
    text: 'Porcentaje de estudiantes que no cumplen los requisitos para aprobar el grado cursado, respecto del total de estudiantes evaluados.',
    description:
      'Porcentaje de estudiantes que no cumplen los requisitos para aprobar el grado cursado, respecto del total de estudiantes evaluados.',
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
    text: 'Relación porcentual entre el total de estudiantes matriculados en un nivel educativo, independientemente de su edad, y la población en edad teórica para cursar dicho nivel. Puede ser superior al 100%.',
    description:
      'Relación porcentual entre el total de estudiantes matriculados en un nivel educativo, independientemente de su edad, y la población en edad teórica para cursar dicho nivel. Puede ser superior al 100%.',
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
    text: 'Relación porcentual entre los estudiantes matriculados con la edad oficial correspondiente a un nivel educativo y la población en esa misma edad. Su valor máximo es 100%.',
    description:
      'Relación porcentual entre los estudiantes matriculados con la edad oficial correspondiente a un nivel educativo y la población en esa misma edad. Su valor máximo es 100%.',
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
    title: 'Tasa de deserción',
    text: 'Porcentaje de estudiantes que abandonan el sistema educativo durante el año lectivo o que no continúan matriculados en el siguiente período escolar.',
    description:
      'Porcentaje de estudiantes que abandonan el sistema educativo durante el año lectivo o que no continúan matriculados en el siguiente período escolar.',
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
    title: 'Tasa de repitencia',
    text: 'Porcentaje de estudiantes que deben cursar nuevamente el mismo grado en el siguiente año lectivo.',
    description:
      'Porcentaje de estudiantes que deben cursar nuevamente el mismo grado en el siguiente año lectivo.',
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
    title: 'Porcentaje de población afiliada al sistema de salud',
    text: 'Proporción de población afiliada al sistema de seguridad social en salud (Contributivo- Subsidiado y Excepción).',
    description:
      'Proporción de población afiliada al sistema de seguridad social en salud (Contributivo- Subsidiado y Excepción).',
    dimension: 'policy',
    subdimensions: ['programas sociales'],
    priority: true,
    stratifiers: ['regimen'],
    source: 'Registros administrativos del sistema previsional',
    label: 'Cobertura de aseguramiento en salud',
    axisLabel: '% cobertura de aseguramiento',
    color: '#06b6d4',
  },
  {
    slug: 'formalidad',
    title: 'Formalidad',
    text: 'Porcentaje de personas ocupadas formalmente con respecto a la población total',
    description:
      'Porcentaje de personas ocupadas formalmente con respecto a la población total',
    dimension: 'dss',
    subdimensions: ['empleo'],
    priority: true,
    stratifiers: ['regimen'],
    source: 'Registros administrativos del sistema previsional',
    label: 'Cobertura de formalidad',
    axisLabel: '% cobertura de formalidad',
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
  | 'formalidad'

export const indicatorsBySlug = Object.fromEntries(
  suicideMortalityIndicators.map((ind) => [ind.slug, ind]),
) as Record<AnalyticsIndicatorKey, IndicatorMeta>
