#!/usr/bin/env node
/**
 * validate-submissions.cjs
 *
 * Checks public/data/submissions.json shape before a manual Pages deploy.
 * Does not fetch PSA/Beckett, invent prices, or deploy.
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DATA_PATH = path.join(ROOT, 'public', 'data', 'submissions.json')

const REQUIRED_FIELDS = [
  'company',
  'submissionId',
  'submittedAt',
  'itemCount',
  'status',
  'notes',
  'lastUpdated',
]

const KNOWN_STATUSES = new Set([
  'Preparing',
  'Received',
  'QC',
  'Grading',
  'Graded',
  'Shipped',
  'Delivered',
  'On Hold',
])

function fail(message) {
  console.error(`submissions.json invalid: ${message}`)
  process.exit(1)
}

if (!fs.existsSync(DATA_PATH)) {
  fail(`missing file ${path.relative(ROOT, DATA_PATH)}`)
}

let payload
try {
  payload = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
} catch (error) {
  fail(`could not parse JSON (${error.message})`)
}

if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
  fail('root must be an object')
}

if (!Array.isArray(payload.submissions)) {
  fail('root.submissions must be an array')
}

payload.submissions.forEach((row, index) => {
  if (!row || typeof row !== 'object') {
    fail(`submissions[${index}] must be an object`)
  }

  for (const field of REQUIRED_FIELDS) {
    if (row[field] === undefined || row[field] === null || row[field] === '') {
      fail(`submissions[${index}] missing ${field}`)
    }
  }

  if (typeof row.itemCount !== 'number' || row.itemCount < 0) {
    fail(`submissions[${index}].itemCount must be a number >= 0`)
  }

  if (row.etaDays != null && (typeof row.etaDays !== 'number' || row.etaDays < 0)) {
    fail(`submissions[${index}].etaDays must be a number >= 0 or null`)
  }

  if (!KNOWN_STATUSES.has(String(row.status))) {
    console.warn(
      `submissions[${index}].status "${row.status}" is custom (known: ${[...KNOWN_STATUSES].join(', ')})`,
    )
  }
})

console.log(
  `submissions.json ok: ${payload.submissions.length} row(s), lastRefreshedAt=${payload.lastRefreshedAt || 'unset'}`,
)
