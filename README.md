# XSS Attack

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run server.ts
```

## Summary

An XSS (Cross-Site Scripting) attack is a type of security vulnerability that allows an attacker to inject malicious code, typically Javascript for web applications into web pages viewed by other users.
This happens when a web application does not properly validate or sanitize user input, allowing an attacker to inject scripts that can execute in the context of another user's browser session.

The servers code is in `server.ts` and the client code is in `client.ts`.

The server has a list of posts stored in a database. The client requests for a page and shows a list of the all the posts made. Additionally a client can make a new post by sending a request to the server.

Since the server does not sanitize the input from the client, it is vulnerable to an XSS Attack, where an attacker can inject malicious scripts into the posts that are then viewed by other users.

```html
<script>
  alert('XSS Attack!')
</script>
```

The above shows an alert on the screen whenever a user visits this page.

Once an attacker can run javascript they can do many things, such as steal cookies, session tokens, or other sensitive information from the user.

## Fixing

This is a very simple issue to fix, one simple way is to sanitize the input from the client by escaping special characters, or using libraries that automatically handle this for you.
For node.js [DomPurify](https://www.npmjs.com/package/dompurify/v/2.0.12) can be used

```diff
const formdata = await req.formData()
const content = formdata.get('content')

if (!content) {
  return Response.redirect('/')
}

const query =
  'INSERT INTO POSTS (content) VALUES($1) ON CONFLICT (content) DO NOTHING;'
- await db.query(query, [content])
+ await db.query(query, [DOMPurify.sanitize(content)])

return Response.redirect('/')
```
