#!/usr/bin/env node
/**
 * Session Log Search Tool
 * Task: p3-1 - Audit and Refactor Session Logs
 * 
 * Searches across daily logs, progress logs, and project logs
 * with support for date filtering, keyword search, and project filtering.
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
${colors.bright}Session Log Search Tool${colors.reset}
${colors.dim}─────────────────────────────────────${colors.reset}

${colors.cyan}Usage:${colors.reset}
  log-search <query> [options]

${colors.cyan}Options:${colors.reset}
  -h, --help              Show this help message
  -d, --date <YYYY-MM-DD> Filter by specific date
  -f, --from <YYYY-MM-DD> Filter from date (inclusive)
  -t, --to <YYYY-MM-DD>   Filter to date (inclusive)
  -p, --project <name>    Filter by project name
  -s, --source <type>     Filter by source (daily|progress|projects|all)
  -l, --limit <n>         Limit results (default: 20)
  -c, --context <n>       Lines of context around match (default: 2)
  -i, --insensitive       Case-insensitive search (default: true)
  -v, --verbose           Show full file paths

${colors.cyan}Examples:${colors.reset}
  log-search "build error"                    # Search all logs
  log-search "melo" --project melo-v2        # Search within melo-v2 project
  log-search "completed" --from 2026-02-20   # Search from date
  log-search "matrix" --source progress      # Search only progress logs
  log-search "TDD" --context 5               # Show 5 lines context

${colors.cyan}Search Locations:${colors.reset}
  daily:    memory/daily/*.md
  progress: scheduler/progress/**/*.md
  projects: memory/projects/**/*.md
  logs:     memory/logs/**/*
`);
}

function parseArgs(args) {
  const opts = {
    query: null,
    date: null,
    from: null,
    to: null,
    project: null,
    source: 'all',
    limit: 20,
    context: 2,
    insensitive: true,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '-h' || arg === '--help') {
      showHelp();
      process.exit(0);
    } else if (arg === '-d' || arg === '--date') {
      opts.date = next; i++;
    } else if (arg === '-f' || arg === '--from' || arg === '--since') {
      opts.from = next; i++;
    } else if (arg === '-t' || arg === '--to') {
      opts.to = next; i++;
    } else if (arg === '-p' || arg === '--project') {
      opts.project = next; i++;
    } else if (arg === '-s' || arg === '--source') {
      opts.source = next; i++;
    } else if (arg === '-l' || arg === '--limit') {
      opts.limit = parseInt(next); i++;
    } else if (arg === '-c' || arg === '--context') {
      opts.context = parseInt(next); i++;
    } else if (arg === '-i' || arg === '--insensitive') {
      opts.insensitive = true;
    } else if (arg === '-v' || arg === '--verbose') {
      opts.verbose = true;
    } else if (!arg.startsWith('-') && !opts.query) {
      opts.query = arg;
    }
  }

  return opts;
}

function getAllFiles(dir, extension = '.md') {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        walk(fullPath);
      } else if (item.isFile() && item.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function filterByDate(files, opts) {
  if (!opts.date && !opts.from && !opts.to) return files;

  return files.filter(file => {
    const basename = path.basename(file);
    // Try to extract date from filename (YYYY-MM-DD pattern)
    const dateMatch = basename.match(/(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) {
      // If no date in filename, check file modification time
      const stat = fs.statSync(file);
      const fileDate = stat.mtime.toISOString().split('T')[0];
      return checkDateRange(fileDate, opts);
    }
    return checkDateRange(dateMatch[1], opts);
  });
}

function checkDateRange(fileDate, opts) {
  if (opts.date && fileDate !== opts.date) return false;
  if (opts.from && fileDate < opts.from) return false;
  if (opts.to && fileDate > opts.to) return false;
  return true;
}

function filterByProject(files, project) {
  if (!project) return files;
  const lowerProject = project.toLowerCase();
  return files.filter(file => {
    const filePath = file.toLowerCase();
    return filePath.includes(lowerProject);
  });
}

function searchInFile(filePath, query, opts) {
  const results = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const searchQuery = opts.insensitive ? query.toLowerCase() : query;

  for (let i = 0; i < lines.length; i++) {
    const line = opts.insensitive ? lines[i].toLowerCase() : lines[i];
    if (line.includes(searchQuery)) {
      const contextStart = Math.max(0, i - opts.context);
      const contextEnd = Math.min(lines.length - 1, i + opts.context);
      const contextLines = lines.slice(contextStart, contextEnd + 1);
      
      results.push({
        file: filePath,
        lineNumber: i + 1,
        matchLine: lines[i],
        context: contextLines,
        contextStart: contextStart + 1
      });
    }
  }

  return results;
}

function getFilesForSource(source, project) {
  let files = [];

  if (source === 'all' || source === 'daily') {
    files = files.concat(getAllFiles(LOG_DIRS.daily));
  }
  if (source === 'all' || source === 'progress') {
    files = files.concat(getAllFiles(LOG_DIRS.progress));
  }
  if (source === 'all' || source === 'projects') {
    files = files.concat(getAllFiles(LOG_DIRS.projects));
  }
  if (source === 'all' || source === 'logs') {
    files = files.concat(getAllFiles(LOG_DIRS.logs));
  }

  if (project) {
    files = filterByProject(files, project);
  }

  return files;
}

function displayResults(results, opts) {
  if (results.length === 0) {
    console.log(`${colors.yellow}No results found.${colors.reset}`);
    return;
  }

  console.log(`\n${colors.green}Found ${results.length} matches${colors.reset}\n`);

  const displayed = results.slice(0, opts.limit);
  for (const result of displayed) {
    const relPath = opts.verbose 
      ? result.file 
      : path.relative(CLAWD_ROOT, result.file);
    
    console.log(`${colors.cyan}📄 ${relPath}${colors.reset}:${colors.yellow}${result.lineNumber}${colors.reset}`);
    
    result.context.forEach((line, i) => {
      const lineNum = result.contextStart + i;
      const isMatch = lineNum === result.lineNumber;
      const prefix = isMatch ? `${colors.green}>>${colors.reset}` : '  ';
      const lineText = isMatch ? `${colors.bright}${line}${colors.reset}` : `${colors.dim}${line}${colors.reset}`;
      console.log(`${prefix} ${colors.dim}${lineNum}${colors.reset} ${lineText}`);
    });
    console.log();
  }

  if (results.length > opts.limit) {
    console.log(`${colors.dim}... and ${results.length - opts.limit} more results (use --limit to see more)${colors.reset}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const opts = parseArgs(args);

  if (!opts.query) {
    console.log(`${colors.red}Error: Please provide a search query${colors.reset}`);
    console.log(`Use ${colors.cyan}--help${colors.reset} for usage information`);
    process.exit(1);
  }

  console.log(`${colors.bright}Searching for: "${opts.query}"${colors.reset}`);
  if (opts.project) console.log(`${colors.dim}Project filter: ${opts.project}${colors.reset}`);
  if (opts.from) console.log(`${colors.dim}From: ${opts.from}${colors.reset}`);
  if (opts.to) console.log(`${colors.dim}To: ${opts.to}${colors.reset}`);
  if (opts.date) console.log(`${colors.dim}Date: ${opts.date}${colors.reset}`);

  // Get files to search
  let files = getFilesForSource(opts.source, opts.project);
  files = filterByDate(files, opts);

  console.log(`${colors.dim}Searching ${files.length} files...${colors.reset}`);

  // Search all files
  const allResults = [];
  for (const file of files) {
    try {
      const results = searchInFile(file, opts.query, opts);
      allResults.push(...results);
    } catch (e) {
      // Skip files we can't read
    }
  }

  displayResults(allResults, opts);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { searchInFile, getAllFiles, filterByDate, filterByProject };
