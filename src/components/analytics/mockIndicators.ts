export const ANALYTICS_INDICATORS = {
  cobertura_bruta: {
    label: 'Cobertura bruta educativa',
    title: 'Cobertura bruta educativa en el municipio de Suaza',
    axisLabel: '% cobertura bruta',
    color: '#6366f1',
  },
  cobertura_neta: {
    label: 'Cobertura neta educativa',
    title: 'Cobertura neta educativa en el municipio de Suaza',
    axisLabel: '% cobertura neta',
    color: '#8b5cf6',
  },
  desercion: {
    label: 'Deserción escolar',
    title: 'Tasa de deserción escolar en el municipio de Suaza',
    axisLabel: '% deserción escolar',
    color: '#f59e0b',
  },
  aprobacion: {
    label: 'Aprobación escolar',
    title: 'Tasa de aprobación escolar en el municipio de Suaza',
    axisLabel: '% aprobación escolar',
    color: '#10b981',
  },
  reprobacion: {
    label: 'Reprobación escolar',
    title: 'Tasa de reprobación escolar en el municipio de Suaza',
    axisLabel: '% reprobación escolar',
    color: '#3b82f6',
  },
  repitencia: {
    label: 'Repitencia escolar',
    title: 'Tasa de repitencia escolar en el municipio de Suaza',
    axisLabel: '% repitencia escolar',
    color: '#ec4899',
  },
  aseguramiento: {
    label: 'Cobertura de aseguramiento en salud',
    title: 'Cobertura de aseguramiento en salud en el municipio de Suaza',
    axisLabel: '% cobertura de aseguramiento',
    color: '#06b6d4',
  },
} as const

export type AnalyticsIndicatorKey = keyof typeof ANALYTICS_INDICATORS
