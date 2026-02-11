#!/usr/bin/env node

/**
 * The Counsel - Multi-Agent Deliberation System
 * 
 * Usage:
 *   node counsel.js --question "..." --options "A,B,C" --context "..." --complexity standard
 * 
 * Complexity levels:
 *   standard  = 3 counselors, sonnet
 *   elevated  = 5 counselors, sonnet
 *   critical  = 5 counselors, opus
 *   maximum   = 7 counselors, opus
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const COMPLEXITY_CONFIG = {
  standard: { counselors: 3, model: 'sonnet' },
  elevated: { counselors: 5, model: 'sonnet' },
  critical: { counselors: 5, model: 'opus' },
  maximum:  { counselors: 7, model: 'opus' }
};

const PERSPECTIVES = [
  {
    name: 'The Architect',
    focus: 'system design, scalability, technical debt, architecture patterns',
    ask: 'How does this affect our system\'s structure and maintainability?'
  },
  {
    name: 'The Guardian',
    focus: 'security, privacy, compliance, risk mitigation, access control',
    ask: 'What could go wrong? How could this be exploited?'
  },
  {
    name: 'The Pragmatist',
    focus: 'implementation complexity, timeline, resources, team capabilities',
    ask: 'Can we actually build this? What\'s the realistic effort?'
  },
  {
    name: 'The Advocate',
    focus: 'user experience, accessibility, adoption, stakeholder needs',
    ask: 'How will users experience this? Will they adopt it?'
  },
  {
    name: 'The Skeptic',
    focus: 'edge cases, failure modes, what-ifs, stress testing assumptions',
    ask: 'What are we missing? What happens when X fails?'
  },
  {
    name: 'The Visionary',
    focus: 'long-term implications, future flexibility, strategic alignment',
    ask: 'How does this position us for the future?'
  },
  {
    name: 'The Historian',
    focus: 'precedent, patterns, industry standards, lessons learned',
    ask: 'What have others done? What patterns apply here?'
  }
];

function generateCounselorPrompt(perspective, question, context, options) {
  return `You are a Counselor in The Counsel, a multi-agent deliberation system for critical decisions.

YOUR PERSPECTIVE: ${perspective.name}
Focus on: ${perspective.focus}
Always ask yourself: "${perspective.ask}"

THE QUESTION:
${question}

CONTEXT:
${context}

OPTIONS:
${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}

YOUR TASK:
1. Analyze this decision ONLY from your perspective (${perspective.name})
2. Consider contingencies and dependencies relevant to your focus
3. Identify the key risk for each option from your viewpoint
4. Cast your vote for the best option

OUTPUT FORMAT (use exactly this format):
VOTE: [single letter A/B/C/etc]
CONFIDENCE: [high/medium/low]
REASONING: [2-3 sentences explaining your vote from your perspective]
KEY CONCERN: [The main risk if your non-preferred option is chosen]

Remember: You are ${perspective.name}. Stay in character and focus on ${perspective.focus}.`;
}

function parseVote(response) {
  const voteMatch = response.match(/VOTE:\s*([A-Z])/i);
  const confidenceMatch = response.match(/CONFIDENCE:\s*(high|medium|low)/i);
  const reasoningMatch = response.match(/REASONING:\s*(.+?)(?=KEY CONCERN:|$)/is);
  const concernMatch = response.match(/KEY CONCERN:\s*(.+)/is);

  return {
    vote: voteMatch ? voteMatch[1].toUpperCase() : null,
    confidence: confidenceMatch ? confidenceMatch[1].toLowerCase() : 'medium',
    reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
    concern: concernMatch ? concernMatch[1].trim() : ''
  };
}

function tallyVotes(votes, options) {
  const tally = {};
  options.forEach((_, i) => {
    tally[String.fromCharCode(65 + i)] = 0;
  });

  votes.forEach(v => {
    if (v.vote && tally.hasOwnProperty(v.vote)) {
      tally[v.vote]++;
    }
  });

  return tally;
}

function determineWinner(tally) {
  let maxVotes = 0;
  let winner = null;
  
  for (const [option, count] of Object.entries(tally)) {
    if (count > maxVotes) {
      maxVotes = count;
      winner = option;
    }
  }
  
  return { winner, votes: maxVotes };
}

function generateLogEntry(question, context, options, complexity, votes, tally, winner, timestamp) {
  const totalVotes = Object.values(tally).reduce((a, b) => a + b, 0);
  const winnerPct = Math.round((tally[winner] / totalVotes) * 100);

  let log = `# Counsel Decision: ${question.substring(0, 50)}...

**Convened:** ${timestamp}
**Complexity:** ${complexity}
**Counselors:** ${votes.length}
**Model:** ${COMPLEXITY_CONFIG[complexity].model}

## Question
${question}

## Context
${context}

## Options
${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}

## Votes

| Counselor | Vote | Confidence | Reasoning |
|-----------|------|------------|-----------|
${votes.map(v => `| ${v.perspective} | ${v.vote} | ${v.confidence} | ${v.reasoning.substring(0, 100)}... |`).join('\n')}

## Tally
${Object.entries(tally).map(([opt, count]) => `- Option ${opt}: ${count} votes`).join('\n')}

## Decision: Option ${winner} (${winnerPct}% consensus)

## Key Concerns from Dissenters
${votes.filter(v => v.vote !== winner).map(v => `- **${v.perspective}:** ${v.concern}`).join('\n') || '(None - unanimous decision)'}

## Recommended Mitigations
Based on dissenting concerns, consider:
${votes.filter(v => v.vote !== winner).map(v => `- Address ${v.perspective.toLowerCase()}'s concern about: ${v.concern.substring(0, 50)}...`).join('\n') || '- No mitigations needed (unanimous)'}
`;

  return log;
}

async function convene(question, context, optionsArray, complexity = 'standard') {
  const config = COMPLEXITY_CONFIG[complexity];
  if (!config) {
    throw new Error(`Invalid complexity: ${complexity}. Use: standard, elevated, critical, maximum`);
  }

  const timestamp = new Date().toISOString();
  const perspectives = PERSPECTIVES.slice(0, config.counselors);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`THE COUNSEL CONVENED`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Question: ${question}`);
  console.log(`Complexity: ${complexity} (${config.counselors} counselors, ${config.model})`);
  console.log(`${'='.repeat(60)}\n`);

  // For now, output the prompts that should be sent to each counselor
  // In production, this would use sessions_spawn or similar
  
  const votes = [];
  
  for (let i = 0; i < perspectives.length; i++) {
    const perspective = perspectives[i];
    const prompt = generateCounselorPrompt(perspective, question, context, optionsArray);
    
    console.log(`\n--- Counselor ${i + 1}: ${perspective.name} ---`);
    console.log(`Prompt length: ${prompt.length} chars`);
    console.log(`Focus: ${perspective.focus}\n`);
    
    // In a real implementation, we'd spawn sub-agents here
    // For now, we output the prompt for manual/scripted execution
    
    // Placeholder vote (would come from actual agent response)
    votes.push({
      perspective: perspective.name,
      vote: null,
      confidence: null,
      reasoning: '[Awaiting counselor response]',
      concern: '[Awaiting counselor response]',
      prompt: prompt
    });
  }

  // Output prompts for execution
  const promptsFile = `/tmp/counsel-prompts-${Date.now()}.json`;
  fs.writeFileSync(promptsFile, JSON.stringify({
    timestamp,
    question,
    context,
    options: optionsArray,
    complexity,
    config,
    counselors: votes.map(v => ({
      perspective: v.perspective,
      prompt: v.prompt
    }))
  }, null, 2));
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PROMPTS EXPORTED`);
  console.log(`${'='.repeat(60)}`);
  console.log(`File: ${promptsFile}`);
  console.log(`\nTo execute: Spawn ${config.counselors} sub-agents with these prompts,`);
  console.log(`collect responses, then run: node counsel.js --tally ${promptsFile}`);
  
  return {
    promptsFile,
    counselors: config.counselors,
    model: config.model
  };
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
The Counsel - Multi-Agent Deliberation System

Usage:
  node counsel.js --question "..." --options "A,B,C" --context "..." --complexity standard

Options:
  --question    The decision to be made (required)
  --options     Comma-separated list of options (required)
  --context     Background information (required)
  --complexity  standard|elevated|critical|maximum (default: standard)
  --tally       Path to prompts JSON to tally results

Complexity levels:
  standard  = 3 counselors, sonnet  (~$0.20)
  elevated  = 5 counselors, sonnet  (~$0.35)
  critical  = 5 counselors, opus    (~$2.00)
  maximum   = 7 counselors, opus    (~$3.00)
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

  if (!question || !optionsStr || !context) {
    console.error('Error: --question, --options, and --context are required');
    process.exit(1);
  }

  const options = optionsStr.split(',').map(s => s.trim());

  convene(question, context, options, complexity)
    .then(result => {
      console.log('\nCounsel convened successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = { convene, generateCounselorPrompt, parseVote, tallyVotes, determineWinner };
