import '@testing-library/jest-dom'

// Polyfill for Web APIs needed by Next.js API routes
// Mock Response for Node.js environment
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Map(Object.entries(init.headers || {}));
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }

    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }

    static json(data, init = {}) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init.headers
        }
      });
    }
  };
}

// Mock Headers if not available
if (typeof global.Headers === 'undefined') {
  global.Headers = Map;
}

// Mock URL if not available
if (typeof global.URL === 'undefined') {
  global.URL = require('url').URL;
}