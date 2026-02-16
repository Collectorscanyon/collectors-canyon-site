/**
 * Phase 4.0: Unified Decision Ledger
 * Append-only log for Lane A + Lane B decisions
 */
const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.WORKSPACE || '/home/perry/clawd/CARDSHARK_EMPIRE';
const LEDGER_PATH = path.join(WORKSPACE, 'logs', 'decisions', 'decisions.jsonl');

/**
 * Ensure directory exists
 */
function ensureDir() {
  const dir = path.dirname(LEDGER_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Append a decision event to the ledger
 */
function appendDecision(event) {
  try {
    ensureDir();
    const entry = {
      timestamp: new Date().toISOString(),
      ...event
    };
    fs.appendFileSync(LEDGER_PATH, JSON.stringify(entry) + '\n');
    return true;
  } catch (e) {
    console.error('[DecisionLedger] Write error:', e.message);
    return false;
  }
}

/**
 * Write a RUN_SUMMARY to the ledger
 */
function appendRunSummary(lane, summary) {
  return appendDecision({
    type: 'RUN_SUMMARY',
    lane,
    ...summary
  });
}

/**
 * Write an item decision to the ledger
 */
function appendItemDecision(lane, runId, item) {
  const decision = item.gateDecision?.action || 
                  (item.expectedEdgePct <= 0 ? 'OVERPRICED' : 'PASS');
  
  const reason = item.gateDecision?.gateTriggered || 
                item.gateDecision?.flags?.[0] || 
                (decision === 'OVERPRICED' ? 'negative_edge' : 'gates_pass');
  
  const entry = {
    type: 'ITEM_DECISION',
    lane,
    runId,
    itemId: item.itemId,
    title: item.title?.substring(0, 100),
    price: item.price,
    url: item.url || item.itemWebUrl || null,
    decision,
    reason,
    flags: item.gateDecision?.flags || [],
    pc: item.pcPrice ? {
      productId: item.gradedRelookup?.productId || item.pcProductId,
      productName: item.gradedRelookup?.productName || item.pcProductName,
      price: item.pcPrice,
      confidence: item.gateDecision?.pcTelemetry?.confidence,
      method: item.gateDecision?.pcTelemetry?.method
    } : null,
    edgePct: item.expectedEdgePct ? parseFloat(item.expectedEdgePct) : null,
    rankScore: item.rankScore ? parseFloat(item.rankScore) : null,
    source: item.gradedRelookup?.variantResolutionUsed ? 'human_memory' :
            item.gradedRelookup?.variantResolution ? 'variant_auto' :
            item.gradedRelookup?.attempted ? 'relookup' : 'gates'
  };
  
  return appendDecision(entry);
}

module.exports = {
  appendDecision,
  appendRunSummary,
  appendItemDecision,
  LEDGER_PATH
};
