/**
 * build-snapshot.cjs
 * 
 * Generates public API snapshot for Collectors Canyon website.
 * Reads CardShark Empire state + admin spotlight file.
 * Outputs clean JSON for the React app.
 * 
 * Usage: node scripts/build-snapshot.cjs
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.WORKSPACE || '/home/perry/clawd/CARDSHARK_EMPIRE';
const SPOTLIGHT_PATH = path.join(__dirname, '..', 'data', 'spotlight.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'api');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'snapshot.json');

// ─── Read spotlight (admin manual entries) ───────────────────────────────────
function readSpotlight() {
  try {
    return JSON.parse(fs.readFileSync(SPOTLIGHT_PATH, 'utf8'));
  } catch (e) {
    console.warn('[Snapshot] No spotlight.json found, starting empty');
    return [];
  }
}

// ─── Read vault cache (graded cards in vault) ────────────────────────────────
function readVault() {
  const vaultPath = path.join(WORKSPACE, 'state', 'vault-cache.json');
  try {
    const raw = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
    return Object.entries(raw).map(([slug, entry]) => ({
      id: slug,
      ...entry.data,
      vaultUpdated: entry.timestamp ? new Date(entry.timestamp).toISOString() : null
    }));
  } catch (e) {
    console.warn('[Snapshot] vault-cache.json not found:', e.message);
    return [];
  }
}

// ─── Read listed cards ───────────────────────────────────────────────────────
function readListed() {
  const listedPath = path.join(WORKSPACE, 'state', 'listed-cards.json');
  try {
    const raw = JSON.parse(fs.readFileSync(listedPath, 'utf8'));
    return raw.listed || [];
  } catch (e) {
    console.warn('[Snapshot] listed-cards.json not found:', e.message);
    return [];
  }
}

// ─── Read Lane B hunts (current hunt targets) ────────────────────────────────
function readHunts() {
  // Pull from feature-flags which has hunt config
  const flagsPath = path.join(WORKSPACE, 'state', 'feature-flags.json');
  try {
    const raw = JSON.parse(fs.readFileSync(flagsPath, 'utf8'));
    return raw.activeHunts || [];
  } catch (e) {
    return [];
  }
}

// ─── Read manual review queue ───────────────────────────────────────────────
function readManualReview() {
  const qPath = path.join(WORKSPACE, 'state', 'manual-review-queue.json');
  try {
    const raw = JSON.parse(fs.readFileSync(qPath, 'utf8'));
    return Array.isArray(raw) ? raw : (raw.items || []);
  } catch (e) {
    return [];
  }
}

// ─── Read vintage hold queue ─────────────────────────────────────────────────
function readVintageHold() {
  const qPath = path.join(WORKSPACE, 'state', 'vintage-hold-queue.json');
  try {
    return JSON.parse(fs.readFileSync(qPath, 'utf8'));
  } catch (e) {
    return [];
  }
}

// ─── Build featuredAssets (spotlight + vault) ────────────────────────────────
function buildFeaturedAssets(spotlight, vault) {
  // Featured assets = admin spotlight (featured=true) + top vault items
  const featured = spotlight.filter(s => s.featured);
  const unfeatured = spotlight.filter(s => !s.featured);
  
  // Pull top vault items (by grade priority: PSA 10 > 9 > 8 etc.)
  const gradeOrder = { 'PSA 10': 100, 'PSA 9': 90, 'PSA 8': 80, 'PSA 7': 70, 'PSA 6': 60 };
  const topVault = vault
    .filter(v => v.grade && v.grade.startsWith('PSA'))
    .sort((a, b) => (gradeOrder[a.grade] || 50) - (gradeOrder[b.grade] || 50))
    .reverse()
    .slice(0, 6)
    .map(v => ({
      id: v.id,
      title: v.cardName || v.id,
      subtitle: v.source || 'Vault Entry',
      grade: v.grade,
      collection: v.collection || 'Graded Card',
      badge: 'Vault Entry',
      badgeVariant: 'muted',
      videoUrl: null,
      imageUrl: null,
      description: `PSA-graded ${v.cardName} — ${v.grade}`,
      tier: 'Vault Entry',
      featured: false,
      vaultUpdated: v.vaultUpdated
    }));

  return [...featured, ...unfeatured, ...topVault];
}

// ─── Build hunt board ───────────────────────────────────────────────────────
function buildHunts(hunts, manualReview, vintageHold) {
  // Static hunt targets — these are brand-facing, curated descriptions
  // In production these could come from CardShark hunt config
  const staticHunts = [
    {
      id: 'hunt-1',
      category: 'Vintage Grail',
      title: '1st Ed Shadowless Base Set',
      description: 'Targeting PSA 7–9 copies of Charizard, Blastoise, and Venusaur below market comps.',
      targetGrade: 'PSA 7+',
      priority: 'high',
      status: 'active',
      icon: '🔥',
      setTags: ['Base Set', 'Shadowless', '1st Edition']
    },
    {
      id: 'hunt-2',
      category: 'PSA Opportunity',
      title: 'Pikachu Illustration Contest',
      description: 'High-demand world championship piece. Monitoring secondary for PSA 8–9 opportunities under $8K.',
      targetGrade: 'PSA 8+',
      priority: 'high',
      status: 'active',
      icon: '⚡',
      setTags: ['Illustration Contest', 'World Championship']
    },
    {
      id: 'hunt-3',
      category: 'Chase Card',
      title: 'Dark Raichu NSA',
      description: 'Hidden potential in the Japanese NSA set. Undersampled, underpriced relative to PSA pop.',
      targetGrade: 'PSA 8+',
      priority: 'medium',
      status: 'active',
      icon: '🎯',
      setTags: ['Japanese', 'NSA', 'Raichu']
    },
    {
      id: 'hunt-4',
      category: 'Undervalued Slab',
      title: 'Pop-Report Arbitrage',
      description: 'Cards where PSA pop reports show scarcity but eBay comps haven\'t adjusted. Quick flip candidates.',
      targetGrade: 'PSA 7–8',
      priority: 'medium',
      status: 'watching',
      icon: '📊',
      setTags: ['Arbitrage', 'Pop Report', 'Secondary Market']
    },
    {
      id: 'hunt-5',
      category: 'Modern Gem',
      title: 'ETB Breaks / Pack Fresh Slabs',
      description: 'Recent sets with raw PSA 10 rates. Buying sealed, cracking, and grading for resale.',
      targetGrade: 'PSA 9–10',
      priority: 'low',
      status: 'exploring',
      icon: '✨',
      setTags: ['Sealed', 'Modern', 'Breaks']
    },
    {
      id: 'hunt-6',
      category: 'Jungle Set',
      title: 'Fossil & Jungle Staples',
      description: 'PSA 7–8 copies of key Jungle/Fossil commons and uncommons at sub-$20 lot prices.',
      targetGrade: 'PSA 7–8',
      priority: 'low',
      status: 'active',
      icon: '🌿',
      setTags: ['Jungle', 'Fossil', 'Budget Vintage']
    }
  ];

  // Inject live queue stats
  const huntStats = {
    manualReviewCount: manualReview.length,
    vintageHoldCount: vintageHold.length
  };

  return { hunts: staticHunts, stats: huntStats };
}

// ─── Build top pieces ───────────────────────────────────────────────────────
function buildTopPieces(spotlight, vault) {
  // Non-featured spotlight + top graded vault items
  const nonFeatured = spotlight.filter(s => !s.featured);
  
  const gradeOrder = { 'PSA 10': 100, 'PSA 9': 90, 'PSA 8': 80, 'PSA 7': 70, 'PSA 6': 60 };
  const topVault = vault
    .filter(v => v.grade && v.grade.startsWith('PSA') && !spotlight.some(s => s.id === v.id))
    .sort((a, b) => (gradeOrder[a.grade] || 50) - (gradeOrder[b.grade] || 50))
    .reverse()
    .slice(0, 6)
    .map(v => ({
      id: v.id,
      title: v.cardName || v.id,
      grade: v.grade,
      set: v.collection || 'Graded Card',
      description: `PSA ${v.grade} — ${v.highSold ? `sold range $${v.lowSold}–$${v.highSold}` : 'vault entry'}`,
      imageUrl: null,
      tier: v.grade,
      badge: 'Vault Entry'
    }));

  return [...nonFeatured.map(s => ({
    id: s.id,
    title: s.title,
    grade: s.grade,
    set: s.collection,
    description: s.description,
    imageUrl: s.imageUrl,
    tier: s.tier,
    badge: s.badge
  })), ...topVault];
}

// ─── Build stats ─────────────────────────────────────────────────────────────
function buildStats(vault, listed, manualReview) {
  const psaItems = vault.filter(v => v.grade && v.grade.startsWith('PSA'));
  return {
    totalVault: vault.length,
    totalPSA: psaItems.length,
    totalListed: listed.length,
    manualReviewCount: manualReview.length,
    generatedAt: new Date().toISOString()
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────
function buildSnapshot() {
  console.log('[Snapshot] Building public snapshot...');
  console.log('[Snapshot] Workspace:', WORKSPACE);

  const spotlight = readSpotlight();
  console.log(`[Snapshot] Spotlight: ${spotlight.length} items`);

  const vault = readVault();
  console.log(`[Snapshot] Vault cache: ${vault.length} items`);

  const listed = readListed();
  console.log(`[Snapshot] Listed: ${listed.length} items`);

  const huntsConfig = readHunts();
  const manualReview = readManualReview();
  const vintageHold = readVintageHold();

  const snapshot = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    featuredAssets: buildFeaturedAssets(spotlight, vault),
    currentHunts: buildHunts(huntsConfig, manualReview, vintageHold).hunts,
    huntStats: buildHunts(huntsConfig, manualReview, vintageHold).stats,
    topPieces: buildTopPieces(spotlight, vault),
    stats: buildStats(vault, listed, manualReview)
  };

  // Ensure output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(snapshot, null, 2));
  console.log(`[Snapshot] Written: ${OUTPUT_PATH}`);
  console.log(`[Snapshot] featuredAssets: ${snapshot.featuredAssets.length}`);
  console.log(`[Snapshot] currentHunts: ${snapshot.currentHunts.length}`);
  console.log(`[Snapshot] topPieces: ${snapshot.topPieces.length}`);
  console.log(`[Snapshot] Stats:`, snapshot.stats);

  return snapshot;
}

if (require.main === module) {
  buildSnapshot();
}

module.exports = { buildSnapshot };
