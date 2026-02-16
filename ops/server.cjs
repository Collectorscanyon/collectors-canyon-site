#!/usr/bin/env node
/**
 * Phase 4.3: Ops Console Server
 * Serves dashboard API + HTML UI
 * 
 * Environment:
 *   PORT              - Server port (default: 3847)
 *   OPS_DATA_DIR      - Data directory for logs/state (default: WORKSPACE)
 *   OPS_DASHBOARD_TOKEN - Auth token for POST routes
 *   OPS_READ_ONLY    - If 'true', disable POST routes
 *   OPS_ACTOR_NAME   - Actor name for decisions (default: 'system')
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3847;
const WORKSPACE = process.env.WORKSPACE || '/home/perry/clawd/CARDSHARK_EMPIRE';
const DATA_DIR = process.env.OPS_DATA_DIR || WORKSPACE;
const AUTH_TOKEN = process.env.OPS_DASHBOARD_TOKEN || null;
const READ_ONLY = process.env.OPS_READ_ONLY === 'true';
const ACTOR_NAME = process.env.OPS_ACTOR_NAME || 'system';

// Phase 4.4: Disk path sanity check (fail-closed)
function verifyDataDir() {
  const requiredDirs = [
    path.join(DATA_DIR, 'logs', 'decisions'),
    path.join(DATA_DIR, 'state', 'dashboard')
  ];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        console.error(`[FATAL] Cannot create data directory: ${dir}`);
        console.error(`[FATAL] Please ensure OPS_DATA_DIR is writable or disk is mounted`);
        process.exit(1);
      }
    }
  }
  
  // Test write access
  const testFile = path.join(DATA_DIR, '.write-test');
  try {
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
  } catch (e) {
    console.error(`[FATAL] Cannot write to DATA_DIR: ${DATA_DIR}`);
    console.error(`[FATAL] Error: ${e.message}`);
    process.exit(1);
  }
  
  console.log(`[OK] Data directory verified: ${DATA_DIR}`);
}

// Helper functions for public watchlist
const KNOWN_SETS = [
  'Silver Tempest', 'Celebrations', 'Evolutions', 'VMAX', 'Brilliant Stars',
  'Obelisk', 'Towering Storm', 'Prismatic Evolutions', 'Phantom', 'Hidden Fates',
  'Fusion Strike', 'Astral Radiance', 'Lost Origin', 'Vivid Voltage',
  'Rebel Clash', 'Darkness Ablaze', 'Champion\'s Path', 'Sword & Shield'
];

function extractSet(title) {
  if (!title) return 'Unknown';
  for (const set of KNOWN_SETS) {
    if (title.toLowerCase().includes(set.toLowerCase())) return set.toUpperCase();
  }
  return 'Unknown';
}

function extractCardNumber(title) {
  if (!title) return '';
  const match = title.match(/#(\d+)/);
  return match ? match[1] : '';
}

function extractPokemon(title) {
  if (!title) return '';
  // First word(s) before # or before PSA
  const match = title.match(/^([A-Z]+(?:\s+[A-Z]+)?(?:\s+V)?(?:\s+EX)?(?:\s+PRISM)?(?:\s+RAINBOW)?)\s*#?/);
  return match ? match[1].trim() : '';
}

function extractGrade(title) {
  if (!title) return null;
  const match = title.match(/\b(PSA|CGC|BGS|SGC)\s*(\d+)/i);
  return match ? `${match[1].toUpperCase()} ${match[2]}` : null;
}

// Demo cards for UI showcase when no real images available
function getDemoCards() {
  return [
    {
      title: "PSA 10 Charizard VMAX Championship Card",
      set: "VMAX Championship",
      cardNumber: "20/172",
      pokemon: "Charizard",
      grade: "PSA 10",
      price: 89.99,
      pcPrice: 425.00,
      edgePct: 78.8,
      bucket: "READY",
      lastSeen: new Date().toISOString(),
      imageUrl: "https://i.ebayimg.com/images/g/6YMAAOSwR11jK5Tj/s-l400.jpg",
      imageUrls: ["https://i.ebayimg.com/images/g/6YMAAOSwR11jK5Tj/s-l400.jpg"]
    },
    {
      title: "PSA 9 Pikachu Illustrator Card",
      set: "Promo",
      cardNumber: "Pikachu",
      pokemon: "Pikachu",
      grade: "PSA 9",
      price: 149.99,
      pcPrice: 890.00,
      edgePct: 83.1,
      bucket: "READY",
      lastSeen: new Date().toISOString(),
      imageUrl: "https://i.ebayimg.com/images/g/7kAAAOSwPFJjK5Tj/s-l400.jpg",
      imageUrls: ["https://i.ebayimg.com/images/g/7kAAAOSwPFJjK5Tj/s-l400.jpg"]
    },
    {
      title: "PSA 10 Mewtwo EX Dragon Scale",
      set: "Dragon Scale",
      cardNumber: "12/114",
      pokemon: "Mewtwo",
      grade: "PSA 10",
      price: 45.99,
      pcPrice: 185.00,
      edgePct: 75.2,
      bucket: "READY",
      lastSeen: new Date().toISOString(),
      imageUrl: "https://i.ebayimg.com/images/g/8nBAAOSwPKJjK5Tj/s-l400.jpg",
      imageUrls: ["https://i.ebayimg.com/images/g/8nBAAOSwPKJjK5Tj/s-l400.jpg"]
    },
    {
      title: "PSA 9 Blastoise Legendary Collection",
      set: "Legendary Collection",
      cardNumber: "4/110",
      pokemon: "Blastoise",
      grade: "PSA 9",
      price: 34.99,
      pcPrice: 156.00,
      edgePct: 77.6,
      bucket: "REVIEW",
      lastSeen: new Date().toISOString(),
      imageUrl: "https://i.ebayimg.com/images/g/9mCAAOSwPLJjK5Tj/s-l400.jpg",
      imageUrls: ["https://i.ebayimg.com/images/g/9mCAAOSwPLJjK5Tj/s-l400.jpg"]
    },
    {
      title: "PSA 10 Venusaur EX Team Rocket",
      set: "Team Rocket",
      cardNumber: "5/83",
      pokemon: "Venusaur",
      grade: "PSA 10",
      price: 59.99,
      pcPrice: 275.00,
      edgePct: 78.2,
      bucket: "REVIEW",
      lastSeen: new Date().toISOString(),
      imageUrl: "https://i.ebayimg.com/images/g/0oDAAOSwPMJjK5Tj/s-l400.jpg",
      imageUrls: ["https://i.ebayimg.com/images/g/0oDAAOSwPMJjK5Tj/s-l400.jpg"]
    },
    {
      title: "PSA 8 Mewtwo GX Hidden Fates",
      set: "Hidden Fates",
      cardNumber: "45/68",
      pokemon: "Mewtwo",
      grade: "PSA 8",
      price: 24.99,
      pcPrice: 125.00,
      edgePct: 80.0,
      bucket: "REVIEW",
      lastSeen: new Date().toISOString(),
      imageUrl: "https://i.ebayimg.com/images/g/1pEAAOSwPNJjK5Tj/s-l400.jpg",
      imageUrls: ["https://i.ebayimg.com/images/g/1pEAAOSwPNJjK5Tj/s-l400.jpg"]
    }
  ];
}

// Run sanity check on startup
verifyDataDir();

// Rate limiting: simple in-memory bucket
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per window
const rateLimitMap = new Map();

function checkRateLimit(clientIp) {
  const now = Date.now();
  const key = clientIp;
  const record = rateLimitMap.get(key) || { count: 0, windowStart: now };
  
  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    record.count = 0;
    record.windowStart = now;
  }
  
  record.count++;
  rateLimitMap.set(key, record);
  
  return record.count <= RATE_LIMIT_MAX;
}

// Paths derived from DATA_DIR
const LEDGER_PATH = path.join(DATA_DIR, 'logs', 'decisions', 'decisions.jsonl');
const SNAPSHOT_PATH = path.join(DATA_DIR, 'state', 'dashboard', 'current.json');

// Ensure directories exist
[path.join(DATA_DIR, 'logs', 'decisions'), path.join(DATA_DIR, 'state', 'dashboard')].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CardShark Ops Console</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1419; color: #e7e9ea; min-height: 100vh; }
    .header { background: #1d9bf0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 20px; font-weight: 700; color: #fff; }
    .header .updated { font-size: 12px; color: rgba(255,255,255,0.8); }
    .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
    
    /* KPI Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .kpi-card { background: #16181c; border-radius: 12px; padding: 20px; text-align: center; }
    .kpi-card .label { font-size: 12px; color: #71767b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .kpi-card .value { font-size: 32px; font-weight: 700; }
    .kpi-card.scan .value { color: #1d9bf0; }
    .kpi-card.pass .value { color: #00ba7c; }
    .kpi-card.review .value { color: #ffd400; }
    .kpi-card.drop .value { color: #f4212e; }
    .kpi-card.overpriced .value { color: #ff7a00; }
    .kpi-card.memory .value { color: #8b5cf6; }
    
    /* Tabs */
    .tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid #2f3336; padding-bottom: 16px; }
    .tab { background: transparent; border: none; color: #71767b; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
    .tab:hover { background: #16181c; color: #e7e9ea; }
    .tab.active { background: #1d9bf0; color: #fff; }
    .tab .count { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 6px; }
    
    /* Queue Items */
    .queue-list { display: flex; flex-direction: column; gap: 12px; }
    .queue-item { background: #16181c; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s; }
    .queue-item.clickable { cursor: pointer; }
    .queue-item.clickable:hover { background: #1c1f23; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .queue-item .info { flex: 1; }
    .queue-item .title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .queue-item .meta { font-size: 13px; color: #71767b; }
    .queue-item .price { text-align: right; }
    .queue-item .price .amount { font-size: 18px; font-weight: 700; }
    .queue-item .price .vs { font-size: 12px; color: #71767b; }
    .queue-item .price .edge { font-size: 13px; font-weight: 600; }
    .queue-item .price .edge.positive { color: #00ba7c; }
    .queue-item .price .edge.negative { color: #f4212e; }
    
    .queue-item .flags { display: flex; gap: 6px; margin-top: 8px; }
    .queue-item .flag { background: #2f3336; color: #71767b; font-size: 11px; padding: 3px 8px; border-radius: 4px; }
    .queue-item .flag.priority { background: #ffd400; color: #000; }
    
    /* Actions */
    .actions { display: flex; gap: 8px; margin-left: 16px; }
    .item-actions { display: flex; gap: 8px; align-items: center; margin-left: 16px; }
    .btn-link { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #2f3336; border-radius: 8px; text-decoration: none; font-size: 16px; transition: background 0.2s; }
    .btn-link:hover { background: #3f4448; }
    .btn { background: #2f3336; border: none; color: #e7e9ea; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
    .btn:hover { background: #3f4448; }
    .btn.approve { background: #00ba7c; color: #fff; }
    .btn.approve:hover { background: #00a063; }
    .btn.drop { background: #f4212e; color: #fff; }
    .btn.drop:hover { background: #e11e32; }
    
    /* Empty State */
    .empty { text-align: center; padding: 60px 20px; color: #71767b; }
    .empty .icon { font-size: 48px; margin-bottom: 16px; }
    
    /* Loading */
    .loading { text-align: center; padding: 60px; color: #71767b; }
    
    /* Refresh */
    .refresh-btn { background: #16181c; border: 1px solid #2f3336; color: #71767b; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; }
    .refresh-btn:hover { background: #1c1f23; color: #e7e9ea; }
    
    /* Courtyard Stats */
    .courtyard-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: #16181c; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-card .val { font-size: 28px; font-weight: 700; color: #1d9bf0; }
    .stat-card .lbl { font-size: 11px; color: #71767b; text-transform: uppercase; margin-top: 4px; }
    .stat-card.warning .val { color: #ffd400; }
    
    .courtyard-item { display: grid; grid-template-columns: 1fr auto auto; gap: 16px; align-items: center; }
    .courtyard-item .badges { display: flex; gap: 6px; }
    .courtyard-item .badge { font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; }
    .courtyard-item .badge.stale { background: #f4212e; color: #fff; }
    .courtyard-item .badge.relist { background: #ffd400; color: #000; }
    
    /* Main Navigation */
    .main-nav { display: flex; gap: 8px; margin-left: 32px; }
    .nav-link { color: #71767b; text-decoration: none; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 20px; transition: all 0.2s; }
    .nav-link:hover { background: #16181c; color: #e7e9ea; }
    .nav-link.active { background: #1d9bf0; color: #fff; }
    
    .header { display: flex; align-items: center; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🦈 CardShark Ops Console</h1>
    <nav class="main-nav">
      <a href="/" class="nav-link active" data-page="deals">eBay Deals</a>
      <a href="/?page=courtyard" class="nav-link" data-page="courtyard">Courtyard</a>
      <a href="/?page=psa" class="nav-link" data-page="psa">PSA</a>
      <a href="/?page=inventory" class="nav-link" data-page="inventory">Inventory</a>
      <a href="/?page=finance" class="nav-link" data-page="finance">Finance</a>
    </nav>
    <div>
      <span class="updated" id="lastUpdated"></span>
      <button class="refresh-btn" onclick="loadData()" style="margin-left: 12px;">↻ Refresh</button>
    </div>
  </div>
  
  <div class="container">
    <!-- eBay Deals Page -->
    <div class="page" id="page-deals">
      <!-- KPI Grid -->
      <div class="kpi-grid" id="kpiGrid">
        <div class="kpi-card scan"><div class="label">Scanned</div><div class="value" id="kpiScan">-</div></div>
        <div class="kpi-card pass"><div class="label">Passed</div><div class="value" id="kpiPass">-</div></div>
        <div class="kpi-card review"><div class="label">Review</div><div class="value" id="kpiReview">-</div></div>
        <div class="kpi-card drop"><div class="label">Dropped</div><div class="value" id="kpiDrop">-</div></div>
        <div class="kpi-card overpriced"><div class="label">Overpriced</div><div class="value" id="kpiOverpriced">-</div></div>
        <div class="kpi-card memory"><div class="label">Memory Hits</div><div class="value" id="kpiMemory">-</div></div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs">
        <button class="tab active" data-tab="ready" onclick="setTab('ready')">Ready <span class="count" id="countReady">0</span></button>
        <button class="tab" data-tab="review" onclick="setTab('review')">Review <span class="count" id="countReview">0</span></button>
        <button class="tab" data-tab="overpriced" onclick="setTab('overpriced')">Overpriced <span class="count" id="countOverpriced">0</span></button>
        <button class="tab" data-tab="hold" onclick="setTab('hold')">Hold/Scam <span class="count" id="countHold">0</span></button>
      </div>
      
      <!-- Queue List -->
      <div class="queue-list" id="queueList">
        <div class="loading">Loading...</div>
      </div>
    </div>
    
    <!-- Courtyard Page -->
    <div class="page" id="page-courtyard" style="display:none;">
      <h2>🏛️ Courtyard Inventory</h2>
      <div class="queue-list" id="courtyardList">
        <div class="loading">Loading...</div>
      </div>
    </div>
    
    <!-- PSA Page -->
    <div class="page" id="page-psa" style="display:none;">
      <h2>📋 PSA Submissions</h2>
      <div class="empty"><div class="icon">📦</div><div>PSA tracking coming soon</div></div>
    </div>
    
    <!-- Inventory Page -->
    <div class="page" id="page-inventory" style="display:none;">
      <h2>💎 Card Vault</h2>
      <div class="empty"><div class="icon">📦</div><div>Inventory tracking coming soon</div></div>
    </div>
    
    <!-- Finance Page -->
    <div class="page" id="page-finance" style="display:none;">
      <h2>💰 Finance & ROI</h2>
      <div class="empty"><div class="icon">📦</div><div>Finance tracking coming soon</div></div>
    </div>
  </div>

  <script>
    // Page routing
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get('page') || 'deals';
    
    let currentData = null;
    let currentTab = 'ready';
    
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/current');
        currentData = await res.json();
        render();
      } catch (e) {
        document.getElementById('queueList').innerHTML = '<div class="empty"><div class="icon">⚠️</div><div>Failed to load data</div></div>';
      }
    }
    
    function render() {
      if (!currentData) return;
      
      // Show correct page
      document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
      document.getElementById('page-' + currentPage).style.display = 'block';
      
      // Update nav
      document.querySelectorAll('.nav-link').forEach(n => {
        n.classList.toggle('active', n.dataset.page === currentPage);
      });
      
      // Render page-specific content
      if (currentPage === 'courtyard') {
        renderCourtyard();
        return;
      }
      
      // Only render deal page content if on deals
      if (currentPage !== 'deals') return;
      
      const { summary, stats, queues } = currentData;
      const b = stats?.B || {};
      
      // KPIs
      document.getElementById('kpiScan').textContent = b.totalScan || 0;
      document.getElementById('kpiPass').textContent = b.totalPass || 0;
      document.getElementById('kpiReview').textContent = b.totalReview || 0;
      document.getElementById('kpiDrop').textContent = b.totalDrop || 0;
      document.getElementById('kpiOverpriced').textContent = b.totalOverpriced || 0;
      document.getElementById('kpiMemory').textContent = b.totalMemoryHits || 0;
      
      document.getElementById('lastUpdated').textContent = currentData.updated ? 'Updated ' + new Date(currentData.updated).toLocaleTimeString() : '';
      
      // Counts
      const q = queues?.B || {};
      document.getElementById('countReady').textContent = q.ready?.length || 0;
      document.getElementById('countReview').textContent = q.review?.length || 0;
      document.getElementById('countOverpriced').textContent = q.overpriced?.length || 0;
      document.getElementById('countHold').textContent = q.hold?.length || 0;
      
      // Courtyard stats (only if on deals page)
      // Removed - now on separate page
      
      renderQueue();
    }
    
    function setTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="' + tab + '"]').classList.add('active');
      renderQueue();
    }
    
    function renderCourtyard() {
      if (!currentData) return;
      
      const c = currentData.courtyard;
      if (!c || !c.listed?.length) {
        document.getElementById('courtyardList').innerHTML = '<div class="empty"><div class="icon">📦</div><div>No Courtyard listings</div></div>';
        return;
      }
      
      const stats = c.stats || {};
      document.getElementById('courtyardList').innerHTML = 
        '<div class="courtyard-stats">' +
          '<div class="stat-card"><div class="val">' + stats.listedCount + '</div><div class="lbl">Listed</div></div>' +
          '<div class="stat-card"><div class="val">' + stats.queueCount + '</div><div class="lbl">Queue</div></div>' +
          '<div class="stat-card warning"><div class="val">' + stats.relistDueCount + '</div><div class="lbl">Relist Due</div></div>' +
          '<div class="stat-card"><div class="val">' + stats.staleCount + '</div><div class="lbl">Stale</div></div>' +
        '</div>' +
        c.listed.map(item => {
          const daysAgo = Math.floor((Date.now() - new Date(item.listedAt)) / (1000*60*60*24));
          const isStale = daysAgo > 14;
          const isRelistDue = daysAgo > 7 && daysAgo <= 14;
          return '<div class="queue-item courtyard-item">' +
            '<div class="info">' +
              '<div class="title">' + escapeHtml(item.cardName?.substring(0, 60) || 'Unknown') + '</div>' +
              '<div class="meta">Vault: ' + (item.vaultId?.substring(0, 12) || '') + '...</div>' +
            '</div>' +
            '<div class="price">' +
              '<div class="amount">$' + item.price + '</div>' +
              '<div class="vs">' + daysAgo + ' days ago</div>' +
            '</div>' +
            '<div class="badges">' +
              (isStale ? '<span class="badge stale">STALE</span>' : '') +
              (isRelistDue ? '<span class="badge relist">RELIST</span>' : '') +
            '</div>' +
          '</div>';
        }).join('');
    }
    
    function renderQueue() {
      if (!currentData) return;
      
      // Deal queue tabs
      const q = currentData.queues?.B?.[currentTab] || [];
      
      if (q.length === 0) {
        document.getElementById('queueList').innerHTML = '<div class="empty"><div class="icon">📭</div><div>No items in ' + currentTab + '</div></div>';
        return;
      }
      
      // Helper to generate PC URL - use Google search to find the card
      const getPcUrl = (title) => {
        if (!title) return '#';
        const search = encodeURIComponent(title + ' site:pricecharting.com');
        return 'https://www.google.com/search?q=' + search;
      };
      
      // Helper to generate eBay search URL - use actual listing URL if available
      const getEbayUrl = (item) => {
        // Direct listing URL takes priority
        if (item.url) return item.url;
        // Fallback to search
        if (!item.title) return '#';
        const slug = encodeURIComponent(item.title.replace(/[^a-zA-Z0-9]/g, ' ').trim().replace(/  +/g, '+'));
        return 'https://www.ebay.com/sch/i.html?_nkw=' + slug.substring(0, 40);
      };
      
      document.getElementById('queueList').innerHTML = q.map(item => {
        const edge = parseFloat(item.edgePct);
        const edgeClass = edge >= 0 ? 'positive' : 'negative';
        const edgePrefix = edge >= 0 ? '+' : '';
        const pcUrl = getPcUrl(item.title);
        const ebayUrl = getEbayUrl(item);
        
        // Click opens eBay if URL exists, otherwise does nothing
        const clickHandler = item.url 
          ? 'onclick="event.stopPropagation(); window.open(\'' + item.url + '\', \'_blank\')"'
          : '';
        const cursorStyle = item.url ? 'cursor: pointer;' : '';
        
        return '<div class="queue-item" style="' + cursorStyle + '" ' + clickHandler + '>' +
          '<div class="info">' +
            '<div class="title">' + escapeHtml(item.title?.substring(0, 60) || '') + '</div>' +
            '<div class="meta">' + (item.reason || '') + ' • ' + (item.source || '') + '</div>' +
            (item.flags?.length ? '<div class="flags">' + item.flags.map(f => '<span class="flag' + (f.includes('needs_graded') ? ' priority' : '') + '">' + f + '</span>').join('') + '</div>' : '') +
          '</div>' +
          '<div class="price">' +
            '<div class="amount">$' + item.price + '</div>' +
            '<div class="vs">vs PC $' + (item.pcPrice || '-') + '</div>' +
            '<div class="edge ' + edgeClass + '">' + edgePrefix + edge + '%</div>' +
          '</div>' +
          '<div class="item-actions">' +
            '<a href="' + pcUrl + '" target="_blank" class="btn-link" title="PriceCharting">📊</a>' +
            '<a href="' + ebayUrl + '" target="_blank" class="btn-link" title="eBay Search">🔍</a>' +
            '<button class="btn approve" onclick="takeAction(\\'' + item.itemId + '\\', \\'PASS\\')">✓</button>' +
            '<button class="btn drop" onclick="takeAction(\\'' + item.itemId + '\\', \\'DROP\\')">✗</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }
    
    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    
    async function takeAction(itemId, action) {
      try {
        await fetch('/api/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, decision: action, source: 'manual' })
        });
        loadData();
      } catch (e) {
        alert('Failed: ' + e.message);
      }
    }
    
    loadData();
    setInterval(loadData, 30000);
  </script>
</body>
</html>`;

function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const clientIp = req.socket.remoteAddress || 'unknown';
  
  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
    return;
  }
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Health check
  if (url.pathname === '/healthz' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  // Auth check for POST routes
  const isPost = req.method === 'POST';
  if (isPost && AUTH_TOKEN) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (token !== AUTH_TOKEN) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
  }
  
  // Read-only mode check
  if (isPost && READ_ONLY) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Read-only mode' }));
    return;
  }
  
  // API: Get dashboard snapshot
  if (url.pathname === '/api/dashboard/current' && req.method === 'GET') {
    try {
      if (fs.existsSync(SNAPSHOT_PATH)) {
        const data = fs.readFileSync(SNAPSHOT_PATH, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No snapshot yet', summary: {}, stats: {}, queues: {} }));
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  
  // API: Post decision
  if (url.pathname === '/api/decision' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const decision = JSON.parse(body);
        const entry = {
          timestamp: new Date().toISOString(),
          type: 'ITEM_DECISION',
          lane: 'B',
          itemId: decision.itemId,
          title: decision.title || 'Manual decision',
          price: decision.price || 0,
          decision: decision.decision,
          reason: decision.reason || 'manual_' + decision.decision.toLowerCase(),
          flags: decision.flags || [],
          source: 'manual',
          actor: ACTOR_NAME
        };
        fs.appendFileSync(LEDGER_PATH, JSON.stringify(entry) + '\n');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }
  
  // API: Rebuild snapshot
  if (url.pathname === '/api/dashboard/refresh' && req.method === 'POST') {
    try {
      const { buildSnapshot } = require(path.join(WORKSPACE, 'scripts', 'dashboard-snapshot.cjs'));
      buildSnapshot();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  
  // API: Public watchlist (sanitized, no private data) - must be BEFORE catch-all HTML
  if (url.pathname === '/api/public/watchlist' && req.method === 'GET') {
    const snapshotExists = fs.existsSync(SNAPSHOT_PATH);
    if (!snapshotExists) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ watchlist: [], stats: { totalWatched: 0, ready: 0, review: 0 } }));
      return;
    }
    
    try {
      const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
      const queues = snapshot?.queues?.B || {};
      let allItems = [
        ...(queues.ready || []),
        ...(queues.review || [])
      ];
      
      // Demo mode: if no items have images, add demo cards for UI showcase
      const hasImages = allItems.some(item => item.imageUrl || (item.imageUrls && item.imageUrls.length));
      if (!hasImages) {
        allItems = getDemoCards();
      }
      
      const watchlist = allItems.map(item => ({
        title: item.title?.substring(0, 100) || 'Unknown',
        set: extractSet(item.title),
        cardNumber: extractCardNumber(item.title),
        pokemon: extractPokemon(item.title),
        grade: extractGrade(item.title),
        price: item.price,
        pcPrice: item.pcPrice,
        edgePct: item.edgePct,
        bucket: (item.rankScore || 0) > 0 ? 'READY' : 'REVIEW',
        source: 'eBay',
        updated: item.lastSeen,
        // Phase W3: Include images (safe - no listing URLs)
        imageUrl: item.imageUrl || null,
        imageUrls: item.imageUrls || null
      }));
      
      const data = {
        version: '1.0',
        updated: new Date().toISOString(),
        watchlist,
        stats: {
          totalWatched: watchlist.length,
          ready: watchlist.filter(w => w.bucket === 'READY').length,
          review: watchlist.filter(w => w.bucket === 'REVIEW').length
        }
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  
  // API: Metrics
  if (url.pathname === '/api/metrics' && req.method === 'GET') {
    const ledgerExists = fs.existsSync(LEDGER_PATH);
    const snapshotExists = fs.existsSync(SNAPSHOT_PATH);
    const ledgerSize = ledgerExists ? fs.statSync(LEDGER_PATH).size : 0;
    const snapshotAge = snapshotExists ? Date.now() - fs.statSync(SNAPSHOT_PATH).mtimeMs : null;
    let badLines = 0;
    if (snapshotExists) {
      try {
        const snap = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
        badLines = snap?.summary?.badLines || 0;
      } catch {}
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      dataDir: DATA_DIR,
      readOnly: READ_ONLY,
      authEnabled: !!AUTH_TOKEN,
      ledger: {
        path: LEDGER_PATH,
        sizeBytes: ledgerSize,
        exists: ledgerExists
      },
      snapshot: {
        path: SNAPSHOT_PATH,
        exists: snapshotExists,
        ageMs: snapshotAge,
        badLines
      }
    }));
    return;
  }
  
  // Serve HTML for GET requests that don't match API routes
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }
  
  res.writeHead(404);
  res.end('Not Found');
}

// Start server
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`🦈 CardShark Ops Console: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/dashboard/current`);
  console.log(`   UI: http://localhost:${PORT}/`);
});

module.exports = { server, PORT };
