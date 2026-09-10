#!/usr/bin/env node
/**
 * refresh-site-data.cjs
 *
 * Regenerates public API JSON from in-repo source files only.
 * This script does not fetch remote data and does not deploy.
 *
 * Required input:
 *   - state/dashboard/current.json
 *
 * Optional input:
 *   - data/spotlight.json
 *
 * Outputs:
 *   - public/api/public.json
 *   - public/api/snapshot.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DASHBOARD_PATH = path.join(ROOT, 'state', 'dashboard', 'current.json');
const SPOTLIGHT_PATH = path.join(ROOT, 'data', 'spotlight.json');
const PUBLIC_API_DIR = path.join(ROOT, 'public', 'api');
const PUBLIC_WATCHLIST_PATH = path.join(PUBLIC_API_DIR, 'public.json');
const PUBLIC_SNAPSHOT_PATH = path.join(PUBLIC_API_DIR, 'snapshot.json');
const MAX_STALENESS_HOURS = Number(process.env.MAX_STALENESS_HOURS || '36');

function readRequiredJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required source file missing: ${path.relative(ROOT, filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readOptionalJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return Array.isArray(json) ? json : [];
}

function parseIsoTimestamp(value, label) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid timestamp in ${label}: ${value}`);
  }
  return parsed;
}

function getStalenessHours(updatedAt) {
  return (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
}

function extractGrade(title) {
  const match = String(title || '').match(/\b(PSA|CGC|BGS|SGC)\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  return `${match[1].toUpperCase()} ${match[2]}`;
}

function detectBucket(item) {
  if (typeof item.rankScore === 'number') {
    return item.rankScore >= 0 ? 'READY' : 'REVIEW';
  }
  return 'REVIEW';
}

function mapWatchlistItems(currentDashboard) {
  const queues = currentDashboard?.queues?.B || {};
  const ready = Array.isArray(queues.ready) ? queues.ready : [];
  const review = Array.isArray(queues.review) ? queues.review : [];
  const allItems = [...ready, ...review];

  return allItems.map((item) => ({
    itemId: item.itemId || null,
    title: item.title ? String(item.title).slice(0, 160) : 'Unknown listing',
    grade: extractGrade(item.title),
    priceUsd: typeof item.price === 'number' ? item.price : null,
    // Preserve pricing authority output exactly as provided by source data.
    pcPrice: typeof item.pcPrice === 'number' ? item.pcPrice : null,
    edgePct: typeof item.edgePct === 'number' ? item.edgePct : null,
    bucket: detectBucket(item),
    source: item.source || 'unknown',
    updated: item.lastSeen || null
  }));
}

function mapFeaturedAssets(spotlight) {
  return spotlight
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: item.id || null,
      title: item.title || 'Untitled',
      subtitle: item.subtitle || null,
      grade: item.grade || null,
      collection: item.collection || null,
      badge: item.badge || null,
      badgeVariant: item.badgeVariant || null,
      videoUrl: item.videoUrl || null,
      imageUrl: item.imageUrl || null,
      description: item.description || null,
      tier: item.tier || null,
      featured: Boolean(item.featured),
      source: item.source || null,
      addedAt: item.addedAt || null
    }));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n');
}

function refreshSiteData() {
  const nowIso = new Date().toISOString();
  const dashboard = readRequiredJson(DASHBOARD_PATH);
  const spotlight = readOptionalJsonArray(SPOTLIGHT_PATH);
  const dashboardUpdatedAt = parseIsoTimestamp(
    dashboard.updated,
    'state/dashboard/current.json -> updated'
  );

  if (!dashboardUpdatedAt) {
    throw new Error('state/dashboard/current.json is missing required "updated" timestamp');
  }

  const stalenessHours = getStalenessHours(dashboardUpdatedAt);
  if (stalenessHours > MAX_STALENESS_HOURS) {
    throw new Error(
      `Dashboard data is stale (${stalenessHours.toFixed(2)}h old, limit ${MAX_STALENESS_HOURS}h).`
    );
  }

  const watchlist = mapWatchlistItems(dashboard);
  const featuredAssets = mapFeaturedAssets(spotlight);
  const topPieces = featuredAssets.slice(0, 6).map((item) => ({
    id: item.id,
    title: item.title,
    grade: item.grade,
    set: item.collection,
    description: item.description,
    imageUrl: item.imageUrl,
    tier: item.tier,
    badge: item.badge
  }));

  const missingPcPriceCount = watchlist.filter((item) => item.pcPrice === null).length;

  const freshness = {
    generatedAt: nowIso,
    maxStalenessHours: MAX_STALENESS_HOURS,
    dashboardUpdatedAt: dashboardUpdatedAt.toISOString(),
    dashboardAgeHours: Number(stalenessHours.toFixed(2)),
    spotlightItems: featuredAssets.length
  };

  const publicJson = {
    version: '1.1',
    updated: nowIso,
    freshness,
    watchlist,
    stats: {
      totalWatched: watchlist.length,
      ready: watchlist.filter((item) => item.bucket === 'READY').length,
      review: watchlist.filter((item) => item.bucket === 'REVIEW').length,
      missingPcPriceCount
    }
  };

  const snapshotJson = {
    version: '1.1',
    generatedAt: nowIso,
    freshness,
    featuredAssets,
    currentHunts: [],
    huntStats: {
      source: 'No in-repo hunt definition source available',
      activeCount: 0
    },
    topPieces,
    stats: {
      totalFeaturedAssets: featuredAssets.length,
      totalTopPieces: topPieces.length,
      totalInventoryItems: watchlist.length,
      generatedAt: nowIso
    },
    notes: [
      'Generated strictly from in-repo source files.',
      'No external pricing fetches were performed.',
      'If source files are stale or missing, this script fails instead of fabricating content.'
    ]
  };

  writeJson(PUBLIC_WATCHLIST_PATH, publicJson);
  writeJson(PUBLIC_SNAPSHOT_PATH, snapshotJson);

  console.log('[freshness] Wrote', path.relative(ROOT, PUBLIC_WATCHLIST_PATH));
  console.log('[freshness] Wrote', path.relative(ROOT, PUBLIC_SNAPSHOT_PATH));
  console.log('[freshness] Inventory items:', watchlist.length);
  console.log('[freshness] Spotlight items:', featuredAssets.length);
}

if (require.main === module) {
  try {
    refreshSiteData();
  } catch (error) {
    console.error('[freshness] Failed:', error.message);
    process.exitCode = 1;
  }
}

module.exports = { refreshSiteData };
