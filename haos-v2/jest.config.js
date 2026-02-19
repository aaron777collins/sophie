const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases matching tsconfig.json paths
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types$': '<rootDir>/types',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  // Include the old-components directory in test discovery
  testMatch: [
    '<rootDir>/**/__tests__/**/*.(js|jsx|ts|tsx)',
    '<rootDir>/**/?(*.)(spec|test).(js|jsx|ts|tsx)'
  ],
  // Transform files from old-components directory
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react)/)'
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)