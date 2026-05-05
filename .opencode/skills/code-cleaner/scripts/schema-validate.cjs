#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ─── Artifact → Schema Map ─────────────────────────────────────────────────────

const ARTIFACT_NAMES = new Set(['triage', 'recon', 'findings', 'skeptic', 'report', 'state']);

function resolveSchemaPath(artifactName) {
  return path.join(__dirname, '..', 'schemas', artifactName + '.schema.json');
}

// ─── Validator ─────────────────────────────────────────────────────────────────

/**
 * Validate `data` against `schema`. Returns array of error strings.
 * Implements a subset of JSON Schema draft-07:
 *   type, required, enum, pattern, minimum, maximum, minLength,
 *   minItems, maxItems, items, properties, additionalProperties, const
 */
function validate(data, schema, path) {
  const errors = [];
  const p = path || '#';

  // ── const ──────────────────────────────────────────────────────────────────
  if ('const' in schema) {
    if (!deepEqual(data, schema.const)) {
      errors.push(`${p}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(data)}`);
    }
    return errors; // const is a terminal check
  }

  // ── type ───────────────────────────────────────────────────────────────────
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => matchesType(data, t))) {
      errors.push(
        `${p}: expected type ${JSON.stringify(schema.type)}, got ${jsonType(data)}`
      );
      // Cannot continue structural checks if type is wrong
      return errors;
    }
  }

  // ── enum ───────────────────────────────────────────────────────────────────
  if (schema.enum !== undefined) {
    if (!schema.enum.some((v) => deepEqual(data, v))) {
      errors.push(`${p}: value ${JSON.stringify(data)} is not one of ${JSON.stringify(schema.enum)}`);
    }
  }

  // ── String checks ──────────────────────────────────────────────────────────
  if (typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push(`${p}: string length ${data.length} < minLength ${schema.minLength}`);
    }
    if (schema.pattern !== undefined) {
      const re = new RegExp(schema.pattern);
      if (!re.test(data)) {
        errors.push(`${p}: string "${data}" does not match pattern /${schema.pattern}/`);
      }
    }
  }

  // ── Number / integer checks ────────────────────────────────────────────────
  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push(`${p}: value ${data} < minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push(`${p}: value ${data} > maximum ${schema.maximum}`);
    }
  }

  // ── Array checks ───────────────────────────────────────────────────────────
  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push(`${p}: array length ${data.length} < minItems ${schema.minItems}`);
    }
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      errors.push(`${p}: array length ${data.length} > maxItems ${schema.maxItems}`);
    }
    if (schema.items !== undefined) {
      data.forEach((item, i) => {
        const subErrors = validate(item, schema.items, `${p}[${i}]`);
        errors.push(...subErrors);
      });
    }
  }

  // ── Object checks ──────────────────────────────────────────────────────────
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    // required
    if (Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`${p}: missing required field: ${field}`);
        }
      }
    }

    // properties
    const propSchemas = schema.properties || {};
    for (const [key, propSchema] of Object.entries(propSchemas)) {
      if (key in data) {
        const subErrors = validate(data[key], propSchema, `${p}.${key}`);
        errors.push(...subErrors);
      }
    }

    // additionalProperties
    if (schema.additionalProperties !== undefined) {
      const knownKeys = new Set(Object.keys(propSchemas));
      for (const key of Object.keys(data)) {
        if (!knownKeys.has(key)) {
          if (schema.additionalProperties === false) {
            errors.push(`${p}: additional property not allowed: ${key}`);
          } else if (typeof schema.additionalProperties === 'object') {
            const subErrors = validate(data[key], schema.additionalProperties, `${p}.${key}`);
            errors.push(...subErrors);
          }
        }
      }
    }
  }

  return errors;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function jsonType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function matchesType(value, type) {
  switch (type) {
    case 'null':    return value === null;
    case 'boolean': return typeof value === 'boolean';
    case 'integer': return typeof value === 'number' && Number.isInteger(value);
    case 'number':  return typeof value === 'number';
    case 'string':  return typeof value === 'string';
    case 'array':   return Array.isArray(value);
    case 'object':  return value !== null && typeof value === 'object' && !Array.isArray(value);
    default:        return false;
  }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    process.stderr.write('Usage: node schema-validate.cjs <artifact-name> <file-path>\n');
    process.stderr.write(`Artifact names: ${[...ARTIFACT_NAMES].join(', ')}\n`);
    process.exit(1);
  }

  const [artifactName, filePath] = args;
  const absFile = path.resolve(filePath);

  if (!ARTIFACT_NAMES.has(artifactName)) {
    const result = {
      ok: false,
      artifact: artifactName,
      file: absFile,
      errors: [`unknown artifact name "${artifactName}"; valid names: ${[...ARTIFACT_NAMES].join(', ')}`],
    };
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(1);
  }

  const schemaPath = resolveSchemaPath(artifactName);

  // Load schema
  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  } catch (err) {
    const result = {
      ok: false,
      artifact: artifactName,
      file: absFile,
      errors: [`failed to load schema at ${schemaPath}: ${err.message}`],
    };
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(1);
  }

  // Load target file
  let data;
  try {
    data = JSON.parse(fs.readFileSync(absFile, 'utf8'));
  } catch (err) {
    const result = {
      ok: false,
      artifact: artifactName,
      file: absFile,
      errors: [`failed to read/parse file: ${err.message}`],
    };
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(1);
  }

  // Validate
  const errors = validate(data, schema);

  if (errors.length === 0) {
    const result = { ok: true, artifact: artifactName, file: absFile };
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(0);
  } else {
    const result = { ok: false, artifact: artifactName, file: absFile, errors };
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(1);
  }
}

main();
