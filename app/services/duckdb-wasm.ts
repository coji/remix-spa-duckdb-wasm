import * as duckdb from '@duckdb/duckdb-wasm'
import duckdbWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?worker'
import duckdbWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'

let db: duckdb.AsyncDuckDB | null = null

export const initDb = async () => {
  if (!db) {
    const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.ERROR)
    const worker = new duckdbWorker()
    db = new duckdb.AsyncDuckDB(logger, worker)
    await db.instantiate(duckdbWasm)
  }
  return db
}
