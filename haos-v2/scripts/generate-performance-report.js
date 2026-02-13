#!/usr/bin/env node

/**
 * Performance Report Generator
 * 
 * Compiles performance metrics from Cypress tests into a comprehensive report
 */

const fs = require('fs');
const path = require('path');

// Performance thresholds (should match Cypress config)
const THRESHOLDS = {
  firstContentfulPaint: 1200,
  largestContentfulPaint: 2500,
  timeToInteractive: 3000,
  maxJSBundleSize: 1000000,
  maxCSSBundleSize: 200000,
  maxMemoryUsage: 100 * 1024 * 1024,
  maxMessageSendTime: 1000,
  maxChannelSwitchTime: 500,
  maxVoiceLatency: 150
};

// Grade performance based on thresholds
function gradeMetric(value, threshold, lowerIsBetter = true) {
  const ratio = lowerIsBetter ? value / threshold : threshold / value;
  
  if (ratio <= 0.7) return { grade: 'A', color: '#22c55e', status: 'excellent' };
  if (ratio <= 0.85) return { grade: 'B', color: '#84cc16', status: 'good' };
  if (ratio <= 1.0) return { grade: 'C', color: '#f59e0b', status: 'acceptable' };
  if (ratio <= 1.2) return { grade: 'D', color: '#ef4444', status: 'poor' };
  return { grade: 'F', color: '#dc2626', status: 'failing' };
}

// Format bytes for display
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Format milliseconds for display
function formatMs(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// Calculate statistics from array of values
function calculateStats(values) {
  if (!values || values.length === 0) return { avg: 0, min: 0, max: 0, p95: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  return {
    avg: values.reduce((a, b) => a + b) / values.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p95: sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1]
  };
}

// Read performance data from test results
function readPerformanceData() {
  const testResultsDir = './cypress/reports';
  const performanceData = {
    coreWebVitals: [],
    bundleAnalysis: [],
    memoryUsage: [],
    userInteractions: [],
    realTimePerformance: [],
    timestamp: new Date().toISOString()
  };
  
  if (!fs.existsSync(testResultsDir)) {
    console.log('No test results directory found');
    return performanceData;
  }
  
  // Read performance logs (would be written by Cypress tasks)
  const performanceLogFile = path.join(testResultsDir, 'performance-logs.json');
  if (fs.existsSync(performanceLogFile)) {
    try {
      const logs = JSON.parse(fs.readFileSync(performanceLogFile, 'utf8'));
      
      logs.forEach(log => {
        switch (log.type) {
          case 'core-web-vitals':
            performanceData.coreWebVitals.push(log.metrics);
            break;
          case 'bundle-analysis':
            performanceData.bundleAnalysis.push(log.metrics);
            break;
          case 'memory-usage':
            performanceData.memoryUsage.push(log.metrics);
            break;
          case 'message-sending-performance':
          case 'channel-switching-performance':
          case 'file-upload-performance':
            performanceData.userInteractions.push(log);
            break;
          case 'realtime-message-latency':
          case 'voice-quality-monitor':
            performanceData.realTimePerformance.push(log);
            break;
        }
      });
    } catch (error) {
      console.error('Error reading performance logs:', error);
    }
  }
  
  return performanceData;
}

// Generate performance report
function generateReport(data) {
  const report = {
    summary: {},
    details: {},
    recommendations: [],
    timestamp: data.timestamp
  };
  
  // Core Web Vitals analysis
  if (data.coreWebVitals.length > 0) {
    const fcpValues = data.coreWebVitals.map(v => v.fcp).filter(v => v > 0);
    const lcpValues = data.coreWebVitals.map(v => v.lcp).filter(v => v > 0);
    const ttiValues = data.coreWebVitals.map(v => v.tti).filter(v => v > 0);
    
    const fcpStats = calculateStats(fcpValues);
    const lcpStats = calculateStats(lcpValues);
    const ttiStats = calculateStats(ttiValues);
    
    report.summary.coreWebVitals = {
      fcp: {
        value: fcpStats.avg,
        grade: gradeMetric(fcpStats.avg, THRESHOLDS.firstContentfulPaint),
        threshold: THRESHOLDS.firstContentfulPaint,
        stats: fcpStats
      },
      lcp: {
        value: lcpStats.avg,
        grade: gradeMetric(lcpStats.avg, THRESHOLDS.largestContentfulPaint),
        threshold: THRESHOLDS.largestContentfulPaint,
        stats: lcpStats
      },
      tti: {
        value: ttiStats.avg,
        grade: gradeMetric(ttiStats.avg, THRESHOLDS.timeToInteractive),
        threshold: THRESHOLDS.timeToInteractive,
        stats: ttiStats
      }
    };
    
    // Add recommendations for poor Core Web Vitals
    if (fcpStats.avg > THRESHOLDS.firstContentfulPaint) {
      report.recommendations.push({
        type: 'performance',
        severity: 'high',
        title: 'Improve First Contentful Paint',
        description: `FCP is ${formatMs(fcpStats.avg)}, above the ${formatMs(THRESHOLDS.firstContentfulPaint)} threshold`,
        suggestions: [
          'Optimize critical render path',
          'Minimize render-blocking resources',
          'Optimize server response times',
          'Use efficient image formats and compression'
        ]
      });
    }
  }
  
  // Bundle analysis
  if (data.bundleAnalysis.length > 0) {
    const latestBundle = data.bundleAnalysis[data.bundleAnalysis.length - 1];
    
    report.summary.bundleSize = {
      js: {
        value: latestBundle.totalJSSize,
        grade: gradeMetric(latestBundle.totalJSSize, THRESHOLDS.maxJSBundleSize),
        threshold: THRESHOLDS.maxJSBundleSize,
        formatted: formatBytes(latestBundle.totalJSSize)
      },
      css: {
        value: latestBundle.totalCSSSize,
        grade: gradeMetric(latestBundle.totalCSSSize, THRESHOLDS.maxCSSBundleSize),
        threshold: THRESHOLDS.maxCSSBundleSize,
        formatted: formatBytes(latestBundle.totalCSSSize)
      }
    };
    
    if (latestBundle.totalJSSize > THRESHOLDS.maxJSBundleSize) {
      report.recommendations.push({
        type: 'bundle',
        severity: 'medium',
        title: 'JavaScript Bundle Too Large',
        description: `JS bundle is ${formatBytes(latestBundle.totalJSSize)}, above the ${formatBytes(THRESHOLDS.maxJSBundleSize)} threshold`,
        suggestions: [
          'Implement code splitting',
          'Remove unused dependencies',
          'Use dynamic imports for non-critical code',
          'Enable tree shaking'
        ]
      });
    }
  }
  
  // Memory usage analysis
  if (data.memoryUsage.length > 0) {
    const memoryValues = data.memoryUsage.map(m => m.usedJSHeapSize);
    const memoryStats = calculateStats(memoryValues);
    
    report.summary.memory = {
      value: memoryStats.avg,
      grade: gradeMetric(memoryStats.avg, THRESHOLDS.maxMemoryUsage),
      threshold: THRESHOLDS.maxMemoryUsage,
      formatted: formatBytes(memoryStats.avg),
      stats: memoryStats
    };
  }
  
  // User interaction performance
  if (data.userInteractions.length > 0) {
    const messageInteractions = data.userInteractions.filter(i => i.type === 'message-sending-performance');
    const channelInteractions = data.userInteractions.filter(i => i.type === 'channel-switching-performance');
    
    if (messageInteractions.length > 0) {
      const messageTimes = messageInteractions.flatMap(i => i.messageTimes || [i.averageTime]);
      const messageStats = calculateStats(messageTimes);
      
      report.summary.messagePerformance = {
        value: messageStats.avg,
        grade: gradeMetric(messageStats.avg, THRESHOLDS.maxMessageSendTime),
        threshold: THRESHOLDS.maxMessageSendTime,
        stats: messageStats
      };
    }
    
    if (channelInteractions.length > 0) {
      const channelTimes = channelInteractions.flatMap(i => i.switchTimes || [i.averageTime]);
      const channelStats = calculateStats(channelTimes);
      
      report.summary.channelPerformance = {
        value: channelStats.avg,
        grade: gradeMetric(channelStats.avg, THRESHOLDS.maxChannelSwitchTime),
        threshold: THRESHOLDS.maxChannelSwitchTime,
        stats: channelStats
      };
    }
  }
  
  // Calculate overall score
  const grades = Object.values(report.summary)
    .flatMap(category => Object.values(category))
    .map(metric => metric.grade)
    .filter(grade => grade && grade.grade);
  
  if (grades.length > 0) {
    const gradePoints = { A: 4, B: 3, C: 2, D: 1, F: 0 };
    const averageGrade = grades.reduce((sum, g) => sum + gradePoints[g.grade], 0) / grades.length;
    
    report.overallScore = {
      grade: Object.keys(gradePoints).find(key => gradePoints[key] <= averageGrade + 0.5) || 'F',
      score: (averageGrade / 4) * 100,
      metrics: grades.length
    };
  }
  
  return report;
}

// Generate HTML report
function generateHTMLReport(report) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HAOS E2E Performance Report</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; background: #f8fafc; color: #1f2937;
        }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2rem; }
        .header .subtitle { opacity: 0.9; margin-top: 8px; }
        .content { padding: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        .metric-header { display: flex; justify-content: between; align-items: center; margin-bottom: 10px; }
        .metric-title { font-weight: 600; color: #374151; }
        .metric-grade { 
            padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; font-size: 0.875rem;
        }
        .metric-value { font-size: 1.5rem; font-weight: 700; margin: 8px 0; }
        .metric-threshold { color: #6b7280; font-size: 0.875rem; }
        .recommendations { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-top: 30px; }
        .recommendation { margin-bottom: 20px; }
        .recommendation:last-child { margin-bottom: 0; }
        .rec-title { font-weight: 600; color: #92400e; margin-bottom: 8px; }
        .rec-suggestions { list-style: none; padding: 0; }
        .rec-suggestions li { padding: 4px 0; padding-left: 16px; position: relative; }
        .rec-suggestions li:before { content: "→"; position: absolute; left: 0; color: #f59e0b; }
        .overall-score { text-align: center; margin-bottom: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px; }
        .score-circle { 
            display: inline-block; width: 80px; height: 80px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem; font-weight: bold; color: white; margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 HAOS E2E Performance Report</h1>
            <div class="subtitle">Generated on ${new Date(report.timestamp).toLocaleString()}</div>
        </div>
        <div class="content">
            ${report.overallScore ? `
            <div class="overall-score">
                <div class="score-circle" style="background: ${gradeMetric(report.overallScore.score, 80, false).color};">
                    ${report.overallScore.grade}
                </div>
                <div>Overall Performance Grade</div>
                <div style="color: #6b7280;">Based on ${report.overallScore.metrics} metrics</div>
            </div>
            ` : ''}
            
            <div class="summary-grid">
                ${Object.entries(report.summary).map(([category, metrics]) => 
                  Object.entries(metrics).map(([name, metric]) => `
                    <div class="metric-card">
                        <div class="metric-header">
                            <div class="metric-title">${name.toUpperCase()}</div>
                            <div class="metric-grade" style="background: ${metric.grade.color};">
                                ${metric.grade.grade}
                            </div>
                        </div>
                        <div class="metric-value">${metric.formatted || formatMs(metric.value)}</div>
                        <div class="metric-threshold">
                            Threshold: ${metric.formatted ? formatBytes(metric.threshold) : formatMs(metric.threshold)}
                        </div>
                    </div>
                  `).join('')
                ).join('')}
            </div>
            
            ${report.recommendations.length > 0 ? `
            <div class="recommendations">
                <h3 style="margin-top: 0; color: #92400e;">📋 Performance Recommendations</h3>
                ${report.recommendations.map(rec => `
                    <div class="recommendation">
                        <div class="rec-title">${rec.title}</div>
                        <div style="color: #6b7280; margin-bottom: 8px;">${rec.description}</div>
                        <ul class="rec-suggestions">
                            ${rec.suggestions.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `;
  
  return html;
}

// Main execution
function main() {
  try {
    console.log('📊 Generating performance report...');
    
    // Ensure reports directory exists
    const reportsDir = './cypress/reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Read and analyze performance data
    const data = readPerformanceData();
    const report = generateReport(data);
    
    // Save JSON report
    const jsonPath = path.join(reportsDir, 'performance-metrics.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`✅ JSON report saved to ${jsonPath}`);
    
    // Generate and save HTML report
    const html = generateHTMLReport(report);
    const htmlPath = path.join(reportsDir, 'performance-report.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`✅ HTML report saved to ${htmlPath}`);
    
    // Output summary to console
    console.log('\n📈 Performance Summary:');
    if (report.overallScore) {
      console.log(`Overall Grade: ${report.overallScore.grade} (${report.overallScore.score.toFixed(1)}%)`);
    }
    
    if (report.summary.coreWebVitals) {
      const vitals = report.summary.coreWebVitals;
      console.log(`FCP: ${formatMs(vitals.fcp.value)} (Grade: ${vitals.fcp.grade.grade})`);
      console.log(`LCP: ${formatMs(vitals.lcp.value)} (Grade: ${vitals.lcp.grade.grade})`);
      console.log(`TTI: ${formatMs(vitals.tti.value)} (Grade: ${vitals.tti.grade.grade})`);
    }
    
    if (report.recommendations.length > 0) {
      console.log(`\n⚠️  Found ${report.recommendations.length} performance recommendations`);
    }
    
    // Exit with appropriate code
    const hasFailingMetrics = Object.values(report.summary)
      .flatMap(category => Object.values(category))
      .some(metric => metric.grade && metric.grade.grade === 'F');
    
    if (hasFailingMetrics) {
      console.log('\n❌ Performance tests failed - some metrics below acceptable thresholds');
      process.exit(1);
    } else {
      console.log('\n✅ Performance tests passed');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Error generating performance report:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateReport,
  generateHTMLReport,
  gradeMetric,
  formatBytes,
  formatMs
};