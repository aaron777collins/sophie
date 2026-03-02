import '@testing-library/jest-dom'

// Polyfill for web APIs in Node.js test environment
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = new Map();
    
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value);
      });
    }
  }
  
  async json() {
    return JSON.parse(this.body);
  }
  
  async text() {
    return this.body;
  }
};

// Polyfill for fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
);

global.Request = class Request {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.body = init.body || null;
    this.headers = new Headers(init.headers || {});
  }
  
  async json() {
    return JSON.parse(this.body);
  }
  
  async text() {
    return this.body || '';
  }
};

global.Headers = class Headers extends Map {
  constructor(init) {
    super();
    if (init) {
      if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => {
          this.set(key.toLowerCase(), value);
        });
      }
    }
  }
  
  get(name) {
    return super.get(name.toLowerCase()) || null;
  }
  
  set(name, value) {
    return super.set(name.toLowerCase(), value);
  }
  
  has(name) {
    return super.has(name.toLowerCase());
  }
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock window.location for login redirects
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    assign: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
})