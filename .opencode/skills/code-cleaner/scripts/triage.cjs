#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Constants ────────────────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git', '.next', '.nuxt',
  'coverage', '__pycache__', '.cache', '.output', '.turbo',
  '.vercel', '.svelte-kit', 'vendor', '.code-cleaner', '.bug-hunter',
]);

const ALLOWED_DOT_DIRS = new Set(['.github', '.vscode']);

const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.java', '.rb', '.php',
  '.vue', '.svelte', '.swift', '.kt', '.scala', '.cs',
]);

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const BUCKET_SIZE = 50;

const ENTRY_PATTERNS = /\b(index|main|app|server|cli|entry|bootstrap|start|setup|config|seed|migrate|worker)\b/i;
const CONFIG_PATTERNS = /\.(config|rc|setup|env)\./;

const EXPORT_PATTERNS = [
  /export\s+(default\s+)?(function|class|const|let|var|type|interface|enum)\s+(\w+)/g,
  /export\s*\{([^}]+)\}/g,
  /export\s+default\s+/g,
];

const IMPORT_PATTERNS = [
  /import\s+.*?from\s+['"]([^'"]+)['"]/g,
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

// ─── File Walking ─────────────────────────────────────────────────────────────

/**
 * Recursively walk a directory, yielding absolute file paths for source files.
 * Skips symlinks, oversized files, and excluded directories.
 */
function walkDir(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return results;
  }

  for (const entry of entries) {
    // Skip symlinks
    if (entry.isSymbolicLink()) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const name = entry.name;
      // Skip explicitly excluded dirs
      if (SKIP_DIRS.has(name)) continue;
      // Skip dot-prefixed dirs unless allowlisted
      if (name.startsWith('.') && !ALLOWED_DOT_DIRS.has(name)) continue;
      walkDir(fullPath, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!SOURCE_EXTENSIONS.has(ext)) continue;

      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (_) {
        continue;
      }
      if (stat.size > MAX_FILE_SIZE) continue;

      results.push(fullPath);
    }
  }

  return results;
}

// ─── SHA-256 Hashing ──────────────────────────────────────────────────────────

function hashFile(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (_) {
    return null;
  }
}

function findExactDuplicates(fileHashes) {
  // Group files by hash
  const byHash = new Map();
  for (const [file, hash] of Object.entries(fileHashes)) {
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push(file);
  }

  const groups = [];
  for (const [hash, files] of byHash) {
    if (files.length >= 2) {
      groups.push({ hash, files: files.sort() });
    }
  }
  return groups;
}

// ─── Similar Name Detection ───────────────────────────────────────────────────

function normalizeFilename(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  return name
    .toLowerCase()
    .replace(/[0-9]+/g, '')
    .replace(/[-_.]/g, '')
    .replace(/(helper|utils?|service|manager|handler|controller|hook|provider|middleware|factory|adapter|wrapper|decorator|interceptor|guard|pipe|filter|resolver|module|component|directive|store|reducer|action|selector|effect|saga|thunk|slice|context|ref|memo|callback)s?$/i, '');
}

const BARREL_NAMES = new Set(['index', 'barrel', 'exports', 'mod']);

function isBarrelFile(relPath) {
  const base = path.basename(relPath, path.extname(relPath)).toLowerCase();
  return BARREL_NAMES.has(base);
}

function findSimilarNameCandidates(relPaths) {
  const byNorm = new Map();
  for (const relPath of relPaths) {
    const norm = normalizeFilename(relPath);
    if (!norm) continue; // empty after stripping
    if (!byNorm.has(norm)) byNorm.set(norm, []);
    byNorm.get(norm).push(relPath);
  }

  const candidates = [];
  for (const [normalizedName, files] of byNorm) {
    if (files.length < 2) continue;

    // Must come from different directories
    const dirs = new Set(files.map((f) => path.dirname(f)));
    if (dirs.size < 2) continue;

    // Exclude groups where all files are index/barrel files
    if (files.every(isBarrelFile)) continue;

    candidates.push({ normalizedName, files: files.sort() });
  }
  return candidates;
}

// ─── Near-Clone Detection ─────────────────────────────────────────────────────

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (_) {
    return 0;
  }
}

function findNearCloneCandidates(relPaths, absPathMap) {
  // Build line count map (relPath → lineCount)
  const lineCounts = new Map();
  for (const relPath of relPaths) {
    const abs = absPathMap.get(relPath);
    if (!abs) continue;
    lineCounts.set(relPath, countLines(abs));
  }

  // Group by bucket
  const byBucket = new Map();
  for (const [relPath, lc] of lineCounts) {
    if (lc < 10) continue; // trivial files
    const bucket = Math.floor(lc / BUCKET_SIZE);
    if (!byBucket.has(bucket)) byBucket.set(bucket, []);
    byBucket.get(bucket).push(relPath);
  }

  // Merge adjacent buckets (±1) — collect sets of files per bucket group
  // Strategy: for each bucket, gather self + bucket-1 + bucket+1 files, deduplicate
  const candidates = [];
  const seen = new Set(); // avoid emitting same pair twice

  const allBuckets = [...byBucket.keys()].sort((a, b) => a - b);

  for (const bucket of allBuckets) {
    const files = new Set([
      ...(byBucket.get(bucket) || []),
      ...(byBucket.get(bucket - 1) || []),
      ...(byBucket.get(bucket + 1) || []),
    ]);

    if (files.size < 2 || files.size > 20) continue;

    const fileArr = [...files].sort();

    // Must come from different directories
    const dirs = new Set(fileArr.map((f) => path.dirname(f)));
    if (dirs.size < 2) continue;

    // All trivial check already done above (lc < 10 skipped)

    // Dedup: use sorted file list as key
    const key = fileArr.join('|');
    if (seen.has(key)) continue;
    seen.add(key);

    const lineRange = [bucket * BUCKET_SIZE, (bucket + 1) * BUCKET_SIZE - 1];
    candidates.push({ bucket, files: fileArr, lineRange });
  }

  return candidates;
}

// ─── Dead Code Detection ──────────────────────────────────────────────────────

function readFileContent(absPath) {
  try {
    return fs.readFileSync(absPath, 'utf8');
  } catch (_) {
    return '';
  }
}

/**
 * Extract exported symbols from a file's content.
 * Returns array of { symbol, line }.
 */
function extractExports(content) {
  const exports = [];
  const lines = content.split('\n');

  // Pattern 1: export function/class/const/etc. Name
  const pat1 = /export\s+(default\s+)?(function|class|const|let|var|type|interface|enum)\s+(\w+)/g;
  let m;
  while ((m = pat1.exec(content)) !== null) {
    const symbol = m[3];
    // Find line number
    const before = content.slice(0, m.index);
    const line = before.split('\n').length;
    exports.push({ symbol, line });
  }

  // Pattern 2: export { foo, bar as baz }
  const pat2 = /export\s*\{([^}]+)\}/g;
  while ((m = pat2.exec(content)) !== null) {
    const before = content.slice(0, m.index);
    const line = before.split('\n').length;
    const items = m[1].split(',').map((s) => s.trim());
    for (const item of items) {
      // "foo as bar" → export name is "bar", local is "foo"
      const asMatch = item.match(/(\w+)\s+as\s+(\w+)/);
      const symbol = asMatch ? asMatch[2] : item.replace(/\s+/g, '');
      if (symbol) exports.push({ symbol, line });
    }
  }

  // Pattern 3: export default (anonymous or expression) — use "__default__" sentinel
  const pat3 = /export\s+default\s+/g;
  while ((m = pat3.exec(content)) !== null) {
    // Only if not already captured by pat1
    // Skip if the character after "export default " starts a function/class keyword already captured
    const rest = content.slice(m.index + m[0].length).trimStart();
    if (/^(function|class)\s+(\w+)/.test(rest)) continue; // already caught by pat1
    const before = content.slice(0, m.index);
    const line = before.split('\n').length;
    exports.push({ symbol: '__default__', line });
  }

  return exports;
}

/**
 * Extract import/require specifiers from file content.
 * Returns array of specifier strings (may be relative).
 */
function extractImports(content) {
  const specifiers = [];

  const pat1 = /import\s+[\s\S]*?from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = pat1.exec(content)) !== null) {
    specifiers.push(m[1]);
  }

  const pat2 = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = pat2.exec(content)) !== null) {
    specifiers.push(m[1]);
  }

  const pat3 = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = pat3.exec(content)) !== null) {
    specifiers.push(m[1]);
  }

  return specifiers;
}

/**
 * Resolve a relative specifier from `fromAbs` to an absolute path.
 * Tries: bare, +extensions, +/index+extensions.
 */
function resolveSpecifier(specifier, fromAbs, allAbsSet) {
  if (!specifier.startsWith('.')) return null; // non-relative, skip

  const base = path.resolve(path.dirname(fromAbs), specifier);

  // Try exact
  if (allAbsSet.has(base)) return base;

  // Try with extensions
  for (const ext of SOURCE_EXTENSIONS) {
    const candidate = base + ext;
    if (allAbsSet.has(candidate)) return candidate;
  }

  // Try /index + extensions
  for (const ext of SOURCE_EXTENSIONS) {
    const candidate = path.join(base, 'index' + ext);
    if (allAbsSet.has(candidate)) return candidate;
  }

  return null;
}

function findDeadCode(relPaths, absPathMap, targetDir) {
  const allAbsSet = new Set(absPathMap.values());

  // Build exports map: absPath → [{ symbol, line }]
  const exportsMap = new Map();
  // Build imports map: absPath → [resolved abs paths]
  const importsMap = new Map();

  for (const relPath of relPaths) {
    const abs = absPathMap.get(relPath);
    if (!abs) continue;
    const content = readFileContent(abs);

    exportsMap.set(abs, extractExports(content));
    importsMap.set(abs, []);

    const rawImports = extractImports(content);
    for (const spec of rawImports) {
      const resolved = resolveSpecifier(spec, abs, allAbsSet);
      if (resolved) importsMap.get(abs).push(resolved);
    }
  }

  // Count how many times each file is imported
  const importCounts = new Map(); // absPath → count
  for (const abs of allAbsSet) importCounts.set(abs, 0);

  for (const [, importedList] of importsMap) {
    for (const imported of importedList) {
      importCounts.set(imported, (importCounts.get(imported) || 0) + 1);
    }
  }

  // Build set of imported files (for symbol-level dead export detection)
  // For each file, build set of symbols imported from it
  const importedSymbolsPerFile = new Map(); // absPath → Set<symbol>
  for (const abs of allAbsSet) importedSymbolsPerFile.set(abs, new Set());

  for (const [fromAbs, content] of [...allAbsSet].map((a) => [a, readFileContent(a)])) {
    // named imports: import { foo, bar } from './x'
    const namedPat = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = namedPat.exec(content)) !== null) {
      const spec = m[2];
      const resolved = resolveSpecifier(spec, fromAbs, allAbsSet);
      if (!resolved) continue;
      const items = m[1].split(',').map((s) => s.trim());
      for (const item of items) {
        const asMatch = item.match(/(\w+)\s+as\s+\w+/);
        const localName = asMatch ? asMatch[1] : item;
        if (localName) importedSymbolsPerFile.get(resolved)?.add(localName);
      }
    }

    // default imports: import Foo from './x'
    const defaultPat = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
    while ((m = defaultPat.exec(content)) !== null) {
      const spec = m[2];
      const resolved = resolveSpecifier(spec, fromAbs, allAbsSet);
      if (!resolved) continue;
      importedSymbolsPerFile.get(resolved)?.add('__default__');
    }

    // namespace imports: import * as Foo from './x' — treat as "uses everything"
    const nsPat = /import\s+\*\s+as\s+\w+\s+from\s+['"]([^'"]+)['"]/g;
    while ((m = nsPat.exec(content)) !== null) {
      const spec = m[1];
      const resolved = resolveSpecifier(spec, fromAbs, allAbsSet);
      if (!resolved) continue;
      // Mark file as "fully imported" — use sentinel
      importedSymbolsPerFile.get(resolved)?.add('__namespace__');
    }
  }

  const unusedExports = [];
  const unreachableFiles = [];

  for (const relPath of relPaths) {
    const abs = absPathMap.get(relPath);
    if (!abs) continue;

    const base = path.basename(relPath);
    const isEntry = ENTRY_PATTERNS.test(base) || CONFIG_PATTERNS.test(base);
    const isTest = /\.(test|spec)\.[a-z]+$/.test(base) || /\b(__tests?__|spec)\b/.test(relPath);
    const isDecl = base.endsWith('.d.ts');

    // Unreachable file check
    const importCount = importCounts.get(abs) || 0;
    if (!isEntry && !isTest && !isDecl && importCount === 0) {
      unreachableFiles.push({ file: relPath, reason: 'no-imports' });
    }

    // Unused exports check
    if (isTest || isDecl) continue;

    const fileSymbols = importedSymbolsPerFile.get(abs) || new Set();
    const hasNamespaceImport = fileSymbols.has('__namespace__');
    if (hasNamespaceImport) continue; // namespace import means everything is used

    const exports = exportsMap.get(abs) || [];
    for (const { symbol, line } of exports) {
      if (!fileSymbols.has(symbol)) {
        unusedExports.push({
          file: relPath,
          symbol,
          exportedAt: line,
          importCount: 0,
        });
      }
    }
  }

  return { unusedExports, unreachableFiles };
}

// ─── Incremental Delta ────────────────────────────────────────────────────────

function loadState(statePath) {
  if (!statePath) return null;
  try {
    const raw = fs.readFileSync(statePath, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

// ─── Main Scan ────────────────────────────────────────────────────────────────

function scan(targetDir, statePath, outputPath) {
  const absTarget = path.resolve(targetDir);

  // Walk files
  const absPaths = walkDir(absTarget);

  // Build abs→rel and rel→abs maps
  const absPathMap = new Map(); // relPath → absPath
  const relPaths = [];
  for (const abs of absPaths) {
    const rel = path.relative(absTarget, abs);
    relPaths.push(rel);
    absPathMap.set(rel, abs);
  }

  // Compute hashes
  const fileHashes = {};
  for (const relPath of relPaths) {
    const abs = absPathMap.get(relPath);
    const hash = hashFile(abs);
    if (hash) fileHashes[relPath] = hash;
  }

  // Incremental check
  const prevState = loadState(statePath);
  let mode = 'full';
  let changedFiles = [];

  if (prevState && prevState.fileHashes) {
    const prevHashes = prevState.fileHashes;
    const changed = [];

    // New or modified
    for (const [relPath, hash] of Object.entries(fileHashes)) {
      if (prevHashes[relPath] !== hash) {
        changed.push(relPath);
      }
    }
    // Deleted
    for (const relPath of Object.keys(prevHashes)) {
      if (!(relPath in fileHashes)) {
        changed.push(relPath);
      }
    }

    if (changed.length === 0) {
      const result = {
        generatedAt: new Date().toISOString(),
        target: absTarget,
        mode: 'skip',
        skipReason: 'No file changes since last scan',
        totalFiles: relPaths.length,
        changedFiles: [],
        fileHashes,
        exactDuplicates: prevState.exactDuplicates || [],
        similarNameCandidates: prevState.similarNameCandidates || [],
        nearCloneCandidates: prevState.nearCloneCandidates || [],
        deadCodeCandidates: prevState.deadCodeCandidates || { unusedExports: [], unreachableFiles: [] },
        candidateSummary: prevState.candidateSummary || buildSummary([], [], [], { unusedExports: [], unreachableFiles: [] }),
      };
      writeOutput(outputPath, result);
      return result;
    }

    mode = 'incremental';
    changedFiles = changed;
  }

  // Run all detections
  const exactDuplicates = findExactDuplicates(fileHashes);
  const similarNameCandidates = findSimilarNameCandidates(relPaths);
  const nearCloneCandidates = findNearCloneCandidates(relPaths, absPathMap);
  const deadCodeCandidates = findDeadCode(relPaths, absPathMap, absTarget);

  const candidateSummary = buildSummary(exactDuplicates, similarNameCandidates, nearCloneCandidates, deadCodeCandidates);

  const result = {
    generatedAt: new Date().toISOString(),
    target: absTarget,
    mode,
    skipReason: null,
    totalFiles: relPaths.length,
    changedFiles,
    fileHashes,
    exactDuplicates,
    similarNameCandidates,
    nearCloneCandidates,
    deadCodeCandidates,
    candidateSummary,
  };

  writeOutput(outputPath, result);
  return result;
}

function buildSummary(exactDuplicates, similarNameCandidates, nearCloneCandidates, deadCodeCandidates) {
  // exactDuplicateFiles: total number of files in duplicate groups
  const exactDuplicateFiles = exactDuplicates.reduce((sum, g) => sum + g.files.length, 0);

  // similarNamePairs: number of pairs (nC2 per group)
  const similarNamePairs = similarNameCandidates.reduce((sum, g) => {
    const n = g.files.length;
    return sum + (n * (n - 1)) / 2;
  }, 0);

  // nearClonePairs: number of pairs
  const nearClonePairs = nearCloneCandidates.reduce((sum, g) => {
    const n = g.files.length;
    return sum + (n * (n - 1)) / 2;
  }, 0);

  return {
    exactDuplicateFiles,
    similarNamePairs,
    nearClonePairs,
    unusedExports: deadCodeCandidates.unusedExports.length,
    unreachableFiles: deadCodeCandidates.unreachableFiles.length,
  };
}

function writeOutput(outputPath, result) {
  if (!outputPath) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return;
  }
  const absOut = path.resolve(outputPath);
  // Ensure parent directory exists
  const dir = path.dirname(absOut);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(absOut, JSON.stringify(result, null, 2), 'utf8');
}

// ─── CLI Entrypoint ───────────────────────────────────────────────────────────

function parseArgs(argv) {
  // node triage.cjs scan <target-path> --state <state-path> --output <output-path>
  const args = argv.slice(2);

  if (args[0] !== 'scan') {
    console.error('Usage: node triage.cjs scan <target-path> [--state <state-json-path>] [--output <output-json-path>]');
    process.exit(1);
  }

  const targetPath = args[1];
  if (!targetPath) {
    console.error('Error: <target-path> is required');
    process.exit(1);
  }

  let statePath = null;
  let outputPath = null;

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--state' && args[i + 1]) {
      statePath = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[++i];
    }
  }

  return { targetPath, statePath, outputPath };
}

function main() {
  const { targetPath, statePath, outputPath } = parseArgs(process.argv);

  if (!fs.existsSync(targetPath)) {
    console.error(`Error: target path does not exist: ${targetPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) {
    console.error(`Error: target path is not a directory: ${targetPath}`);
    process.exit(1);
  }

  const result = scan(targetPath, statePath, outputPath);

  if (outputPath) {
    const abs = path.resolve(outputPath);
    process.stderr.write(
      `Triage complete [${result.mode}]: ${result.totalFiles} files, ` +
        `${result.candidateSummary.exactDuplicateFiles} exact dups, ` +
        `${result.candidateSummary.similarNamePairs} similar-name pairs, ` +
        `${result.candidateSummary.nearClonePairs} near-clone pairs, ` +
        `${result.candidateSummary.unusedExports} unused exports, ` +
        `${result.candidateSummary.unreachableFiles} unreachable files\n` +
        `Output: ${abs}\n`
    );
  }
}

main();

module.exports = { scan, walkDir, hashFile, normalizeFilename, findExactDuplicates, findSimilarNameCandidates, findNearCloneCandidates, findDeadCode };
