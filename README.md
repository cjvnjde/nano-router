# @cjvnjde/nano-router


![JSR Version](https://img.shields.io/jsr/v/%40cjvnjde/nano-router)

[@cjvnjde/nano-router](https://jsr.io/@cjvnjde/nano-router) is a lightweight and flexible routing library designed for handling complex routes with support for path parameters, wildcard routes, and optional segments. This library is ideal for use in Node.js applications where efficient and dynamic routing is essential.
This library was inspired by Fastify, a powerful and feature-rich web framework. However, [@cjvnjde/nano-router](https://jsr.io/@cjvnjde/nano-router) focuses on providing a minimalistic and focused routing solution without the overhead of additional features that are not always necessary.

## Features

* Simple API: Add routes and match them with minimal configuration.
* Path Parameters: Supports named parameters in routes for dynamic matching.
* Wildcard Routes: Match routes with wildcard segments.
* Optional Parameters: Handle optional segments in routes.
* Route Grouping: Group routes with common prefixes to keep your code organized.
* HTTP Method Support: Full support for GET, POST, PUT, DELETE, PATCH, OPTIONS, and HEAD methods

## Installation

Install the package using the following command:

npm:
```bash
npx jsr add @cjvnjde/nano-router
```
yarn:
```bash
yarn dlx jsr add @cjvnjde/nano-router
```
pnpm:
```bash
pnpm dlx jsr add @cjvnjde/nano-router
```
bun:
```bash
bunx jsr add @cjvnjde/nano-router
```
deno:
```bash
deno add jsr:@cjvnjde/nano-router
```

## Usage

### Basic Example

```js
import * as http from 'node:http';
import { Router } from '@cjvnjde/nano-router';

const router = new Router();

router.on('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Welcome to the home page!');
});

router.on('/about', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('About us');
});

router.on('/user/:id', (req, res, params) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ userId: params.id }));
});

const server = http.createServer((req, res) => {
  const match = router.match(req.url);

  if (match) {
    match.handler(req, res, match.params);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```

### Handling Wildcard Routes

Wildcard routes allow for flexible matching of paths. For example, you can use them to match static file paths or any other dynamic segment.

```js
router.on('/static/*', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('This is a static file route');
});

router.on('/api/*', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'API route' }));
});
```

### Optional Parameters in Routes

Routes can have optional segments. These optional parameters allow you to match different lengths of the URL path.

```js
router.on('/posts/:year/:month?/:day?', (req, res, params) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(params));
});

// Example matches:
// /posts/2024 -> { year: "2024" }
// /posts/2024/08 -> { year: "2024", month: "08" }
// /posts/2024/08/18 -> { year: "2024", month: "08", day: "18" }
```

### Combining Multiple Features

You can combine path parameters, wildcard segments, and optional parameters to create more complex routes.

```js
router.on('/user/:id/profile', (req, res, params) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`User Profile for ID: ${params.id}`);
});

router.on('/user/:id/settings', (req, res, params) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Settings for User ID: ${params.id}`);
});

router.on('/files/*', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Serving files');
});

// Example matches:
// /user/123/profile -> User Profile for ID: 123
// /user/123/settings -> Settings for User ID: 123
// /files/images/photo.png -> Serving files
```

### Groupping

You can group routes with a common prefix to simplify route management and keep your code clean. This is especially useful when dealing with APIs or versioned endpoints.

```js
router.group("v1", router => {
  router.on('/static/*', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('This is a static file route');
  });

  router.on('/api/*', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'API route' }));
  });
})
```

### Handling HTTP Methods

The `MethodRouter` allows you to handle different HTTP methods (e.g., GET, POST, PUT, DELETE, etc.) for the same URL pattern. Here's an example:

```js
const methodRouter = new MethodRouter();

methodRouter.get('/items', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'GET items' }));
});

methodRouter.post('/items', (req, res) => {
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Item created' }));
});

// Example matches:
// GET /items -> 'GET items'
// POST /items -> 'Item created'
```

### Middleware-like Grouping for Organizing Complex Routes

You can use the group function to create middleware-like behavior by organizing routes in a hierarchical way.

```js
methodRouter.group('api', (router) => {
  router.get('/users', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'List of users' }));
  });

  router.post('/users', (req, res) => {
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User created' }));
  });
});
```

### Error Handling

You can define a default handler to handle unmatched routes, providing a 404 response for routes that are not registered.

```js
const server = http.createServer((req, res) => {
  const match = router.match(req.method, req.url);

  if (match) {
    match.handler(req, res, match.params);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});
```

### Visualizing the Route Tree

Use the toString() method to print the current structure of the route tree.

```js
console.log(router.toString());
```

This will output a tree-like structure:

`one/:two`
`one/three`
`one/:three/four/:five`

```txt
└─ root [type: default, params: []]
   └─ one [type: default, params: []]
      ├─ * [type: parametrized, params: [two]]
      │  └─ four [type: default, params: []]
      │     └─ * [type: parametrized, params: [three, five]]
      └─ three [type: default, params: []]
```

See [tests](https://github.com/cjvnjde/nano-router/blob/main/src/Router.test.ts) for more examples.

## Complexity

The match method theoretically has an O(1) complexity since it uses dictionaries to look up routes (excluding factors like URL splitting).

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/cjvnjde/nano-router/blob/main/LICENSE) file for more details.
