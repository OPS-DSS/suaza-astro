import {
  readParquet,
  dataPath,
  filterMaternalMortalityRateRows,
  filterForestPlotRows,
  filterAnalyticsMaternalRows,
  filterScatterMaternalRows,
  filterJourneyTimeStratifiedRows,
  filterSexoOnlyStratifiedRows,
  filterZonaOnlyStratifiedRows,
  filterEtniaStratifiedRows,
} from './parquet'
import { maternalMortalityIndicators } from '@/lib/indicators'
import type { IndicatorStratifier } from '@/lib/indicators'
import { priorities } from '@/lib/priority'
import type { PriorityMeta } from '@/lib/priority'

import type {
  MaternalMortalityRateRawRow,
  MaternalMortalityRateRow,
  ForestPlotRawRow,
  ForestPlotDataRow,
  AnalyticsMaternalRawRow,
  AnalyticsMaternalRow,
  ScatterMaternalRawRow,
  ScatterMaternalRow,
  StratifiedRawRow,
  StratifiedRow,
} from './parquet'

// ─── Loaded datasets ─────────────────────────────────────────────────────────

export interface PageDatasets {
  forestPlotData: ForestPlotDataRow[]
  analyticsMaternalData: AnalyticsMaternalRow[]
  scatterMaternalData: ScatterMaternalRow[]
  maternalMortalityRateData: MaternalMortalityRateRow[]
  trasladoData: StratifiedRow[]
  frecuenciaTransporteData: StratifiedRow[]
  sobrecargaCuidadosData: StratifiedRow[]
  empleoInformalData: StratifiedRow[]
  coberturaProgramaData: StratifiedRow[]
  apoyoInfantilData: StratifiedRow[]
}

export async function loadAllDatasets(): Promise<PageDatasets> {
  let forestPlotData: ForestPlotDataRow[] = []
  try {
    const rows = await readParquet<ForestPlotRawRow>(
      dataPath('mock_forest_plot.parquet'),
    )
    forestPlotData = filterForestPlotRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] mock_forest_plot:', e)
  }

  let analyticsMaternalData: AnalyticsMaternalRow[] = []
  try {
    const rows = await readParquet<AnalyticsMaternalRawRow>(
      dataPath('mock_analytics_maternal.parquet'),
    )
    analyticsMaternalData = filterAnalyticsMaternalRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] mock_analytics_maternal:', e)
  }

  let scatterMaternalData: ScatterMaternalRow[] = []
  try {
    const rows = await readParquet<ScatterMaternalRawRow>(
      dataPath('mock_scatter_maternal.parquet'),
    )
    scatterMaternalData = filterScatterMaternalRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] mock_scatter_maternal:', e)
  }

  let maternalMortalityRateData: MaternalMortalityRateRow[] = []
  try {
    const rows = await readParquet<MaternalMortalityRateRawRow>(
      dataPath('maternal_mortality_rate.parquet'),
    )
    maternalMortalityRateData = filterMaternalMortalityRateRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] maternal_mortality_rate:', e)
  }

  let trasladoData: StratifiedRow[] = []
  try {
    const rows = await readParquet<StratifiedRawRow>(
      dataPath('journey_time.parquet'),
    )
    trasladoData = filterJourneyTimeStratifiedRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] traslado:', e)
  }

  let frecuenciaTransporteData: StratifiedRow[] = []
  try {
    const rows = await readParquet<StratifiedRawRow>(
      dataPath('transport_frequency.parquet'),
    )
    frecuenciaTransporteData = filterEtniaStratifiedRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] frecuencia_transporte:', e)
  }

  let sobrecargaCuidadosData: StratifiedRow[] = []
  try {
    const rows = await readParquet<StratifiedRawRow>(
      dataPath('care_overload_municipal.parquet'),
    )
    sobrecargaCuidadosData = filterEtniaStratifiedRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] sobrecarga_cuidados:', e)
  }

  let empleoInformalData: StratifiedRow[] = []
  try {
    const rows = await readParquet<StratifiedRawRow>(
      dataPath('informal_employment.parquet'),
    )
    empleoInformalData = filterSexoOnlyStratifiedRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] empleo_informal:', e)
  }

  let coberturaProgramaData: StratifiedRow[] = []
  try {
    const rows = await readParquet<StratifiedRawRow>(
      dataPath('program_cover.parquet'),
    )
    coberturaProgramaData = filterZonaOnlyStratifiedRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] cobertura_programa:', e)
  }

  let apoyoInfantilData: StratifiedRow[] = []
  try {
    const rows = await readParquet<StratifiedRawRow>(
      dataPath('infant_care_support.parquet'),
    )
    apoyoInfantilData = filterEtniaStratifiedRows(rows)
  } catch (e) {
    console.error('[loadAllDatasets] apoyo_infantil:', e)
  }

  return {
    forestPlotData,
    analyticsMaternalData,
    scatterMaternalData,
    maternalMortalityRateData,
    trasladoData,
    frecuenciaTransporteData,
    sobrecargaCuidadosData,
    empleoInformalData,
    coberturaProgramaData,
    apoyoInfantilData,
  }
}

// ─── Page definitions ─────────────────────────────────────────────────────────

export interface PageDefinition {
  slug: string | undefined
  title: string
  text: string
  date: string
  navbar: boolean
  source?: string
  data?: MaternalMortalityRateRow[]
  forestPlotData?: ForestPlotDataRow[]
  analyticsMaternalData?: AnalyticsMaternalRow[]
  scatterMaternalData?: ScatterMaternalRow[]
  trasladoData?: StratifiedRow[]
  frecuenciaTransporteData?: StratifiedRow[]
  sobrecargaCuidadosData?: StratifiedRow[]
  empleoInformalData?: StratifiedRow[]
  coberturaProgramaData?: StratifiedRow[]
  apoyoInfantilData?: StratifiedRow[]
  dimension?: string
  subdimensions?: string[]
  description?: string
  category?: string
  priority?: boolean
  stratifiers?: IndicatorStratifier[]
}

export function buildPages(datasets: PageDatasets): PageDefinition[] {
  const staticPages: PageDefinition[] = [
    {
      slug: undefined,
      title: 'Inicio',
      text: 'Bienvenidos al Observatorio de Determinantes Sociales de la Salud, un espacio dedicado a la recopilación, análisis y visualización de datos relacionados con la salud. Nuestro objetivo es proporcionar información precisa y actualizada para apoyar la toma de decisiones informadas en el ámbito de la salud pública.',
      date: '2026-01-01',
      navbar: true,
    },
    {
      slug: 'analisis-de-inequidad',
      title: 'Análisis de Inequidad',
      text: 'Problemas, gráficos de tendencias y mediciones de brechas',
      date: '2026-01-01',
      navbar: true,
    },
    {
      slug: 'determinantes-de-la-salud',
      title: 'Determinantes Sociales de la Salud',
      text: 'Factores que influyen en la salud de la población',
      date: '2026-01-01',
      navbar: true,
    },
    {
      slug: 'analisis',
      title: 'Análisis Avanzado',
      text: 'Análisis de relaciones',
      date: '2026-01-01',
      navbar: true,
    },
    {
      slug: 'analisis/mortalidad-materna',
      title: 'Análisis de Mortalidad Materna',
      text: 'Análisis de relaciones',
      description: 'Indicadores de análisis de datos y visualización.',
      date: '2026-01-01',
      category: 'Tendencia',
      navbar: false,
      priority: false,
      forestPlotData: datasets.forestPlotData,
      analyticsMaternalData: datasets.analyticsMaternalData,
      scatterMaternalData: datasets.scatterMaternalData,
    },
  ]

  const priorityPages: PageDefinition[] = priorities.flatMap(
    (priority: PriorityMeta) => [
      {
        slug: `analisis-de-inequidad/${priority.slug}`,
        title: priority.title,
        text: priority.description,
        date: priority.date,
        category: priority.category,
        source: priority.source,
        navbar: false,
        data: datasets.maternalMortalityRateData,
      },
      {
        slug: `determinantes-de-la-salud/${priority.slug}`,
        title: priority.title,
        text: priority.description,
        date: priority.date,
        source: priority.source,
        category: priority.category,
        navbar: false,
      },
    ],
  )

  const indicatorPages: PageDefinition[] = maternalMortalityIndicators.map(
    (ind) => ({
      slug: ind.slug,
      title: ind.title,
      text: ind.text,
      dimension: ind.dimension,
      subdimensions: ind.subdimensions,
      date: ind.date,
      navbar: false,
      stratifiers: ind.stratifiers,
      source: ind.source,
      ...(ind.slug === 'traslado'
        ? { trasladoData: datasets.trasladoData }
        : {}),
      ...(ind.slug === 'frecuencia-transporte'
        ? { frecuenciaTransporteData: datasets.frecuenciaTransporteData }
        : {}),
      ...(ind.slug === 'sobrecarga-embarazadas'
        ? { sobrecargaCuidadosData: datasets.sobrecargaCuidadosData }
        : {}),
      ...(ind.slug === 'embarazadas-empleo-informal'
        ? { empleoInformalData: datasets.empleoInformalData }
        : {}),
      ...(ind.slug === 'apoyo-embarazadas'
        ? { coberturaProgramaData: datasets.coberturaProgramaData }
        : {}),
      ...(ind.slug === 'apoyo-infantil'
        ? { apoyoInfantilData: datasets.apoyoInfantilData }
        : {}),
    }),
  )

  return [...staticPages, ...indicatorPages, ...priorityPages]
}

// ─── Static path factory ──────────────────────────────────────────────────────

export async function buildStaticPaths() {
  const datasets = await loadAllDatasets()
  const pages = buildPages(datasets)

  return pages.map(({ slug, title, text, date, navbar, source, ...rest }) => ({
    params: { slug },
    props: {
      title,
      text,
      slug,
      date: new Date(date),
      navbar,
      source,
      pages,
      ...rest,
    },
  }))
}
