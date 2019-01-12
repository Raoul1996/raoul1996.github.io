---
layout: post
title: Use Json Sever Mock Api
category: node
keywords: json-server, mock-server
---

### TL;DR

This mock server is based on `json-server`, developing for [`react-workflow-template`](https://github.com/Raoul1996/react-workflow-template).

But `json-server` lib only allow api path without `/`, so I have to rewrite the request url via `jsonServer.rewrite` funtion, which is based on `express-urlrewrite` libary.

```js
// src/_mock/index.js

const fs = require('fs');
const path = require('path');

// most important libary, based on express
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// get the `MOCK_PORT` in env.development file
const envDev = path.join(__dirname, '../../.env.development');

const [ignore, MOCK_PORT] = fs.readFileSync(envDev, 'utf-8').match(/MOCK_PORT=(\d+)/);

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
  }
  next();
});

// must before the `server.use(router)`
server.use(
  jsonServer.rewriter({
    '/api/v1/:type/:name': '/:type',
    '/api/v1/*': '/$1',
  }),
);

// Use default router
server.use(router);

server.listen(MOCK_PORT, () => {
  console.log(`JSON Server is running at ${MOCK_PORT}`);
});
```

```
# env.development
MOCK_PORT=9988
```
```json
{
  "filepath":"src/_mock/db.json",
  "consts": {
    "meta": {
      "status_code": 0
    },
    "data": {
      "UserInfo": {
        "avatar": {
          "thumb": "your_image_url"
        },
        "email": "raoul@github.com",
        "name": "aaa",
        "username": "aaa"
      }
    }
  },
  "name": {
    "meta": {
      "status_code": 0
    },
    "data": {
      "name": []
    }
  },
  "fields": {
    "meta": {
      "status_code": 0
    },
    "data": {
      "fields": []
    }
  }
}

```
The `package.json` file:

```json
"scripts": {
  "mock": "node src/_mock/index.js"
},
"devDependencies": {
  "@types/http-proxy-middleware": "^0.19.1",
  "@types/json-server": "^0.14.0",
  "http-proxy-middleware": "^0.19.1",
  "json-server": "^0.14.2"
}

```

The `react-script` command will [load the file(`src/setupProxy.js`) automaticly](https://facebook.github.io/create-react-app/docs/proxying-api-requests-in-development#configuring-the-proxy-manually), without any configration.

**Don't use a `.ts` file, there must a javaScript file!**

And this file is optional, your can use `nginx-dev.conf`(in the project above), or other proxy tools.

```js
// src/setupProxy.js
const proxy = require('http-proxy-middleware');

module.exports = app => {
  app.use(proxy('/api', { target: `http://localhost:${process.env.MOCK_PORT}/` }));
};
```

### More Configration?

Maybe you need config the `tsconfig.json` and `tslint.json`, like following:

tsconfig.json:

```json
"exclude": [
  "src/**/*.js"
],
```

tslint.json:

```json
"linterOptions": {
    "exclude": [
      "node_modules/**/*",
      "output/**/*",
      "server/**/*",
      "src/**/*.json",
      "src/**/*.js"
    ]
 }
```

### No More information?

Yes, that's all.

