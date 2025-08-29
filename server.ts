import { serve } from 'bun'
import { Client } from 'pg'
import DOMPurify from 'isomorphic-dompurify'
import './styles.css'

const db = new Client({
  user: 'postgres',
  password: 'password',
  host: process.env.DB_HOST ?? 'localhost',
  database: 'postgres',
})
await db.connect()

await db.query(`
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    content TEXT UNIQUE NOT NULL
);`)

const defaultPosts = [
  `This is an example post`,
  `Posts can have multiple lines of content!
  Ex, Ex`,
  `Additionally posts can be bolded
  <strong>Some bold text</strong>`,
  `Posts can also have headers!
  <h1>Some bold text</h1>`,
]

await Promise.all(
  defaultPosts.map(async (post) => {
    await db.query(
      `INSERT INTO posts (content) VALUES($1) ON CONFLICT (content) DO NOTHING;`,
      [post]
    )
  })
)

const server = serve({
  routes: {
    '/': {
      async GET() {
        const template = await Bun.file('index.html').text()

        const query = 'SELECT (content) FROM posts;'
        const res = await db.query(query)

        console.log(res.rows)
        const postHtml = res.rows.map(
          (post) => `<div class="post">${post.content}</div>`
        )

        // Replace the placeholder with the dynamic name
        const html = template.replace('{{posts}}', postHtml.join('\n'))

        // Return the new HTML in a Response
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        })
      },
    },

    '/api/posts': {
      // This get request is unused but can be used to see all the posts in plaintext
      async GET() {
        const query = 'SELECT (content) FROM posts;'
        const res = await db.query(query)

        console.log(res.rows)
        return Response.json(res.rows)
      },
      async POST(req) {
        const formdata = await req.formData()
        const content = formdata.get('content') as string

        if (!content) {
          return Response.redirect('/')
        }

        const query =
          'INSERT INTO POSTS (content) VALUES($1) ON CONFLICT (content) DO NOTHING;'
        await db.query(query, [DOMPurify.sanitize(content)])

        return Response.redirect('/')
      },
    },

    '/styles.css': {
      async GET() {
        const data = await Bun.file('styles.css').text()
        return new Response(data, {
          headers: { 'Content-Type': 'text/css' },
        })
      },
    },
  },
})

console.log(`Bun server listening on port http://localhost:${server.port}`)
