#!/usr/bin/env node

/**
 * ⚖️ The Counsel - Multi-Agent Deliberation System
 * 
 * The Circle at maximum weight — for decisions that can't be wrong.
 * 
 * Spawns N counselors (3/5/7) who each analyze from their perspective,
 * vote, and provide reasoning. Votes are tallied and the winner declared.
 * Full decision logged to memory/counsel/ for future reference.
 * 
 * Usage:
 *   node counsel.js --question "..." --options "A,B,C" --context "..." --complexity standard
 * 
 * Complexity levels:
 *   light     = 3 counselors, sonnet  (~$0.15)
 *   standard  = 3 counselors, sonnet  (~$0.20)
 *   elevated  = 5 counselors, sonnet  (~$0.35)
 *   critical  = 5 counselors, opus    (~$2.00)
 *   maximum   = 7 counselors, opus    (~$3.00)
 * 
 * Callable from other agents:
 *   const { convene } = require('./counsel.js');
 *   const result = await convene(question, context, options, complexity);
 * 
 * Docs:
 *   - Full spec: docs/THE-COUNSEL.md
 *   - Skill guide: skills/counsel/SKILL.md
 *   - Framework: docs/THE-CIRCLE.md
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
// Note: Claude Code credential only allows sonnet/opus, not haiku
const COMPLEXITY_CONFIG = {
  light:    { counselors: 3, model: 'sonnet' },   // Was haiku, but credential doesn't allow it
  standard: { counselors: 3, model: 'sonnet' },
  elevated: { counselors: 5, model: 'sonnet' },
  critical: { counselors: 5, model: 'opus' },
  maximum:  { counselors: 7, model: 'opus' }
};

// Use model aliases accepted by claude CLI
const MODEL_MAP = {
  sonnet: 'sonnet',
  opus: 'opus'
};

const PERSPECTIVES = [
  {
    id: 'architect',
    name: 'The Architect',
    emoji: '🏛️',
    focus: 'system design, scalability, technical debt, architecture patterns, data flow',
    ask: 'How does this affect our system\'s structure, maintainability, and growth?'
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    emoji: '🛡️',
    focus: 'security, privacy, compliance, risk mitigation, failure modes, data safety',
    ask: 'What could go wrong? How could this be exploited or fail catastrophically?'
  },
  {
    id: 'pragmatist',
    name: 'The Pragmatist',
    emoji: '🔧',
    focus: 'implementation complexity, timeline, resources, team capabilities, dependencies',
    ask: 'Can we actually build this well? What\'s the realistic effort and maintenance burden?'
  },
  {
    id: 'skeptic',
    name: 'The Skeptic',
    emoji: '🔍',
    focus: 'edge cases, hidden assumptions, what-ifs, stress testing, devil\'s advocate',
    ask: 'What assumptions are we making? What happens under unusual conditions?'
  },
  {
    id: 'visionary',
    name: 'The Visionary',
    emoji: '🔮',
    focus: 'long-term implications, future flexibility, strategic alignment, evolution path',
    ask: 'How does this position us for the future? Will we regret this in 2 years?'
  },
  {
    id: 'empath',
    name: 'The Empath',
    emoji: '💜',
    focus: 'user experience, developer experience, adoption friction, emotional impact',
    ask: 'How will users and developers feel about this? What friction will they encounter?'
  },
  {
    id: 'historian',
    name: 'The Historian',
    emoji: '📚',
    focus: 'precedent, patterns, industry standards, lessons from similar decisions',
    ask: 'What have others done? What patterns and anti-patterns apply here?'
  }
];

function generateCounselorPrompt(perspective, question, context, options) {
  // Note: Avoid Unicode emoji in prompts - causes credential validation issues with Claude CLI
  return `You are ${perspective.name}, a Counselor in The Counsel - a multi-agent deliberation system for critical decisions.

YOUR IDENTITY: ${perspective.name}
YOUR FOCUS: ${perspective.focus}
YOUR KEY QUESTION: "${perspective.ask}"

---
THE DECISION
---

QUESTION:
${question}

CONTEXT:
${context}

OPTIONS:
${options.map((opt, i) => `  ${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}

---
YOUR TASK
---

Analyze this decision STRICTLY from your perspective as ${perspective.name}.

1. Consider: ${perspective.ask}
2. Evaluate each option through your lens (${perspective.focus})
3. Identify key risks/benefits from YOUR viewpoint
4. Cast your vote

OUTPUT FORMAT (use EXACTLY this format - parseable):

VOTE: [A/B/C/etc - single letter only]
CONFIDENCE: [high/medium/low]
REASONING: [2-3 sentences explaining your vote from your perspective]
KEY_CONCERN: [The main risk if your non-preferred option is chosen]
MITIGATION: [One action to address concerns if your vote loses]

IMPORTANT: Stay in character as ${perspective.name}. Do not consider factors outside your focus area - other counselors handle those perspectives.`;
}

function parseVote(response, perspectiveName, emoji) {
  // More robust parsing with fallbacks
  const voteMatch = response.match(/VOTE:\s*([A-Z])/i);
  const confidenceMatch = response.match(/CONFIDENCE:\s*(high|medium|low)/i);
  const reasoningMatch = response.match(/REASONING:\s*(.+?)(?=KEY_CONCERN:|MITIGATION:|$)/is);
  const concernMatch = response.match(/KEY_CONCERN:\s*(.+?)(?=MITIGATION:|$)/is);
  const mitigationMatch = response.match(/MITIGATION:\s*(.+)/is);

  return {
    perspective: `${emoji} ${perspectiveName}`,  // Add emoji for display
    perspectivePlain: perspectiveName,
    emoji: emoji,
    vote: voteMatch ? voteMatch[1].toUpperCase() : null,
    confidence: confidenceMatch ? confidenceMatch[1].toLowerCase() : 'medium',
    reasoning: reasoningMatch ? reasoningMatch[1].trim().replace(/\n/g, ' ') : '',
    concern: concernMatch ? concernMatch[1].trim().replace(/\n/g, ' ') : '',
    mitigation: mitigationMatch ? mitigationMatch[1].trim().replace(/\n/g, ' ') : '',
    raw: response
  };
}

function tallyVotes(votes, options) {
  const tally = {};
  options.forEach((_, i) => {
    tally[String.fromCharCode(65 + i)] = { count: 0, voters: [], confidence: [] };
  });

  votes.forEach(v => {
    if (v.vote && tally.hasOwnProperty(v.vote)) {
      tally[v.vote].count++;
      tally[v.vote].voters.push(v.perspective);
      tally[v.vote].confidence.push(v.confidence);
    }
  });

  return tally;
}

function determineWinner(tally) {
  let maxVotes = 0;
  let winner = null;
  let tied = [];
  
  for (const [option, data] of Object.entries(tally)) {
    if (data.count > maxVotes) {
      maxVotes = data.count;
      winner = option;
      tied = [option];
    } else if (data.count === maxVotes && maxVotes > 0) {
      tied.push(option);
    }
  }
  
  // Handle case where no valid votes were cast
  if (!winner) {
    const options = Object.keys(tally);
    winner = options[0] || 'A'; // Fallback to first option
  }
  
  return { 
    winner, 
    votes: maxVotes, 
    unanimous: Object.values(tally).filter(t => t.count > 0).length === 1,
    tied: tied.length > 1 ? tied : null,
    noVotes: maxVotes === 0
  };
}

function generateSlug(question) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
}

function generateLogEntry(question, context, options, complexity, votes, tally, result, timestamp) {
  const totalVotes = votes.length;
  const winnerPct = Math.round((result.votes / totalVotes) * 100);
  const config = COMPLEXITY_CONFIG[complexity];
  
  const confidenceEmoji = { high: '🟢', medium: '🟡', low: '🔴' };

  let log = `# ⚖️ Council Decision: ${question}

**🕐 Convened:** ${timestamp}
**⚙️ Complexity:** ${complexity}
**👥 Counselors:** ${votes.length}
**🤖 Model:** ${config.model}

---

## 📋 The Question
${question}

## 📄 Context
${context}

## 🎯 Options
${options.map((opt, i) => `- **${String.fromCharCode(65 + i)})** ${opt}`).join('\n')}

---

## 🗳️ Votes

| Counselor | Vote | Confidence | Reasoning |
|-----------|------|------------|-----------|
${votes.map(v => `| ${v.perspective} | **${v.vote || '?'}** | ${confidenceEmoji[v.confidence] || '⚪'} ${v.confidence || 'unknown'} | ${v.reasoning.substring(0, 150)}${v.reasoning.length > 150 ? '...' : ''} |`).join('\n')}

---

## 📊 Tally
\`\`\`
${Object.entries(tally).map(([opt, data]) => {
  const bar = '█'.repeat(data.count * 3) + '░'.repeat((totalVotes - data.count) * 3);
  const pct = Math.round((data.count / totalVotes) * 100);
  const marker = opt === result.winner ? ' ✅' : '';
  return `Option ${opt}: ${bar} ${data.count} votes (${pct}%)${marker}`;
}).join('\n')}
\`\`\`

## ✅ Decision: Option ${result.winner}
${result.unanimous ? '🎉 **Unanimous decision!**' : `With ${winnerPct}% consensus (${result.votes}/${totalVotes} votes)`}
${result.tied ? `\n⚠️ **Note:** Tie between options ${result.tied.join(', ')} — ${result.winner} selected as first in tie.` : ''}

---

## 💜 Empathy Considerations
${votes.filter(v => v.perspective.includes('Empath')).map(v => v.reasoning).join('\n\n') || '*No dedicated empathy counselor in this council.*'}

## ⚠️ Dissenting Concerns
${votes.filter(v => v.vote !== result.winner).map(v => `- **${v.perspective}:** ${v.concern}`).join('\n') || '*None — unanimous decision!*'}

## 🛡️ Recommended Mitigations
${votes.filter(v => v.vote !== result.winner && v.mitigation).map(v => `- ${v.mitigation}`).join('\n') || '*No mitigations needed.*'}

---

## 📝 Full Counselor Responses

${votes.map(v => `### ${v.perspective}
**Vote:** ${v.vote} | **Confidence:** ${v.confidence}

**Reasoning:** ${v.reasoning}

**Key Concern:** ${v.concern}

**Mitigation:** ${v.mitigation}
`).join('\n')}

---

*⚖️ The Counsel has spoken.*
`;

  return log;
}

async function queryCounselor(perspective, prompt, model, verbose = false) {
  const modelId = MODEL_MAP[model] || MODEL_MAP.sonnet;
  
  if (verbose) {
    console.log(`  📤 Querying ${perspective.emoji} ${perspective.name}...`);
  }

  // Write prompt to temp file to avoid shell escaping issues
  const tempFile = `/tmp/counsel-prompt-${perspective.id}-${Date.now()}.txt`;

  try {
    fs.writeFileSync(tempFile, prompt);
    
    // Use claude CLI with JSON output, reading prompt from file
    const cmd = `cat "${tempFile}" | claude -p - --model ${modelId} --output-format json`;
    
    const result = execSync(cmd, { 
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024,
      timeout: 180000 // 3 minute timeout per counselor
    });

    // Clean up temp file
    try { fs.unlinkSync(tempFile); } catch (e) {}

    // Parse JSON response
    const json = JSON.parse(result);
    const response = json.result || result;
    
    if (verbose) {
      console.log(`  ✅ ${perspective.emoji} ${perspective.name} responded`);
    }

    return parseVote(response, perspective.name, perspective.emoji);
    
  } catch (err) {
    // Clean up temp file on error
    try { fs.unlinkSync(tempFile); } catch (e) {}
    
    console.error(`  ❌ ${perspective.emoji} ${perspective.name} failed: ${err.message}`);
    return {
      perspective: `${perspective.emoji} ${perspective.name}`,
      perspectivePlain: perspective.name,
      emoji: perspective.emoji,
      vote: null,
      confidence: 'low',
      reasoning: `[Error: ${err.message}]`,
      concern: '[Could not query this counselor]',
      mitigation: '',
      raw: ''
    };
  }
}

async function convene(question, context, optionsArray, complexity = 'standard', options = {}) {
  const { verbose = true, parallel = false } = options;  // Sequential by default for reliability
  
  const config = COMPLEXITY_CONFIG[complexity];
  if (!config) {
    throw new Error(`Invalid complexity: ${complexity}. Use: light, standard, elevated, critical, maximum`);
  }

  const timestamp = new Date().toISOString();
  const dateStr = new Date().toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0];
  const slug = generateSlug(question);
  const perspectives = PERSPECTIVES.slice(0, config.counselors);
  
  if (verbose) {
    console.log(`\n╔${'═'.repeat(60)}╗`);
    console.log(`║  ⚖️  THE COUNSEL CONVENED  ⚖️${' '.repeat(31)}║`);
    console.log(`╠${'═'.repeat(60)}╣`);
    console.log(`║  📋 Question: ${question.substring(0, 44)}${question.length > 44 ? '...' : ''}${' '.repeat(Math.max(0, 44 - question.substring(0, 44).length))}║`);
    console.log(`║  ⚙️  Complexity: ${complexity} (${config.counselors} counselors, ${config.model})${' '.repeat(Math.max(0, 30 - complexity.length - config.model.length))}║`);
    console.log(`╚${'═'.repeat(60)}╝\n`);
    console.log(`📨 Dispatching counselors...\n`);
  }

  let votes;

  if (parallel) {
    // Query all counselors in parallel
    const promises = perspectives.map(perspective => {
      const prompt = generateCounselorPrompt(perspective, question, context, optionsArray);
      return queryCounselor(perspective, prompt, config.model, verbose);
    });
    votes = await Promise.all(promises);
  } else {
    // Query sequentially
    votes = [];
    for (const perspective of perspectives) {
      const prompt = generateCounselorPrompt(perspective, question, context, optionsArray);
      const vote = await queryCounselor(perspective, prompt, config.model, verbose);
      votes.push(vote);
    }
  }

  // Tally votes
  const tally = tallyVotes(votes, optionsArray);
  const result = determineWinner(tally);

  if (verbose) {
    console.log(`\n╔${'═'.repeat(60)}╗`);
    console.log(`║  ⚖️  THE COUNSEL HAS DECIDED  ⚖️${' '.repeat(27)}║`);
    console.log(`╠${'═'.repeat(60)}╣`);
    console.log(`║  📊 TALLY${' '.repeat(50)}║`);
    
    Object.entries(tally).forEach(([opt, data]) => {
      const bar = '█'.repeat(data.count * 4) + '░'.repeat((votes.length - data.count) * 4);
      const pct = Math.round((data.count / votes.length) * 100);
      const marker = opt === result.winner ? ' ✅' : '';
      const line = `  Option ${opt}: ${bar} ${data.count} (${pct}%)${marker}`;
      console.log(`║${line}${' '.repeat(Math.max(1, 60 - line.length))}║`);
    });
    
    console.log(`║${' '.repeat(60)}║`);
    console.log(`║  ✅ DECISION: Option ${result.winner}${result.unanimous ? ' (unanimous!)' : ''}${' '.repeat(Math.max(1, 35 - (result.unanimous ? 13 : 0)))}║`);
    console.log(`╚${'═'.repeat(60)}╝\n`);
  }

  // Generate and save log
  const logContent = generateLogEntry(question, context, optionsArray, complexity, votes, tally, result, timestamp);
  const logDir = path.join(process.env.HOME || '/home/ubuntu', 'clawd', 'memory', 'counsel');
  const logFile = path.join(logDir, `${dateStr.substring(0, 16)}-${slug}.md`);

  // Ensure directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.writeFileSync(logFile, logContent);

  if (verbose) {
    console.log(`📝 Decision logged to: ${logFile}\n`);
  }

  const winnerIndex = result.winner ? result.winner.charCodeAt(0) - 65 : 0;
  
  return {
    decision: result.winner,
    option: optionsArray[winnerIndex] || optionsArray[0],
    votes: result.votes,
    total: votes.length,
    unanimous: result.unanimous,
    tied: result.tied,
    noVotes: result.noVotes,
    tally,
    counselorVotes: votes,
    logFile,
    timestamp
  };
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
⚖️ The Counsel - Multi-Agent Deliberation System

Usage:
  node counsel.js --question "..." --options "A,B,C" --context "..." --complexity standard

Required Arguments:
  --question    The decision to be made
  --options     Comma-separated list of options (e.g., "PostgreSQL,SQLite,MongoDB")
  --context     Background information and constraints

Optional Arguments:
  --complexity  light|standard|elevated|critical|maximum (default: standard)
  --sequential  Query counselors one at a time (slower but cleaner logs)
  --quiet       Minimal output

Complexity Levels:
  light     = 3 counselors, sonnet  (~$0.15)
  standard  = 3 counselors, sonnet  (~$0.20)
  elevated  = 5 counselors, sonnet  (~$0.35)
  critical  = 5 counselors, opus    (~$2.00)
  maximum   = 7 counselors, opus    (~$3.00)

Examples:
  # Quick decision with 3 Haiku counselors
  node counsel.js --question "Redis or Memcached for caching?" \\
    --options "Redis,Memcached" \\
    --context "Simple key-value caching for sessions" \\
    --complexity light

  # Full council for critical architecture decision
  node counsel.js --question "Which database for our new app?" \\
    --options "PostgreSQL,SQLite,MongoDB" \\
    --context "Multi-user web app, need transactions, expecting 10k users" \\
    --complexity maximum
`);
    process.exit(0);
  }

  // Parse arguments
  const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const question = getArg('question');
  const optionsStr = getArg('options');
  const context = getArg('context');
  const complexity = getArg('complexity') || 'standard';
  const sequential = args.includes('--sequential');
  const quiet = args.includes('--quiet');

  if (!question || !optionsStr || !context) {
    console.error('Error: --question, --options, and --context are required');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  const optionsArray = optionsStr.split(',').map(s => s.trim());

  convene(question, context, optionsArray, complexity, { verbose: !quiet, parallel: !sequential })
    .then(result => {
      if (!quiet) {
        console.log('═'.repeat(60));
        console.log(`FINAL DECISION: ${result.decision}) ${result.option}`);
        console.log('═'.repeat(60));
      } else {
        // JSON output for programmatic use
        console.log(JSON.stringify(result, null, 2));
      }
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = { 
  convene, 
  generateCounselorPrompt, 
  parseVote, 
  tallyVotes, 
  determineWinner,
  COMPLEXITY_CONFIG,
  PERSPECTIVES 
};
