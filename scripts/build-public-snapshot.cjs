/**
 * Public Snapshot Schema
 * Sanitized output for public-facing watchlist
 * Read from: CardShark Empire state/dashboard/current.json
 * Output to: public.json (no private data)
 * 
 * Schema:
 * {
 *   "version": "1.0",
 *   "updated": "ISO timestamp",
 *   "watchlist": [
 *     {
 *       "title": "LUGIA V #138 PSA 9",
 *       "set": "Silver Tempest",
 *       "cardNumber": "138",
 *       "pokemon": "Lugia V",
 *       "grade": "PSA 9",
 *       "price": 29.99,
 *       "pcPrice": 22.13,
 *       "edgePct": -35.5,
 *       "bucket": "READY|REVIEW",
 *       "source": "eBay",
 *       "updated": "ISO timestamp"
 *     }
 *   ],
 *   "stats": {
 *     "totalWatched": 2,
 *     "ready": 1,
 *     "review": 1
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.WORKSPACE || '/home/perry/clawd/CARDSHARK_EMPIRE';
const SOURCE_PATH = path.join(WORKSPACE, 'state', 'dashboard', 'current.json');
const OUTPUT_PATH = path.join(WORKSPACE, 'state', 'dashboard', 'public.json');

function sanitizeForPublic(snapshot) {
  const queues = snapshot?.queues?.B || {};
  const allItems = [
    ...(queues.ready || []),
    ...(queues.review || [])
  ];
  
  const watchlist = allItems.map(item => {
    // Extract set from title or infer
    let set = 'Unknown';
    let cardNumber = '';
    let pokemon = '';
    
    // Try to parse from title
    const title = item.title || '';
    const setMatch = title.match(/(Silver Tempest|Celebrations|Evolutions|VMAX|Brilliant Stars|Obelisk|Towering Storm|Prismatic Evolutions|Phantom|Hidden Fates)/i);
    if (setMatch) set = setMatch[1];
    
    const numMatch = title.match(/#(\d+)/);
    if (numMatch) cardNumber = numMatch[1];
    
    // Pokemon name from title (first word(s) before #)
    const pokemonMatch = title.match(/^([A-Z]+ V?(?: EX)?(?: PRISM)?(?:\s+[A-Z]+)?)/);
    if (pokemonMatch) pokemon = pokemonMatch[1];
    
    return {
      title: item.title?.substring(0, 100) || 'Unknown',
      set,
      cardNumber,
      pokemon,
      grade: extractGrade(item.title),
      price: item.price,
      pcPrice: item.pcPrice,
      edgePct: item.edgePct,
      bucket: item.rankScore > 0 ? 'READY' : 'REVIEW',
      source: 'eBay',
      updated: item.lastSeen
    };
  });
  
  return {
    version: '1.0',
    updated: new Date().toISOString(),
    watchlist,
    stats: {
      totalWatched: watchlist.length,
      ready: watchlist.filter(w => w.bucket === 'READY').length,
      review: watchlist.filter(w => w.bucket === 'REVIEW').length
    }
  };
}

function extractGrade(title) {
  const match = title.match(/\b(PSA|CGC|BGS|SGC)\s*(\d+)/i);
  if (match) {
    return `${match[1].toUpperCase()} ${match[2]}`;
  }
  return null;
}

function buildPublicSnapshot() {
  try {
    if (!fs.existsSync(SOURCE_PATH)) {
      console.log('[Public] No source snapshot found');
      return null;
    }
    
    const source = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
    const publicData = sanitizeForPublic(source);
    
    // Ensure output directory exists
    const outDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(publicData, null, 2));
    console.log(`[Public] Snapshot written: ${OUTPUT_PATH}`);
    console.log(`[Public] Watchlist: ${publicData.watchlist.length} items`);
    
    return publicData;
  } catch (e) {
    console.error('[Public] Error:', e.message);
    return null;
  }
}

if (require.main === module) {
  buildPublicSnapshot();
}
