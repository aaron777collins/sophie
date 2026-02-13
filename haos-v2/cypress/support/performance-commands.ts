// Performance Testing Commands

Cypress.Commands.add('measurePerformance', (actionName: string) => {
  cy.window().then((win) => {
    win.performance.mark(`${actionName}-start`)
    
    return cy.wrap(null).then(() => {
      win.performance.mark(`${actionName}-end`)
      win.performance.measure(actionName, `${actionName}-start`, `${actionName}-end`)
      
      const measure = win.performance.getEntriesByName(actionName)[0]
      cy.task('logPerformance', {
        action: actionName,
        duration: measure.duration,
        timestamp: Date.now()
      })
      
      return measure.duration
    })
  })
})

Cypress.Commands.add('checkLoadTime', (threshold: number) => {
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart
    
    expect(loadTime).to.be.lessThan(threshold, `Page load time ${loadTime}ms exceeded threshold ${threshold}ms`)
    
    return loadTime
  })
})

// Core Web Vitals measurements
Cypress.Commands.add('measureCoreWebVitals', () => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      // Wait for page to be fully loaded
      win.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          const paint = win.performance.getEntriesByType('paint')
          
          const vitals = {
            // First Contentful Paint
            fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            
            // Largest Contentful Paint (approximated)
            lcp: navigation.loadEventEnd - navigation.loadEventStart,
            
            // Time to Interactive (approximated)
            tti: navigation.domInteractive - navigation.navigationStart,
            
            // Total Load Time
            loadTime: navigation.loadEventEnd - navigation.navigationStart,
            
            // DOM Content Loaded
            dcl: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            
            // First Paint
            fp: paint.find(p => p.name === 'first-paint')?.startTime || 0
          }
          
          cy.task('logPerformance', {
            type: 'core-web-vitals',
            metrics: vitals,
            timestamp: Date.now()
          })
          
          resolve(vitals)
        }, 1000) // Wait 1s for paint events
      })
    })
  })
})

// Memory usage monitoring
Cypress.Commands.add('measureMemoryUsage', () => {
  cy.window().then((win) => {
    if ('memory' in win.performance) {
      const memory = (win.performance as any).memory
      const memoryInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }
      
      cy.task('logPerformance', {
        type: 'memory-usage',
        metrics: memoryInfo,
        timestamp: Date.now()
      })
      
      return memoryInfo
    }
  })
})

// Network performance monitoring
Cypress.Commands.add('measureNetworkPerformance', () => {
  cy.window().then((win) => {
    const resources = win.performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const networkMetrics = {
      totalRequests: resources.length,
      totalSize: resources.reduce((acc, resource) => acc + (resource.transferSize || 0), 0),
      averageLoadTime: resources.reduce((acc, resource) => acc + resource.duration, 0) / resources.length,
      slowestRequest: Math.max(...resources.map(r => r.duration)),
      fastestRequest: Math.min(...resources.map(r => r.duration))
    }
    
    cy.task('logPerformance', {
      type: 'network-performance',
      metrics: networkMetrics,
      timestamp: Date.now()
    })
    
    return networkMetrics
  })
})

// Bundle size analysis
Cypress.Commands.add('analyzeBundleSize', () => {
  cy.window().then((win) => {
    const resources = win.performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const jsFiles = resources.filter(r => r.name.includes('.js'))
    const cssFiles = resources.filter(r => r.name.includes('.css'))
    
    const bundleAnalysis = {
      totalJSSize: jsFiles.reduce((acc, file) => acc + (file.transferSize || 0), 0),
      totalCSSSize: cssFiles.reduce((acc, file) => acc + (file.transferSize || 0), 0),
      jsFileCount: jsFiles.length,
      cssFileCount: cssFiles.length,
      largestJS: Math.max(...jsFiles.map(f => f.transferSize || 0)),
      largestCSS: Math.max(...cssFiles.map(f => f.transferSize || 0))
    }
    
    cy.task('logPerformance', {
      type: 'bundle-analysis',
      metrics: bundleAnalysis,
      timestamp: Date.now()
    })
    
    return bundleAnalysis
  })
})

// Performance budget checks
Cypress.Commands.add('checkPerformanceBudget', (budget: any) => {
  cy.measureCoreWebVitals().then((vitals: any) => {
    // Check FCP budget
    if (budget.fcp && vitals.fcp > budget.fcp) {
      throw new Error(`FCP ${vitals.fcp}ms exceeded budget ${budget.fcp}ms`)
    }
    
    // Check Load Time budget
    if (budget.loadTime && vitals.loadTime > budget.loadTime) {
      throw new Error(`Load Time ${vitals.loadTime}ms exceeded budget ${budget.loadTime}ms`)
    }
    
    // Check TTI budget
    if (budget.tti && vitals.tti > budget.tti) {
      throw new Error(`TTI ${vitals.tti}ms exceeded budget ${budget.tti}ms`)
    }
  })
  
  cy.analyzeBundleSize().then((bundle: any) => {
    // Check bundle size budget
    if (budget.jsSize && bundle.totalJSSize > budget.jsSize) {
      throw new Error(`JS bundle size ${bundle.totalJSSize} bytes exceeded budget ${budget.jsSize} bytes`)
    }
    
    if (budget.cssSize && bundle.totalCSSSize > budget.cssSize) {
      throw new Error(`CSS bundle size ${bundle.totalCSSSize} bytes exceeded budget ${budget.cssSize} bytes`)
    }
  })
})

// Declare performance command types
declare global {
  namespace Cypress {
    interface Chainable {
      measurePerformance(actionName: string): Chainable<number>
      checkLoadTime(threshold: number): Chainable<number>
      measureCoreWebVitals(): Chainable<any>
      measureMemoryUsage(): Chainable<any>
      measureNetworkPerformance(): Chainable<any>
      analyzeBundleSize(): Chainable<any>
      checkPerformanceBudget(budget: any): Chainable<void>
    }
  }
}