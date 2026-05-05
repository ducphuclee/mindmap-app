#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'exact-duplicate',
  'near-duplicate',
  'redundant-wrapper',
  'dead-code',
  'overlapping-logic',
];

const SEVERITIES = ['High', 'Medium', 'Low'];

// ─── Merge ─────────────────────────────────────────────────────────────────────

/**
 * Merge findings and skeptic arrays by findingId.
 * Returns { confirmed, dismissed, manualReview } — each is an array of merged objects.
 */
function mergeByFindingId(findings, skeptic) {
  // Build skeptic lookup
  const skepticMap = new Map();
  for (const s of skeptic) {
    skepticMap.set(s.findingId, s);
  }

  const confirmed = [];
  const dismissed = [];
  const manualReview = [];

  for (const finding of findings) {
    const review = skepticMap.get(finding.findingId);
    const merged = { ...finding, ...(review ? review : {}) };

    if (!review) {
      // No skeptic review — treat as manual review
      manualReview.push(merged);
    } else if (review.response === 'ACCEPT') {
      confirmed.push(merged);
    } else if (review.response === 'DISMISS') {
      dismissed.push(merged);
    } else {
      // MANUAL_REVIEW
      manualReview.push(merged);
    }
  }

  return { confirmed, dismissed, manualReview };
}

// ─── Summary builders ──────────────────────────────────────────────────────────

function buildCategorySummary(confirmed) {
  const counts = {};
  const lines = {};
  for (const cat of CATEGORIES) {
    counts[cat] = 0;
    lines[cat] = 0;
  }
  for (const f of confirmed) {
    if (counts[f.category] !== undefined) {
      counts[f.category]++;
      lines[f.category] += f.estimatedDuplicationLines || 0;
    }
  }
  return { counts, lines };
}

function buildSeveritySummary(confirmed) {
  const bySeverity = { High: 0, Medium: 0, Low: 0 };
  for (const f of confirmed) {
    if (bySeverity[f.severity] !== undefined) {
      bySeverity[f.severity]++;
    }
  }
  return bySeverity;
}

// ─── Markdown Rendering ────────────────────────────────────────────────────────

function renderConfirmedFinding(f) {
  const files = (f.affectedFiles || []).map((fp) => `\`${fp}\``).join(', ');
  const confidence = f.confidenceScore !== undefined
    ? `${f.confidenceScore}${f.confidenceLabel ? ` (${f.confidenceLabel})` : ''}`
    : 'N/A';

  const lines = [
    `### ${f.findingId} | ${f.severity} | ${f.category}`,
    `**${f.title}**`,
    f.claim,
    `- Files: ${files || 'N/A'}`,
    `- Evidence: ${f.evidence || 'N/A'}`,
    `- Confidence: ${confidence}`,
  ];

  if (f.actionableNote) {
    lines.push(`- Action: ${f.actionableNote}`);
  }

  return lines.join('\n');
}

function renderManualReviewFinding(f) {
  const lines = [
    `### ${f.findingId} | ${f.severity} | ${f.category}`,
    `**${f.title}**`,
    f.claim,
  ];

  if (f.analysisSummary) {
    lines.push(`- Skeptic note: ${f.analysisSummary}`);
  }

  return lines.join('\n');
}

function renderMarkdown(confirmed, dismissed, manualReview, scanDate) {
  const totalReported = confirmed.length + dismissed.length + manualReview.length;
  const { counts, lines: linesByCategory } = buildCategorySummary(confirmed);

  const totalConfirmedLines = Object.values(linesByCategory).reduce((a, b) => a + b, 0);
  const totalCategoryCount = Object.values(counts).reduce((a, b) => a + b, 0);

  // Header
  const md = [
    '# Code Cleaner Report',
    '',
    `**Scan Date:** ${scanDate}`,
    `**Findings:** ${totalReported} reported | ${confirmed.length} confirmed | ${dismissed.length} dismissed | ${manualReview.length} manual review`,
    '',
    '## Summary',
    '',
    '| Category | Count | Estimated Lines |',
    '|----------|-------|-----------------|',
  ];

  for (const cat of CATEGORIES) {
    md.push(`| ${cat} | ${counts[cat]} | ${linesByCategory[cat]} |`);
  }
  md.push(`| **Total** | **${totalCategoryCount}** | **${totalConfirmedLines}** |`);

  // Confirmed
  md.push('');
  md.push('## Confirmed Findings');
  md.push('');

  if (confirmed.length === 0) {
    md.push('_No confirmed findings._');
  } else {
    for (const f of confirmed) {
      md.push(renderConfirmedFinding(f));
      md.push('');
    }
  }

  // Manual Review
  md.push('## Manual Review');
  md.push('');

  if (manualReview.length === 0) {
    md.push('_No findings require manual review._');
  } else {
    for (const f of manualReview) {
      md.push(renderManualReviewFinding(f));
      md.push('');
    }
  }

  // Dismissed
  md.push('## Dismissed');
  md.push('');

  if (dismissed.length === 0) {
    md.push('_No dismissed findings._');
  } else {
    md.push('| ID | Category | Reason |');
    md.push('|----|----------|--------|');
    for (const f of dismissed) {
      const reason = (f.analysisSummary || '').replace(/\|/g, '\\|');
      md.push(`| ${f.findingId} | ${f.category} | ${reason} |`);
    }
  }

  return md.join('\n');
}

// ─── Report JSON ───────────────────────────────────────────────────────────────

function buildReportJson(confirmed, dismissed, manualReview, scanDate) {
  const timestamp = Date.now();
  const totalReported = confirmed.length + dismissed.length + manualReview.length;
  const { counts } = buildCategorySummary(confirmed);
  const bySeverity = buildSeveritySummary(confirmed);
  const estimatedDuplicateLines = confirmed.reduce(
    (sum, f) => sum + (f.estimatedDuplicationLines || 0),
    0
  );

  return {
    version: '1.0.0',
    scanId: `cc-${timestamp}`,
    scanDate,
    mode: 'full',
    target: '.',
    filesScanned: 0,
    confirmed,
    dismissed,
    manualReview,
    summary: {
      totalReported,
      confirmed: confirmed.length,
      dismissed: dismissed.length,
      byCategory: counts,
      bySeverity,
      estimatedDuplicateLines,
    },
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    process.stderr.write('Usage: node render-report.cjs <findings-json> <skeptic-json>\n');
    process.exit(1);
  }

  const [findingsPath, skepticPath] = args;
  const absFindingsPath = path.resolve(findingsPath);
  const absSkepticPath = path.resolve(skepticPath);

  // Load findings
  let findings;
  try {
    findings = JSON.parse(fs.readFileSync(absFindingsPath, 'utf8'));
  } catch (err) {
    process.stderr.write(`Error reading findings file: ${err.message}\n`);
    process.exit(1);
  }

  // Load skeptic
  let skeptic;
  try {
    skeptic = JSON.parse(fs.readFileSync(absSkepticPath, 'utf8'));
  } catch (err) {
    process.stderr.write(`Error reading skeptic file: ${err.message}\n`);
    process.exit(1);
  }

  // Validate inputs are arrays
  if (!Array.isArray(findings)) {
    process.stderr.write('Error: findings JSON must be an array\n');
    process.exit(1);
  }
  if (!Array.isArray(skeptic)) {
    process.stderr.write('Error: skeptic JSON must be an array\n');
    process.exit(1);
  }

  const scanDate = new Date().toISOString();

  // Merge
  const { confirmed, dismissed, manualReview } = mergeByFindingId(findings, skeptic);

  // Render markdown → stdout
  const markdown = renderMarkdown(confirmed, dismissed, manualReview, scanDate);
  process.stdout.write(markdown + '\n');

  // Write report.json alongside findings
  const reportJsonPath = path.join(path.dirname(absFindingsPath), 'report.json');
  const reportJson = buildReportJson(confirmed, dismissed, manualReview, scanDate);
  try {
    fs.writeFileSync(reportJsonPath, JSON.stringify(reportJson, null, 2), 'utf8');
    process.stderr.write(`report.json written to: ${reportJsonPath}\n`);
  } catch (err) {
    process.stderr.write(`Warning: could not write report.json: ${err.message}\n`);
  }
}

main();
