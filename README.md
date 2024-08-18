# @cjvnjde/nano-router

`@cjvnjde/nano-router` is a lightweight and flexible routing library designed for handling complex routes with support for path parameters, wildcard routes, and optional segments. This library is ideal for use in Node.js applications where efficient and dynamic routing is essential.
This library was inspired by Fastify, a powerful and feature-rich web framework. However, @cjvnjde/nano-router focuses on providing a minimalistic and focused routing solution without the overhead of additional features that are not always necessary.

## Features

* Simple API: Add routes and match them with minimal configuration.
* Path Parameters: Supports named parameters in routes for dynamic matching.
* Wildcard Routes: Match routes with wildcard segments.
* Optional Parameters: Handle optional segments in routes.

## Installation

```bash
npx jsr add @cjvnjde/nano-router
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

See [tests](/src/Router.test.ts) for more examples.

## License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for more details.