'use strict';

const http = require('node:http');

class HttpServer {
  #router = new Map();
  #middlewares = [];
  #server = null;

  use(middleware) {
    this.#middlewares.push(middleware);
  }

  route(method, path, handler) {
    const key = `${method.toUpperCase()}:${path}`;
    this.#router.set(key, handler);
  }

  async #handleRequest(req, res) {
    // Apply middlewares
    for (const middleware of this.#middlewares) {
      await middleware(req, res);
      if (res.writableEnded) return;
    }

    // Parse body for non-GET requests
    if (req.method !== 'GET') {
      req.body = await this.#parseBody(req);
    } else {
      req.body = {};
    }

    // Parse query params
    req.query = this.#parseQuery(req.url);

    // Find handler
    const urlPath = req.url.split('?')[0];
    const key = `${req.method}:${urlPath}`;
    let handler = this.#router.get(key);

    // Try pattern matching for parameterized routes
    if (!handler) {
      handler = this.#findPatternHandler(req.method, urlPath, req);
    }

    if (!handler) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
      return;
    }

    try {
      const result = await handler(req, res);
      if (!res.writableEnded) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      }
    } catch (error) {
      console.error('Request error:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  }

  #findPatternHandler(method, urlPath, req) {
    for (const [key, handler] of this.#router) {
      const [routeMethod, routePath] = key.split(':');
      if (routeMethod !== method) continue;

      const params = this.#matchPattern(routePath, urlPath);
      if (params) {
        req.params = params;
        return handler;
      }
    }
    return null;
  }

  #matchPattern(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  async #parseBody(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  #parseQuery(url) {
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return {};

    const querystring = require('node:querystring');
    return querystring.parse(url.slice(queryIndex + 1));
  }

  start(port) {
    this.#server = http.createServer((req, res) => {
      this.#handleRequest(req, res).catch(err => {
        console.error('Unhandled error:', err);
        res.statusCode = 500;
        res.end('{"success":false,"error":"Internal server error"}');
      });
    });
    this.#server.listen(port);
    console.log(`HTTP server listening on port ${port}`);
  }

  stop() {
    return new Promise(resolve => {
      if (this.#server) {
        this.#server.close(resolve);
      } else {
        resolve();
      }
    });
  }
}

module.exports = HttpServer;
