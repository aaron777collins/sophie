#!/usr/bin/env node
/**
 * Session Log Analysis Tool
 * Task: p3-1 - Audit and Refactor Session Logs
 * 
 * Provides statistics, size analysis, and organizational insights
 * for session logs across the system.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CLAWD_ROOT = path.join(__dirname, '..');
const LOG_DIRS = {
  daily: path.join(CLAWD_ROOT, 'memory', 'daily'),
  progress: path.join(CLAWD_ROOT, 'scheduler', 'progress'),
  projects: path.join(CLAWD_ROOT, 'memory', 'projects'),
  logs: path.join(CLAWD_ROOT, 'memory', 'logs')
};

// Size thresholds (in KB)
const SIZE_THRESHOLDS = {
  warning: 50,   // 50KB - consider splitting
  critical: 100  // 100KB - needs attention
};

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function showHelp() {
  console.log(`
${colors.bright}Session Log Analysis Tool${colors.reset}
${colors.dim}─────────────────────────────────────${colors.reset}

${colors.cyan}Usage:${colors.reset}
  log-analyze [command] [options]

${colors.cyan}Commands:${colors.reset}
  stats         Show overall statistics (default)
  sizes         Analyze file sizes
  structure     Show directory structure analysis
  timeline      Show activity timeline
  update-meta   Update metadata.json
  large         Find files over size threshold
  orphan        Find orphaned/unused logs
  all           Run all analyses

${colors.cyan}Options:${colors.reset}
  -h, --help              Show this help message
  -s, --source <type>     Analyze specific source (daily|progress|projects|all)
  --threshold <KB>        Size threshold in KB (default: 50)
  -o, --output <file>     Write report to file
  -j, --json              Output in JSON format

${colors.cyan}Examples:${colors.reset}
  log-analyze                          # Show overall stats
  log-analyze sizes --threshold 100    # Find files over 100KB
  log-analyze structure                # Analyze directory organization
  log-analyze update-meta              # Refresh metadata.json
  log-analyze all --json               # Full analysis in JSON
`);
}

function getAllFiles(dir, extension = '.md') {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  function walk(currentDir, depth = 0) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        walk(fullPath, depth + 1);
      } else if (item.isFile() && (extension === '*' || item.name.endsWith(extension))) {
        const stat = fs.statSync(fullPath);
        files.push({
          path: fullPath,
          relativePath: path.relative(CLAWD_ROOT, fullPath),
          name: item.name,
          size: stat.size,
          sizeKB: Math.round(stat.size / 1024 * 10) / 10,
          modified: stat.mtime,
          depth
        });
      }
    }
  }

  walk(dir);
  return files;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function analyzeStats(source = 'all') {
  const stats = {
    daily: { count: 0, totalSize: 0, files: [] },
    progress: { count: 0, totalSize: 0, files: [] },
    projects: { count: 0, totalSize: 0, files: [] },
    logs: { count: 0, totalSize: 0, files: [] }
  };

  const dirs = source === 'all' ? Object.keys(LOG_DIRS) : [source];

  for (const dirKey of dirs) {
    if (!LOG_DIRS[dirKey]) continue;
    const files = getAllFiles(LOG_DIRS[dirKey]);
    stats[dirKey] = {
      count: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      files
    };
  }

  return stats;
}

function displayStats(stats) {
  console.log(`\n${colors.bright}📊 Session Log Statistics${colors.reset}`);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);

  let totalFiles = 0;
  let totalSize = 0;

  for (const [source, data] of Object.entries(stats)) {
    totalFiles += data.count;
    totalSize += data.totalSize;

    console.log(`\n${colors.cyan}${source}${colors.reset}`);
    console.log(`  Files: ${data.count}`);
    console.log(`  Total Size: ${formatBytes(data.totalSize)}`);
    if (data.count > 0) {
      const avgSize = data.totalSize / data.count;
      console.log(`  Avg Size: ${formatBytes(avgSize)}`);
    }
  }

  console.log(`\n${colors.bright}TOTAL${colors.reset}`);
  console.log(`  Total Files: ${totalFiles}`);
  console.log(`  Total Size: ${formatBytes(totalSize)}`);
}

function analyzeSizes(stats, threshold = SIZE_THRESHOLDS.warning) {
  const large = [];
  const critical = [];

  for (const [source, data] of Object.entries(stats)) {
    for (const file of data.files) {
      if (file.sizeKB >= SIZE_THRESHOLDS.critical) {
        critical.push({ ...file, source });
      } else if (file.sizeKB >= threshold) {
        large.push({ ...file, source });
      }
    }
  }

  return { large, critical };
}

function displaySizes(sizeAnalysis) {
  console.log(`\n${colors.bright}📏 File Size Analysis${colors.reset}`);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);

  if (sizeAnalysis.critical.length > 0) {
    console.log(`\n${colors.red}🚨 Critical (>100KB) - Need attention:${colors.reset}`);
    for (const f of sizeAnalysis.critical.sort((a, b) => b.sizeKB - a.sizeKB)) {
      console.log(`  ${colors.red}${f.sizeKB} KB${colors.reset} - ${f.relativePath}`);
    }
  }

  if (sizeAnalysis.large.length > 0) {
    console.log(`\n${colors.yellow}⚠️  Warning (>50KB) - Consider splitting:${colors.reset}`);
    for (const f of sizeAnalysis.large.sort((a, b) => b.sizeKB - a.sizeKB).slice(0, 10)) {
      console.log(`  ${colors.yellow}${f.sizeKB} KB${colors.reset} - ${f.relativePath}`);
    }
    if (sizeAnalysis.large.length > 10) {
      console.log(`  ${colors.dim}... and ${sizeAnalysis.large.length - 10} more${colors.reset}`);
    }
  }

  if (sizeAnalysis.critical.length === 0 && sizeAnalysis.large.length === 0) {
    console.log(`\n${colors.green}✅ All files are within recommended size limits${colors.reset}`);
  }
}

function analyzeStructure(stats) {
  const structure = {};

  for (const [source, data] of Object.entries(stats)) {
    const depths = data.files.reduce((acc, f) => {
      acc[f.depth] = (acc[f.depth] || 0) + 1;
      return acc;
    }, {});

    structure[source] = {
      totalFiles: data.count,
      depthDistribution: depths,
      maxDepth: Math.max(...Object.keys(depths).map(Number), 0)
    };
  }

  return structure;
}

function displayStructure(structure) {
  console.log(`\n${colors.bright}🗂️  Directory Structure Analysis${colors.reset}`);
  console.log(colors.dim + '─'.repeat(50) + colors.reset);

  for (const [source, data] of Object.entries(structure)) {
    console.log(`\n${colors.cyan}${source}${colors.reset} (${data.totalFiles} files)`);
    console.log(`  Max depth: ${data.maxDepth}`);
    console.log('  Distribution by depth:');
    for (const [depth, count] of Object.entries(data.depthDistribution).sort((a, b) => a[0] - b[0])) {
      const bar = '█'.repeat(Math.min(count, 30));
      console.log(`    Level ${depth}: ${bar} ${count}`);
    }
  }
}

function updateMetadata(stats) {
  const metaPath = path.join(LOG_DIRS.logs, 'metadata.json');

  let totalFiles = 0;
  let totalSize = 0;
  const breakdown = {};

  for (const [source, data] of Object.entries(stats)) {
    totalFiles += data.count;
    totalSize += data.totalSize;
    breakdown[source] = {
      fileCount: data.count,
      totalSize: data.totalSize,
      avgSize: data.count > 0 ? Math.round(data.totalSize / data.count) : 0
    };
  }

  const metadata = {
    lastIndexed: new Date().toISOString(),
    totalFiles,
    fileCount: totalFiles,
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    breakdown,
    sizeThresholds: SIZE_THRESHOLDS,
    version: '1.0.0'
  };

  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  console.log(`${colors.green}✅ Updated ${metaPath}${colors.reset}`);
  
  return metadata;
}

function main() {
  const args = process.argv.slice(2);
  let command = 'stats';
  let source = 'all';
  let threshold = SIZE_THRESHOLDS.warning;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '-h' || arg === '--help') {
      showHelp();
      process.exit(0);
    } else if (arg === '-s' || arg === '--source') {
      source = next; i++;
    } else if (arg === '--threshold') {
      threshold = parseInt(next); i++;
    } else if (arg === '-j' || arg === '--json') {
      jsonOutput = true;
    } else if (!arg.startsWith('-')) {
      command = arg;
    }
  }

  // Gather stats
  const stats = analyzeStats(source);

  if (jsonOutput) {
    const output = {
      stats,
      sizes: analyzeSizes(stats, threshold),
      structure: analyzeStructure(stats)
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  switch (command) {
    case 'stats':
      displayStats(stats);
      break;
    case 'sizes':
    case 'large':
      displaySizes(analyzeSizes(stats, threshold));
      break;
    case 'structure':
      displayStructure(analyzeStructure(stats));
      break;
    case 'update-meta':
      updateMetadata(stats);
      break;
    case 'all':
      displayStats(stats);
      displaySizes(analyzeSizes(stats, threshold));
      displayStructure(analyzeStructure(stats));
      updateMetadata(stats);
      break;
    default:
      console.log(`Unknown command: ${command}`);
      showHelp();
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeStats, analyzeSizes, analyzeStructure, updateMetadata };
