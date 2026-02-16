#!/usr/bin/env node
/**
 * Phase 4.2: Dashboard Snapshot Builder
 * Reads decisions.jsonl → builds state/dashboard/current.json
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const WORKSPACE = process.env.WORKSPACE || '/home/perry/clawd/CARDSHARK_EMPIRE';
const LEDGER_PATH = path.join(WORKSPACE, 'logs', 'decisions', 'decisions.jsonl');
const SNAPSHOT_PATH = path.join(WORKSPACE, 'state', 'dashboard', 'current.json');

// Build snapshot from last N runs per lane
const MAX_RUNS = 10;

async function buildSnapshot() {
  if (!fs.existsSync(LEDGER_PATH)) {
    console.log('[Dashboard] No ledger found, creating empty snapshot');
    writeSnapshot({ updated: new Date().toISOString(), lanes: { A: {}, B: {} }, runs: [], items: [] });
    return;
  }

  const runs = { A: [], B: [] };
  const itemDecisions = { A: [], B: [] };
  const latestByItem = {};

  const rl = readline.createInterface({
    input: fs.createReadStream(LEDGER_PATH, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  let badLines = 0;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let ev;
    try {
      ev = JSON.parse(trimmed);
    } catch {
      badLines++;
      continue;
    }

    const lane = (ev.lane || '').toUpperCase();
    if (lane !== 'A' && lane !== 'B') continue;

    if (ev.type === 'RUN_SUMMARY') {
      runs[lane].push(ev);
    } else if (ev.type === 'ITEM_DECISION') {
      itemDecisions[lane].push(ev);
      
      // Track latest decision per item
      const itemKey = ev.itemId;
      if (!latestByItem[itemKey] || new Date(ev.timestamp) > new Date(latestByItem[itemKey].timestamp)) {
        latestByItem[itemKey] = ev;
      }
    }
  }

  // Sort runs by timestamp (newest first)
  runs.A.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  runs.B.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Keep only last N runs
  runs.A = runs.A.slice(0, MAX_RUNS);
  runs.B = runs.B.slice(0, MAX_RUNS);

  // Aggregate stats
  const stats = { A: {}, B: {} };
  for (const lane of ['A', 'B']) {
    stats[lane] = {
      totalRuns: runs[lane].length,
      totalScan: runs[lane].reduce((sum, r) => sum + (r.scan || 0), 0),
      totalPass: runs[lane].reduce((sum, r) => sum + (r.pass || 0), 0),
      totalReview: runs[lane].reduce((sum, r) => sum + (r.review || 0), 0),
      totalResolved: runs[lane].reduce((sum, r) => sum + (r.resolved || 0), 0),
      totalDrop: runs[lane].reduce((sum, r) => sum + (r.drop || 0), 0),
      totalOverpriced: runs[lane].reduce((sum, r) => sum + (r.overpriced || 0), 0),
      totalMemoryHits: runs[lane].reduce((sum, r) => sum + (r.memoryHits || 0), 0),
      totalMemoryStale: runs[lane].reduce((sum, r) => sum + (r.memoryStale || 0), 0),
      totalVariantBlocked: runs[lane].reduce((sum, r) => sum + (r.variantAutoResolveBlocked || 0), 0),
    };
  }

  // Build current queues from latest decisions
  const queues = { A: { ready: [], review: [], overpriced: [], hold: [] }, B: { ready: [], review: [], overpriced: [], hold: [] } };
  
  for (const [itemKey, ev] of Object.entries(latestByItem)) {
    const lane = ev.lane;
    const decision = ev.decision?.toUpperCase();
    const bucket = decision === 'PASS' ? 'ready' :
                   decision === 'REVIEW' ? 'review' :
                   decision === 'OVERPRICED' ? 'overpriced' :
                   decision === 'HOLD_SCAM' ? 'hold' : null;
    
    if (bucket) {
      queues[lane][bucket].push({
        itemId: ev.itemId,
        title: ev.title,
        price: ev.price,
        pcPrice: ev.pc?.price,
        edgePct: ev.edgePct,
        rankScore: ev.rankScore,
        reason: ev.reason,
        flags: ev.flags || [],
        lastSeen: ev.timestamp,
        source: ev.source
      });
    }
  }

  // Sort each queue by rankScore descending
  for (const lane of ['A', 'B']) {
    for (const bucket of ['ready', 'review', 'overpriced', 'hold']) {
      queues[lane][bucket].sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));
    }
  }

  // Phase 5.0: Load Courtyard data
  const courtyard = await loadCourtyardData(WORKSPACE);

  // Build output
  const snapshot = {
    updated: new Date().toISOString(),
    stats,
    runs,
    queues,
    courtyard,
    summary: {
      totalItemsTracked: Object.keys(latestByItem).length,
      readyCount: queues.B.ready.length + queues.A.ready.length,
      reviewCount: queues.B.review.length + queues.A.review.length,
      badLines
    }
  };

  writeSnapshot(snapshot);
  console.log(`[Dashboard] Snapshot built: ${Object.keys(latestByItem).length} items, ${runs.A.length + runs.B.length} runs, ${courtyard.stats.listedCount} listed`);
}

async function loadCourtyardData(workspace) {
  const listedPath = path.join(workspace, 'state', 'listed-cards.json');
  const queuePath = path.join(workspace, 'state', 'lister-queue.json');
  
  let listed = [];
  let queue = [];
  
  if (fs.existsSync(listedPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(listedPath, 'utf8'));
      listed = data.listed || [];
    } catch (e) {
      console.log('[Dashboard] Warning: could not parse listed-cards.json');
    }
  }
  
  if (fs.existsSync(queuePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
      queue = data.items || [];
    } catch (e) {
      console.log('[Dashboard] Warning: could not parse lister-queue.json');
    }
  }
  
  // Calculate stats
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  let staleCount = 0;
  let relistDueCount = 0;
  
  for (const item of listed) {
    const listedAt = new Date(item.listedAt);
    if (listedAt < fourteenDaysAgo) staleCount++;
    else if (listedAt < sevenDaysAgo) relistDueCount++;
  }
  
  return {
    listed: listed.slice(0, 100), // Limit to 100 for snapshot
    queue: queue.slice(0, 100),
    stats: {
      listedCount: listed.length,
      queueCount: queue.length,
      soldCount: 0, // TODO: add sold tracking
      staleCount,
      relistDueCount
    }
  };
}

function writeSnapshot(data) {
  const dir = path.dirname(SNAPSHOT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(data, null, 2));
  console.log(`[Dashboard] Written: ${SNAPSHOT_PATH}`);
}

// CLI
if (require.main === module) {
  buildSnapshot().catch(err => {
    console.error('[Dashboard] Build failed:', err.message);
    process.exit(1);
  });
}

module.exports = { buildSnapshot, SNAPSHOT_PATH };
