import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshot: true,
    screenshotOnRunFailure: true,
    experimentalStudio: true,
    
    // Browser configuration
    chromeWebSecurity: false,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Test isolation and cleanup
    testIsolation: true,
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
      // Performance monitoring
      on('task', {
        // Log performance metrics
        logPerformance(metrics: Record<string, any>) {
          console.log('Performance Metrics:', metrics)
          return null
        },
        
        // Custom task for database cleanup
        clearTestData() {
          // In a real implementation, this would clear test data
          console.log('Clearing test data...')
          return null
        }
      })
      
      // Code coverage (if enabled) - disabled for now
      // require('@cypress/code-coverage/task')(on, config)
      
      return config
    }
  },
  
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // require('@cypress/code-coverage/task')(on, config) - disabled for now
      return config
    }
  },
  
  // Environment variables
  env: {
    // Test user credentials (would be in CI/CD secrets)
    TEST_USER_EMAIL: 'test@example.com',
    TEST_USER_PASSWORD: 'TestPassword123!',
    
    // Test server configuration
    MATRIX_SERVER_URL: 'https://matrix.org',
    TEST_SERVER_NAME: 'HAOS E2E Test Server',
    
    // Performance thresholds
    PERFORMANCE_THRESHOLD_LOAD_TIME: 3000,
    PERFORMANCE_THRESHOLD_FIRST_PAINT: 1500,
    
    // Feature flags for testing
    ENABLE_VOICE_TESTS: true,
    ENABLE_VIDEO_TESTS: true,
    ENABLE_PERFORMANCE_TESTS: true
  },
  
  // Reporter configuration for CI/CD
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress/config/reporter.json'
  }
})