/**
 * Performance Benchmarking End-to-End Tests
 * 
 * Tests application performance including:
 * - Page load performance
 * - Core Web Vitals measurement
 * - Memory usage monitoring
 * - Network performance analysis
 * - Rendering performance
 * - User interaction performance
 * - Large dataset handling
 */

describe('Performance Benchmarks', () => {
  // Performance thresholds based on requirements
  const performanceThresholds = {
    // Core Web Vitals
    firstContentfulPaint: 1500,      // FCP < 1.5s
    largestContentfulPaint: 2500,    // LCP < 2.5s
    timeToInteractive: 3000,         // TTI < 3s
    
    // Bundle sizes
    maxJSBundleSize: 1000000,        // 1MB
    maxCSSBundleSize: 200000,        // 200KB
    
    // Memory usage
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    memoryUsagePercentage: 70,          // 70% of heap limit
    
    // Network performance
    maxApiResponseTime: 500,         // 500ms for API calls
    maxImageLoadTime: 2000,          // 2s for images
    
    // User interactions
    maxMessageSendTime: 1000,        // 1s for message sending
    maxChannelSwitchTime: 500,       // 500ms for channel switching
    maxServerJoinTime: 3000,         // 3s for joining servers
    
    // Large data handling
    maxLargeListRenderTime: 2000,    // 2s for 1000+ items
    maxScrollingFrameRate: 60,       // 60fps minimum
    
    // Real-time performance
    maxMessageLatency: 300,          // 300ms for real-time messages
    maxVoiceLatency: 150,            // 150ms for voice data
  }

  beforeEach(() => {
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'))
  })

  context('Page Load Performance', () => {
    it('should meet Core Web Vitals standards for dashboard', () => {
      cy.measurePerformance('dashboard-load')
      
      cy.visit('/dashboard')
      
      cy.measureCoreWebVitals().then((vitals: any) => {
        // First Contentful Paint
        expect(vitals.fcp).to.be.lessThan(
          performanceThresholds.firstContentfulPaint,
          `FCP ${vitals.fcp}ms exceeds threshold ${performanceThresholds.firstContentfulPaint}ms`
        )
        
        // Largest Contentful Paint
        expect(vitals.lcp).to.be.lessThan(
          performanceThresholds.largestContentfulPaint,
          `LCP ${vitals.lcp}ms exceeds threshold ${performanceThresholds.largestContentfulPaint}ms`
        )
        
        // Time to Interactive
        expect(vitals.tti).to.be.lessThan(
          performanceThresholds.timeToInteractive,
          `TTI ${vitals.tti}ms exceeds threshold ${performanceThresholds.timeToInteractive}ms`
        )
        
        cy.task('logPerformance', {
          type: 'core-web-vitals',
          page: 'dashboard',
          metrics: vitals,
          passed: true,
          timestamp: Date.now()
        })
      })
      
      cy.measurePerformance('dashboard-load')
    })

    it('should optimize bundle sizes', () => {
      cy.visit('/dashboard')
      
      cy.analyzeBundleSize().then((bundle: any) => {
        // JavaScript bundle size
        expect(bundle.totalJSSize).to.be.lessThan(
          performanceThresholds.maxJSBundleSize,
          `JS bundle size ${bundle.totalJSSize} bytes exceeds ${performanceThresholds.maxJSBundleSize} bytes`
        )
        
        // CSS bundle size
        expect(bundle.totalCSSSize).to.be.lessThan(
          performanceThresholds.maxCSSBundleSize,
          `CSS bundle size ${bundle.totalCSSSize} bytes exceeds ${performanceThresholds.maxCSSBundleSize} bytes`
        )
        
        // Verify code splitting is working
        expect(bundle.jsFileCount).to.be.greaterThan(2, 'Code splitting should create multiple JS chunks')
        
        cy.task('logPerformance', {
          type: 'bundle-analysis',
          metrics: bundle,
          jsThresholdPassed: bundle.totalJSSize < performanceThresholds.maxJSBundleSize,
          cssThresholdPassed: bundle.totalCSSSize < performanceThresholds.maxCSSBundleSize,
          timestamp: Date.now()
        })
      })
    })

    it('should load critical resources efficiently', () => {
      cy.intercept('**/*', (req) => {
        req.on('response', (res) => {
          // Track resource loading times
          const loadTime = Date.now() - req.timestamp
          
          if (req.url.includes('.js') || req.url.includes('.css')) {
            cy.task('logPerformance', {
              type: 'resource-timing',
              resource: req.url,
              loadTime: loadTime,
              size: res.body?.length || 0,
              timestamp: Date.now()
            })
          }
        })
      })
      
      cy.visit('/dashboard')
      cy.waitForPageLoad()
      
      cy.measureNetworkPerformance().then((network: any) => {
        expect(network.averageLoadTime).to.be.lessThan(1000, 'Average resource load time should be under 1s')
        expect(network.slowestRequest).to.be.lessThan(3000, 'Slowest resource should load within 3s')
      })
    })
  })

  context('Memory Usage Performance', () => {
    it('should maintain reasonable memory usage', () => {
      cy.visit('/dashboard')
      
      // Measure initial memory usage
      cy.measureMemoryUsage().then((initialMemory: any) => {
        expect(initialMemory.usedJSHeapSize).to.be.lessThan(
          performanceThresholds.maxMemoryUsage,
          `Initial memory usage ${initialMemory.usedJSHeapSize} exceeds ${performanceThresholds.maxMemoryUsage}`
        )
        
        expect(initialMemory.usedPercentage).to.be.lessThan(
          performanceThresholds.memoryUsagePercentage,
          `Memory percentage ${initialMemory.usedPercentage}% exceeds ${performanceThresholds.memoryUsagePercentage}%`
        )
        
        cy.task('logPerformance', {
          type: 'memory-baseline',
          metrics: initialMemory,
          timestamp: Date.now()
        })
      })
      
      // Perform memory-intensive operations
      const testServer = `Memory Test ${Date.now()}`
      cy.createServer(testServer, 'gaming')
      
      // Create multiple channels with messages
      for (let i = 0; i < 20; i++) {
        cy.createChannel(`memory-test-${i}`, 'text')
        cy.get(`[data-cy=channel-memory-test-${i}]`).click()
        
        // Send multiple messages
        for (let j = 0; j < 50; j++) {
          cy.sendMessage(`Memory test message ${i}-${j}`)
        }
      }
      
      // Measure memory after operations
      cy.measureMemoryUsage().then((finalMemory: any) => {
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
        
        expect(memoryIncrease).to.be.lessThan(
          50 * 1024 * 1024, // 50MB increase limit
          `Memory increase ${memoryIncrease} bytes is too large`
        )
        
        cy.task('logPerformance', {
          type: 'memory-stress-test',
          initialMemory: initialMemory,
          finalMemory: finalMemory,
          memoryIncrease: memoryIncrease,
          timestamp: Date.now()
        })
      })
    })

    it('should handle memory cleanup properly', () => {
      cy.visit('/dashboard')
      
      cy.measureMemoryUsage().then((baselineMemory: any) => {
        // Navigate through multiple heavy operations
        for (let i = 0; i < 10; i++) {
          const serverName = `Cleanup Test ${i}`
          cy.createServer(serverName, 'gaming')
          
          // Upload large files
          cy.uploadFile('cypress/fixtures/test-image.png')
          cy.uploadFile('cypress/fixtures/test-document.pdf')
          
          // Leave server to trigger cleanup
          cy.get('[data-cy=server-dropdown]').click()
          cy.get('[data-cy=leave-server]').click()
          cy.get('[data-cy=confirm-leave-button]').click()
        }
        
        // Force garbage collection if possible
        cy.window().then((win) => {
          if (win.gc) {
            win.gc()
          }
        })
        
        // Wait for cleanup
        cy.wait(2000)
        
        cy.measureMemoryUsage().then((cleanupMemory: any) => {
          const memoryDifference = cleanupMemory.usedJSHeapSize - baselineMemory.usedJSHeapSize
          
          // Memory should not increase significantly after cleanup
          expect(memoryDifference).to.be.lessThan(
            20 * 1024 * 1024, // 20MB tolerance
            'Memory not properly cleaned up after operations'
          )
          
          cy.task('logPerformance', {
            type: 'memory-cleanup-test',
            baselineMemory: baselineMemory,
            cleanupMemory: cleanupMemory,
            difference: memoryDifference,
            timestamp: Date.now()
          })
        })
      })
    })
  })

  context('User Interaction Performance', () => {
    beforeEach(() => {
      const testServer = `Performance Test ${Date.now()}`
      cy.createServer(testServer, 'gaming')
    })

    it('should handle message sending performance', () => {
      const messageCount = 100
      const messages: number[] = []
      
      for (let i = 0; i < messageCount; i++) {
        const startTime = Date.now()
        
        cy.sendMessage(`Performance test message ${i}`).then(() => {
          const endTime = Date.now()
          const sendTime = endTime - startTime
          
          messages.push(sendTime)
          
          expect(sendTime).to.be.lessThan(
            performanceThresholds.maxMessageSendTime,
            `Message ${i} took ${sendTime}ms, exceeds ${performanceThresholds.maxMessageSendTime}ms`
          )
        })
      }
      
      cy.then(() => {
        const averageTime = messages.reduce((a, b) => a + b, 0) / messages.length
        const maxTime = Math.max(...messages)
        const minTime = Math.min(...messages)
        
        cy.task('logPerformance', {
          type: 'message-sending-performance',
          messageCount: messageCount,
          averageTime: averageTime,
          maxTime: maxTime,
          minTime: minTime,
          allUnderThreshold: messages.every(t => t < performanceThresholds.maxMessageSendTime),
          timestamp: Date.now()
        })
      })
    })

    it('should handle channel switching performance', () => {
      // Create multiple channels
      const channelCount = 20
      for (let i = 0; i < channelCount; i++) {
        cy.createChannel(`perf-channel-${i}`, 'text')
        
        // Add some messages to each channel
        cy.get(`[data-cy=channel-perf-channel-${i}]`).click()
        for (let j = 0; j < 10; j++) {
          cy.sendMessage(`Channel ${i} message ${j}`)
        }
      }
      
      // Measure channel switching performance
      const switchTimes: number[] = []
      
      for (let i = 0; i < 10; i++) {
        const randomChannel = Math.floor(Math.random() * channelCount)
        const startTime = Date.now()
        
        cy.get(`[data-cy=channel-perf-channel-${randomChannel}]`).click()
        cy.get('[data-cy=message-list]').should('be.visible').then(() => {
          const endTime = Date.now()
          const switchTime = endTime - startTime
          
          switchTimes.push(switchTime)
          
          expect(switchTime).to.be.lessThan(
            performanceThresholds.maxChannelSwitchTime,
            `Channel switch took ${switchTime}ms, exceeds ${performanceThresholds.maxChannelSwitchTime}ms`
          )
        })
      }
      
      cy.then(() => {
        const averageTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length
        
        cy.task('logPerformance', {
          type: 'channel-switching-performance',
          switchCount: switchTimes.length,
          averageTime: averageTime,
          maxTime: Math.max(...switchTimes),
          timestamp: Date.now()
        })
      })
    })

    it('should handle file upload performance', () => {
      const fileSizes = [
        { name: 'small', size: 100000 },    // 100KB
        { name: 'medium', size: 1000000 },  // 1MB
        { name: 'large', size: 5000000 },   // 5MB
      ]
      
      fileSizes.forEach(({ name, size }) => {
        // Create test file of specified size
        const testData = 'x'.repeat(size)
        cy.writeFile(`cypress/fixtures/perf-test-${name}.txt`, testData)
        
        const startTime = Date.now()
        
        cy.uploadFile(`cypress/fixtures/perf-test-${name}.txt`).then(() => {
          const uploadTime = Date.now() - startTime
          const throughput = size / (uploadTime / 1000) // bytes per second
          
          cy.task('logPerformance', {
            type: 'file-upload-performance',
            fileName: `perf-test-${name}.txt`,
            fileSize: size,
            uploadTime: uploadTime,
            throughput: throughput,
            timestamp: Date.now()
          })
          
          // Verify reasonable upload time based on file size
          const expectedMaxTime = Math.max(2000, size / 1000) // Minimum 2s or 1ms per KB
          expect(uploadTime).to.be.lessThan(expectedMaxTime, 
            `Upload of ${name} file took ${uploadTime}ms, expected under ${expectedMaxTime}ms`)
        })
      })
    })
  })

  context('Large Dataset Performance', () => {
    it('should handle large message history efficiently', () => {
      const messageCount = 1000
      
      // Mock large message history
      cy.intercept('GET', '/api/channels/*/messages*', {
        statusCode: 200,
        body: {
          messages: Array.from({ length: messageCount }, (_, i) => ({
            id: `large_msg_${i}`,
            content: `Large dataset message ${i}`,
            author: { 
              id: `user_${i % 10}`,
              username: `user${i % 10}`,
              displayName: `User ${i % 10}`
            },
            timestamp: Date.now() - (messageCount - i) * 1000,
            attachments: [],
            reactions: []
          })),
          hasMore: false
        }
      }).as('largeMessageHistory')
      
      const startTime = Date.now()
      
      cy.get('[data-cy=channel-general]').click()
      cy.wait('@largeMessageHistory')
      
      // Verify virtual scrolling is active
      cy.get('[data-cy=message-list]').should('be.visible')
      
      // Only a subset of messages should be rendered
      cy.get('[data-cy=message-item]').should('have.length.at.most', 50)
      
      const renderTime = Date.now() - startTime
      
      expect(renderTime).to.be.lessThan(
        performanceThresholds.maxLargeListRenderTime,
        `Large message list took ${renderTime}ms to render, exceeds ${performanceThresholds.maxLargeListRenderTime}ms`
      )
      
      cy.task('logPerformance', {
        type: 'large-dataset-rendering',
        itemCount: messageCount,
        renderedItems: 50,
        renderTime: renderTime,
        usingVirtualScrolling: true,
        timestamp: Date.now()
      })
    })

    it('should maintain smooth scrolling with large datasets', () => {
      // Create large message history
      cy.get('[data-cy=channel-general]').click()
      cy.wait('@largeMessageHistory')
      
      // Measure scrolling performance
      let frameCount = 0
      let startTime = Date.now()
      
      cy.window().then((win) => {
        const measureFrame = () => {
          frameCount++
          if (Date.now() - startTime < 2000) { // Measure for 2 seconds
            win.requestAnimationFrame(measureFrame)
          }
        }
        win.requestAnimationFrame(measureFrame)
      })
      
      // Perform scrolling
      cy.get('[data-cy=message-list]')
        .trigger('wheel', { deltaY: -500, multiple: true })
        .wait(100)
        .trigger('wheel', { deltaY: 500, multiple: true })
        .wait(100)
        .trigger('wheel', { deltaY: -1000, multiple: true })
      
      cy.wait(2000)
      
      cy.then(() => {
        const fps = frameCount / 2 // frames per second over 2 seconds
        
        expect(fps).to.be.greaterThan(
          performanceThresholds.maxScrollingFrameRate * 0.9, // 90% of target FPS
          `Scrolling FPS ${fps} is below threshold ${performanceThresholds.maxScrollingFrameRate * 0.9}`
        )
        
        cy.task('logPerformance', {
          type: 'scrolling-performance',
          fps: fps,
          duration: 2000,
          frameCount: frameCount,
          timestamp: Date.now()
        })
      })
    })

    it('should handle large server lists efficiently', () => {
      // Create many servers
      const serverCount = 50
      
      for (let i = 0; i < serverCount; i++) {
        cy.createServer(`Perf Server ${i}`, 'gaming')
      }
      
      // Measure server list rendering performance
      const startTime = Date.now()
      
      cy.visit('/dashboard')
      cy.get('[data-cy=server-list]').should('be.visible')
      
      const renderTime = Date.now() - startTime
      
      // Verify virtual scrolling or pagination
      cy.get('[data-cy=server-icon]').should('have.length.at.most', 20)
      
      expect(renderTime).to.be.lessThan(3000, 'Large server list should render within 3 seconds')
      
      cy.task('logPerformance', {
        type: 'large-server-list',
        serverCount: serverCount,
        renderedServers: 20,
        renderTime: renderTime,
        timestamp: Date.now()
      })
    })
  })

  context('Real-time Performance', () => {
    it('should handle real-time message delivery efficiently', () => {
      cy.get('[data-cy=channel-general]').click()
      
      const messageLatencies: number[] = []
      
      // Simulate real-time messages
      for (let i = 0; i < 50; i++) {
        const sendTime = Date.now()
        
        cy.window().then((win) => {
          // Simulate incoming real-time message
          setTimeout(() => {
            const receiveTime = Date.now()
            const latency = receiveTime - sendTime
            
            messageLatencies.push(latency)
            
            win.dispatchEvent(new CustomEvent('matrix-message', {
              detail: {
                type: 'm.room.message',
                content: { body: `Real-time message ${i}` },
                sender: 'otheruser',
                origin_server_ts: sendTime
              }
            }))
          }, Math.random() * 200) // Random network delay up to 200ms
        })
        
        cy.wait(100)
      }
      
      cy.wait(5000) // Wait for all messages
      
      cy.then(() => {
        const averageLatency = messageLatencies.reduce((a, b) => a + b, 0) / messageLatencies.length
        const maxLatency = Math.max(...messageLatencies)
        
        expect(averageLatency).to.be.lessThan(
          performanceThresholds.maxMessageLatency,
          `Average message latency ${averageLatency}ms exceeds ${performanceThresholds.maxMessageLatency}ms`
        )
        
        cy.task('logPerformance', {
          type: 'realtime-message-latency',
          messageCount: messageLatencies.length,
          averageLatency: averageLatency,
          maxLatency: maxLatency,
          minLatency: Math.min(...messageLatencies),
          timestamp: Date.now()
        })
      })
    })

    it('should handle concurrent user actions efficiently', () => {
      const testServer = `Concurrent Test ${Date.now()}`
      cy.createServer(testServer, 'gaming')
      
      const actionTimes: { action: string; time: number }[] = []
      
      // Simulate concurrent actions
      const startTime = Date.now()
      
      // Multiple channel creation
      for (let i = 0; i < 5; i++) {
        const actionStart = Date.now()
        cy.createChannel(`concurrent-${i}`, 'text').then(() => {
          actionTimes.push({ action: 'channel-creation', time: Date.now() - actionStart })
        })
      }
      
      // Multiple message sending
      for (let i = 0; i < 10; i++) {
        const actionStart = Date.now()
        cy.sendMessage(`Concurrent message ${i}`).then(() => {
          actionTimes.push({ action: 'message-send', time: Date.now() - actionStart })
        })
      }
      
      // File uploads
      for (let i = 0; i < 3; i++) {
        const actionStart = Date.now()
        cy.uploadFile('cypress/fixtures/test-image.png').then(() => {
          actionTimes.push({ action: 'file-upload', time: Date.now() - actionStart })
        })
      }
      
      cy.then(() => {
        const totalTime = Date.now() - startTime
        
        // Group actions by type
        const actionGroups = actionTimes.reduce((groups, { action, time }) => {
          if (!groups[action]) groups[action] = []
          groups[action].push(time)
          return groups
        }, {} as Record<string, number[]>)
        
        // Verify no action took too long
        actionTimes.forEach(({ action, time }) => {
          expect(time).to.be.lessThan(5000, `${action} took ${time}ms, too slow for concurrent execution`)
        })
        
        cy.task('logPerformance', {
          type: 'concurrent-actions',
          totalActions: actionTimes.length,
          totalTime: totalTime,
          actionGroups: actionGroups,
          timestamp: Date.now()
        })
      })
    })
  })

  context('Performance Regression Testing', () => {
    it('should track performance metrics over time', () => {
      const testScenarios = [
        { name: 'dashboard-load', action: () => cy.visit('/dashboard') },
        { name: 'message-send', action: () => cy.sendMessage('Performance regression test') },
        { name: 'channel-switch', action: () => cy.get('[data-cy=channel-general]').click() },
        { name: 'server-create', action: () => cy.createServer(`Regression ${Date.now()}`, 'gaming') }
      ]
      
      testScenarios.forEach(({ name, action }) => {
        const startTime = Date.now()
        
        cy.measurePerformance(name).then(() => {
          action()
        }).then(() => {
          const endTime = Date.now()
          const duration = endTime - startTime
          
          cy.task('logPerformance', {
            type: 'performance-regression',
            scenario: name,
            duration: duration,
            timestamp: Date.now(),
            buildInfo: {
              commit: Cypress.env('CI_COMMIT_SHA') || 'local',
              branch: Cypress.env('CI_BRANCH') || 'local',
              build: Cypress.env('CI_BUILD_NUMBER') || 'local'
            }
          })
          
          cy.measurePerformance(name)
        })
      })
    })

    it('should generate performance report', () => {
      // Collect all performance data and generate summary
      cy.task('logPerformance', {
        type: 'performance-summary',
        thresholds: performanceThresholds,
        testSuite: 'e2e-performance-benchmarks',
        timestamp: Date.now(),
        environment: {
          viewport: { width: Cypress.config('viewportWidth'), height: Cypress.config('viewportHeight') },
          baseUrl: Cypress.config('baseUrl'),
          browser: Cypress.browser.name,
          version: Cypress.browser.version
        }
      })
    })
  })
})