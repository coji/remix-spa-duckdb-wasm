import { parseWithZod } from '@conform-to/zod'
import {
  ClientActionFunctionArgs,
  Form,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import React from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui'
import { getDb, sql } from '~/services/database'
import {
  ExtLink,
  Footer,
  Header,
  Heading,
  HStack,
  Layout,
  Main,
  Panel,
} from './components'

export const schema = z.object({
  intent: z.enum(['seed_persons', 'load_posts']),
})

export const clientLoader = async () => {
  const db = await getDb()

  const tables = await db.introspection.getTables()
  let persons: any[] = []
  if (tables.find((table) => table.name === 'persons')) {
    persons = await db.selectFrom('persons').selectAll().execute()
  }

  let posts: any[] = []
  if (tables.find((table) => table.name === 'posts')) {
    posts = await db
      .selectFrom('posts')
      .select([
        (eb) => eb.cast<number>('userId', 'integer').as('userId'),
        (eb) => eb.cast<number>('id', 'integer').as('id'),
        'title',
        'body',
      ])
      .execute()
  }

  return { tables, persons, posts }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const submission = parseWithZod(await request.formData(), { schema })
  if (submission.status !== 'success') {
    return { intent: null, lastResult: submission.reply() }
  }

  const db = await getDb()
  if (submission.value.intent === 'seed_persons') {
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
    toast.info(`Inserted ${seed.length} records into table 'persons'`)
  }

  if (submission.value.intent === 'load_posts') {
    await sql`load httpfs`.execute(db)
    await sql`load json`.execute(db)
    await sql`
        CREATE TABLE IF NOT EXISTS posts AS
        SELECT * FROM read_json('https://jsonplaceholder.typicode.com/posts')`.execute(
      db,
    )

    toast.info(`Loaded Tasks from JSONPlaceholder API`)
  }

  return { intent: submission.value.intent, lastResult: submission.reply() }
}

export default function Index() {
  const { tables, persons, posts } = useLoaderData<typeof clientLoader>()
  const navigation = useNavigation()

  return (
    <Layout>
      <Header>
        <Heading>Remix SPA Mode with DuckDB Wasm</Heading>
      </Header>

      <Main>
        <Panel title="Actions">
          <Form method="POST">
            <HStack>
              <Button
                name="intent"
                value="seed_persons"
                loading={
                  navigation.state === 'submitting' &&
                  navigation.formData?.get('intent') === 'seed_persons'
                }
              >
                Seed Persons
              </Button>

              <Button
                name="intent"
                value="load_posts"
                loading={
                  navigation.state === 'submitting' &&
                  navigation.formData?.get('intent') === 'load_posts'
                }
              >
                Load JSON
              </Button>
            </HStack>
          </Form>
        </Panel>

        <Panel title="Persons" description={`${persons.length} records`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
              </TableRow>
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
        </Panel>

        <Panel title="posts" description={`${posts.length} records`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>UserId</TableHead>
                <TableHead>Id</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Body</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.userId}</TableCell>
                  <TableCell>{post.id}</TableCell>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>{post.body}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Tables">
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
        </Panel>
      </Main>

      <Footer>
        <ExtLink href="https://x.com/techtalkjp">coji</ExtLink>
        <ExtLink href="https://github.com/coji/remix-spa-duckdb-wasm">
          GitHub
        </ExtLink>
      </Footer>
    </Layout>
  )
}
