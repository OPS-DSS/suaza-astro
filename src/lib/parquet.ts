import { asyncBufferFromFile, parquetRead } from 'hyparquet'
import { resolve, isAbsolute } from 'node:path'

export function dataPath(filename: string) {
  return resolve(process.cwd(), 'src/data', filename)
}

/**
 * Reads a parquet file at build time (Node.js / Astro SSG).
 * Pass a path relative to the project root, e.g. 'src/data/foo.parquet'.
 */
export async function readParquet<T = Record<string, unknown>>(
  filePath: string,
): Promise<T[]> {
  const resolvedPath = isAbsolute(filePath)
    ? filePath
    : resolve(process.cwd(), filePath)

  const file = await asyncBufferFromFile(resolvedPath)
  return new Promise<T[]>((resolve, reject) => {
    try {
      parquetRead({
        file,
        onComplete: (rows) => {
          try {
            // rows is an array of row-arrays from hyparquet
            // Each row is an array of column values
            if (!rows || rows.length === 0) {
              resolve([] as unknown as T[])
              return
            }
            // parquetRead returns row-oriented arrays (each row is an array of values)
            // We need column names from metadata to build objects
            resolve(rows as unknown as T[])
          } catch (err) {
            reject(err)
          }
        },
      })
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Reads a parquet file and returns row objects with named keys.
 * Uses parquet schema to map column indices to field names.
 */
export async function readParquetAsObjects<T = Record<string, unknown>>(
  filePath: string,
): Promise<T[]> {
  const resolvedPath = isAbsolute(filePath)
    ? filePath
    : resolve(process.cwd(), filePath)

  const file = await asyncBufferFromFile(resolvedPath)
  return new Promise<T[]>((resolve, reject) => {
    try {
      // First pass: read metadata to get column names
      let columnNames: string[] = []
      parquetRead({
        file,
        onComplete: (rows) => {
          try {
            if (!rows || rows.length === 0) {
              resolve([] as unknown as T[])
              return
            }
            // If rows are already objects, return as-is
            if (!Array.isArray(rows[0])) {
              resolve(rows as unknown as T[])
              return
            }
            // Get column names from metadata if available
            if (columnNames.length === 0) {
              // Fallback: generate indexed column names
              const numCols = (rows[0] as unknown[]).length
              columnNames = Array.from({ length: numCols }, (_, i) => `col${i}`)
            }
            // Convert each row array to a named object
            const objects = rows.map((row) => {
              const rowArr = row as unknown[]
              const obj: Record<string, unknown> = {}
              for (let i = 0; i < columnNames.length; i++) {
                obj[columnNames[i]] = rowArr[i]
              }
              return obj as T
            })
            resolve(objects)
          } catch (err) {
            reject(err)
          }
        },
        columns: undefined, // read all columns
      })
    } catch (err) {
      reject(err)
    }
  })
}

// ── Suicide Mortality data types ─────────────────────────────────────────────

/**
 * Row from suicide_mortality_rate.parquet (mock SMV data)
 * Columns (by index): iso3[0], Territorio[1], cod_local[2], anio[3], sexo[4], zona[5], etnia[6], valor[7]
 */
export type SuicideMortalityRateRawRow = unknown[]

export type SuicideMortalityRateRow = {
  territorio: string
  anio: number
  sexo: string
  valor: number
}

export function filterSuicideMortalityRateRows(
  rows: SuicideMortalityRateRawRow[],
): SuicideMortalityRateRow[] {
  const result: SuicideMortalityRateRow[] = []
  for (const row of rows) {
    const territorio = String(row[1])
    const anio = Number(row[4])
    const sexo = String(row[5])
    const valor = Number(row[6])
    if (!Number.isFinite(anio) || !Number.isFinite(valor)) continue
    result.push({ territorio, anio, sexo, valor })
  }
  return result.sort((a, b) => a.anio - b.anio).filter((r) => r.anio > 2010)
}

/**
 * Row from suicide_mortality_quintiles.parquet (resumen dataframe)
 * Columns: anio[0], quintil_dss[1], tasa_ponderada[2], n[3], total_pob[4],
 *          sd_pond[5], se[6], ic_inf[7], ic_sup[8]
 */
export type SuicideMortalityQuintilRawRow = unknown[]

export type SuicideMortalityQuintilRow = {
  anio: number
  quintil_dss: number
  tasa_ponderada: number
  n: number
  total_pob: number
  se: number
  ic_inf: number
  ic_sup: number
}

export function filterSuicideMortalityQuintilRows(
  rows: SuicideMortalityQuintilRawRow[],
): SuicideMortalityQuintilRow[] {
  const result: SuicideMortalityQuintilRow[] = []
  for (const row of rows) {
    const anio = Number(row[0])
    const quintil_dss = Number(row[1])
    const tasa_ponderada = Number(row[2])
    const n = Number(row[3])
    const total_pob = Number(row[4])
    const se = Number(row[6])
    const ic_inf = Number(row[7])
    const ic_sup = Number(row[8])
    if (!Number.isFinite(anio) || !Number.isFinite(quintil_dss)) continue
    result.push({
      anio,
      quintil_dss,
      tasa_ponderada,
      n,
      total_pob,
      se,
      ic_inf,
      ic_sup,
    })
  }
  return result.sort((a, b) => a.anio - b.anio || a.quintil_dss - b.quintil_dss)
}

/**
 * Row from maternal_mortality_gaps.parquet (brecha_quintiles dataframe)
 * Columns: anio[0], valor_ref[1], valor_comp[2],
 *          brecha_absoluta[3], ic_inf_abs[4], ic_sup_abs[5],
 *          brecha_relativa[6], ic_inf_rel[7], ic_sup_rel[8]
 */
export type SuicideMortalityGapsRawRow = unknown[]

export type SuicideMortalityGapsRow = {
  anio: number
  valor_ref: number
  valor_comp: number
  brecha_absoluta: number
  ic_inf_abs: number
  ic_sup_abs: number
  brecha_relativa: number
  ic_inf_rel: number
  ic_sup_rel: number
}

export function filterSuicideMortalityGapsRows(
  rows: SuicideMortalityGapsRawRow[],
): SuicideMortalityGapsRow[] {
  const result: SuicideMortalityGapsRow[] = []
  for (const row of rows) {
    const anio = Number(row[0])
    if (!Number.isFinite(anio)) continue
    result.push({
      anio,
      valor_ref: Number(row[1]),
      valor_comp: Number(row[2]),
      brecha_absoluta: Number(row[3]),
      ic_inf_abs: Number(row[4]),
      ic_sup_abs: Number(row[5]),
      brecha_relativa: Number(row[6]),
      ic_inf_rel: Number(row[7]),
      ic_sup_rel: Number(row[8]),
    })
  }
  return result.sort((a, b) => a.anio - b.anio)
}

// ── Suicide mortality analytics: temporal data (MM rate + mock DSS avg) ──────
export type AnalyticsSuicideRawRow = unknown[]

export type AnalyticsSuicideRow = {
  anio: number
  valor: number
  traslado: number
  empleo_informal: number
  sobrecarga: number
  cobertura_programa: number
  transporte: number
  cuidar_comunidad: number
}

export function filterAnalyticsSuicideRows(
  rows: AnalyticsSuicideRawRow[],
): AnalyticsSuicideRow[] {
  const result: AnalyticsSuicideRow[] = []
  for (const row of rows) {
    const anio = Number(row[0])
    const valor = Number(row[1])
    if (!Number.isFinite(anio) || !Number.isFinite(valor)) continue
    result.push({
      anio,
      valor,
      traslado: row[2] == null ? NaN : Number(row[2]),
      empleo_informal: row[3] == null ? NaN : Number(row[3]),
      sobrecarga: row[4] == null ? NaN : Number(row[4]),
      cobertura_programa: row[5] == null ? NaN : Number(row[5]),
      transporte: row[6] == null ? NaN : Number(row[6]),
      cuidar_comunidad: row[7] == null ? NaN : Number(row[7]),
    })
  }
  return result.sort((a, b) => a.anio - b.anio)
}

// ── Suicide mortality scatter: cross-sectional barrio data ───────────────────
export type ScatterSuicideRawRow = unknown[]

export type ScatterSuicideRow = {
  anio: number
  territorio: string
  valor: number
  traslado: number
  empleo_informal: number
  sobrecarga: number
  cobertura_programa: number
  transporte: number
  cuidar_comunidad: number
  nacimientos: number
}

export function filterScatterSuicideRows(
  rows: ScatterSuicideRawRow[],
): ScatterSuicideRow[] {
  const result: ScatterSuicideRow[] = []
  for (const row of rows) {
    const anio = Number(row[0])
    const territorio = String(row[1])
    const valor = Number(row[2])
    if (!Number.isFinite(anio) || !Number.isFinite(valor)) continue
    result.push({
      anio,
      territorio,
      valor,
      traslado: row[3] == null ? NaN : Number(row[3]),
      empleo_informal: row[4] == null ? NaN : Number(row[4]),
      sobrecarga: row[5] == null ? NaN : Number(row[5]),
      cobertura_programa: row[6] == null ? NaN : Number(row[6]),
      transporte: row[7] == null ? NaN : Number(row[7]),
      cuidar_comunidad: row[8] == null ? NaN : Number(row[8]),
      nacimientos: row[9] == null ? NaN : Number(row[9]),
    })
  }
  return result
}

// ── Forest plot / Correlation data types ─────────────────────────────────────
// Parquet columns (by index):
//   anio[0], indicador[1], label[2], correlacion[3], ci_lower[4],
//   ci_upper[5], p_value[6], n[7]
export type ForestPlotRawRow = unknown[]

export type ForestPlotDataRow = {
  anio: number
  indicador: string
  label: string
  correlacion: number
  ci_lower: number
  ci_upper: number
  p_value: number
  n: number
}

export type StratifiedRawRow = unknown[]

export type StratifiedRow = {
  anio: number
  valor: number
  regimen: string
}

export function filterStratifiedRows(
  rows: StratifiedRawRow[],
): StratifiedRow[] {
  const result: StratifiedRow[] = []
  for (const row of rows) {
    const anio = Number(row[0])
    const regimen = String(row[1])
    const valor = Number(row[2])
    if (!Number.isFinite(anio) || !Number.isFinite(valor)) continue
    result.push({ anio, regimen, valor })
  }
  return result.sort((a, b) => a.anio - b.anio)
}

export function filterForestPlotRows(
  rows: ForestPlotRawRow[],
): ForestPlotDataRow[] {
  const result: ForestPlotDataRow[] = []
  for (const row of rows) {
    const anio = Number(row[0])
    const indicador = String(row[1])
    const label = String(row[2])
    const correlacion = Number(row[3])
    if (
      !Number.isFinite(anio) ||
      !indicador ||
      !label ||
      !Number.isFinite(correlacion)
    )
      continue
    result.push({
      anio,
      indicador,
      label,
      correlacion,
      ci_lower: Number(row[4]),
      ci_upper: Number(row[5]),
      p_value: Number(row[6]),
      n: Number(row[7]),
    })
  }
  return result
}

export type SimpleRawRow = unknown[]

export type SimpleRow = {
  anio: number
  valor: number
}

export function filterSimpleRows(rows: SimpleRawRow[]): SimpleRow[] {
  const result: SimpleRow[] = []
  for (const row of rows) {
    const anio = Number(row[0])
    const valor = Number(row[2])
    if (!Number.isFinite(anio) || !Number.isFinite(valor)) continue
    result.push({ anio, valor })
  }
  return result.sort((a, b) => a.anio - b.anio)
}
