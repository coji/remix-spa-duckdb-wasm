import type { MetaFunction } from '@remix-run/node'
import {
  ClientActionFunctionArgs,
  Form,
  useActionData,
  useLoaderData,
} from '@remix-run/react'
import { Button } from '~/components/ui'
import { getDb, sql } from '~/services/database'

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix SPA Mode DuckDB Wasm' },
    { name: 'description', content: 'Welcome to Remix (SPA Mode)!' },
  ]
}

export const clientLoader = async () => {
  const db = await getDb()

  const ret = await sql`select get_current_timestamp() as 'test'`.execute(db)
  console.log({ ret })

  return { tables: [{ name: 'test' }] }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const formData = await request.formData()
  const intent = formData.get('intent')
  if (intent === 'init') {
    const db = await getDb()

    await db.schema
      .createTable('test')
      .addColumn('id', 'varchar', (col) =>
        col.defaultTo(sql`uuid()`).primaryKey(),
      )
      .addColumn('name', 'varchar')
      .addColumn('age', 'integer')
      .execute()

    const tables = await db.introspection.getTables()
    console.log(tables)

    await db.insertInto('test').values({ name: 'Alice', age: 30 }).execute()
  }
  return { intent }
}

export default function Index() {
  const { tables } = useLoaderData<typeof clientLoader>()
  const actionData = useActionData<typeof clientAction>()

  return (
    <div>
      Test
      <ul>
        {tables.map((table) => (
          <li key={table.name}>{table.name}</li>
        ))}
      </ul>
      <Form method="POST">
        <Button name="intent" value="init">
          Create Table
        </Button>

        {actionData?.intent === 'init' && <div>Table Created</div>}
      </Form>
    </div>
  )
}
