import type { MetaFunction } from '@remix-run/node'
import {
  ClientActionFunctionArgs,
  Form,
  useActionData,
  useLoaderData,
} from '@remix-run/react'
import React from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui'
import { getDb, sql } from '~/services/database'

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix SPA Mode DuckDB Wasm' },
    { name: 'description', content: 'Welcome to Remix (SPA Mode)!' },
  ]
}

export const clientLoader = async () => {
  const db = await getDb()

  const tables = await db.introspection.getTables()
  let persons: any[] = []
  if (tables.find((table) => table.name === 'persons')) {
    persons = await db.selectFrom('persons').selectAll().execute()
  }

  return { tables, persons }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const formData = await request.formData()
  const intent = formData.get('intent')
  if (intent === 'init') {
    const db = await getDb()

    await db.schema
      .createTable('persons')
      .ifNotExists()
      .addColumn('id', 'varchar', (col) =>
        col.defaultTo(sql`uuid()`).primaryKey(),
      )
      .addColumn('name', 'varchar')
      .addColumn('gender', 'varchar')
      .addColumn('age', 'integer')
      .execute()

    const seed = [
      { name: 'Alice', gender: 'female', age: 30 },
      { name: 'Bob', gender: 'male', age: 25 },
      { name: 'Charlie', gender: 'male', age: 35 },
      { name: 'David', gender: 'male', age: 40 },
      { name: 'Eve', gender: 'female', age: 45 },
      { name: 'Frank', gender: 'male', age: 50 },
      { name: 'Grace', gender: 'female', age: 55 },
      { name: 'Heidi', gender: 'female', age: 60 },
      { name: 'Ivan', gender: 'male', age: 65 },
      { name: 'Judy', gender: 'female', age: 70 },
    ]
    await db.insertInto('persons').values(seed).execute()
  }
  return { intent }
}

export default function Index() {
  const { tables, persons } = useLoaderData<typeof clientLoader>()
  const actionData = useActionData<typeof clientAction>()

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-slate-100">
      <header className="border-b bg-card p-2 md:container">
        <h1 className="text-2xl font-bold">Remix SPA Mode with DuckDB Wasm</h1>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="POST">
              <Button name="intent" value="init">
                Create Table
              </Button>
            </Form>

            {actionData?.intent === 'init' && <div>Table Created</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Persons</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
              </TableHeader>
              <TableBody>
                {persons.map((person, index) => (
                  <TableRow key={index}>
                    <TableCell>{person.name}</TableCell>
                    <TableCell>{person.gender}</TableCell>
                    <TableCell>{person.age}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>isView</TableHead>
                  <TableHead>Columns</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => {
                  return (
                    <TableRow key={table.name}>
                      <TableCell>{table.name}</TableCell>
                      <TableCell>{table.isView ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <div className="grid grid-cols-[auto_1fr] gap-2">
                          {table.columns.map((col) => (
                            <React.Fragment key={col.name}>
                              <div>{col.name}</div>
                              <div>{col.dataType}</div>
                            </React.Fragment>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <footer className="flex justify-center gap-4 border-t bg-card p-2">
        <a
          href="https://x.com/techtalkjp"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          coji
        </a>
        <a
          href="https://github.com/coji/remix-spa-duckdb-wasm"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          GitHub
        </a>
      </footer>
    </div>
  )
}
