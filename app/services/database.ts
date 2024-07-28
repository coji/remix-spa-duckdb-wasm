import { Kysely, sql } from 'kysely'
import { initDb } from './duckdb-wasm'
import { DuckDbDialect } from '@coji/kysely-duckdb-wasm'

export { sql }
let db: Kysely<any> | null = null

export const getDb = async () => {
  if (db) {
    return db
  }

  const wasmdb = await initDb()
  db = new Kysely({
    dialect: new DuckDbDialect({
      database: wasmdb,
      tableMappings: {},
    }),
    log: (event) => {
      // console.log(event.level, event.query)
    },
  })

  return db
}
