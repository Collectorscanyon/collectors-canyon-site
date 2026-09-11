import { useEffect, useMemo, useState } from 'react'

const ACCESS_CODE = String(import.meta.env.VITE_SUBMISSIONS_ACCESS_CODE || '').trim()
const GATE_IS_CONFIGURED = ACCESS_CODE.length > 0
const SESSION_KEY = 'cc.submissions.unlocked'
const DATA_URL = '/data/submissions.json'

const STATUS_STYLES = {
  Preparing: 'bg-[#2a2118] text-[#c9a67a] border-[#3d2f22]',
  Received: 'bg-[#2a2118] text-[#f0e4d7] border-[#3d2f22]',
  QC: 'bg-[rgba(212,130,58,0.12)] text-[#e89a52] border-[rgba(212,130,58,0.35)]',
  Grading: 'bg-[rgba(212,130,58,0.18)] text-[#ffb065] border-[rgba(212,130,58,0.45)]',
  Graded: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  Shipped: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  Delivered: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  'On Hold': 'bg-amber-500/10 text-amber-200 border-amber-500/30',
}

function formatDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function statusClass(status) {
  return STATUS_STYLES[status] || 'bg-[#2a2118] text-[#9a8575] border-[#3d2f22]'
}

function setNoIndex() {
  let robots = document.querySelector('meta[name="robots"]')
  if (!robots) {
    robots = document.createElement('meta')
    robots.setAttribute('name', 'robots')
    document.head.appendChild(robots)
  }
  robots.setAttribute('content', 'noindex, nofollow')

  let googlebot = document.querySelector('meta[name="googlebot"]')
  if (!googlebot) {
    googlebot = document.createElement('meta')
    googlebot.setAttribute('name', 'googlebot')
    document.head.appendChild(googlebot)
  }
  googlebot.setAttribute('content', 'noindex, nofollow')

  document.title = 'Submissions (private) · Collectors Canyon'
}

export default function SubmissionsPage() {
  const [code, setCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [payload, setPayload] = useState(null)
  const [loadState, setLoadState] = useState('idle')

  useEffect(() => {
    setNoIndex()
    if (!GATE_IS_CONFIGURED) return
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setUnlocked(true)
    }
  }, [])

  useEffect(() => {
    if (!GATE_IS_CONFIGURED || !unlocked) return undefined

    let cancelled = false
    setLoadState('loading')

    fetch(DATA_URL, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load submissions (${response.status})`)
        }
        return response.json()
      })
      .then((json) => {
        if (cancelled) return
        if (!json || !Array.isArray(json.submissions)) {
          throw new Error('Submissions file is missing a submissions array')
        }
        setPayload(json)
        setLoadState('ready')
      })
      .catch((fetchError) => {
        if (cancelled) return
        setError(fetchError.message || 'Could not load submissions')
        setLoadState('error')
      })

    return () => {
      cancelled = true
    }
  }, [unlocked])

  const rows = useMemo(() => {
    const list = payload?.submissions || []
    return [...list].sort((a, b) => String(b.lastUpdated || '').localeCompare(String(a.lastUpdated || '')))
  }, [payload])

  function handleUnlock(event) {
    event.preventDefault()
    setError('')
    if (!GATE_IS_CONFIGURED) return
    if (code.trim() === ACCESS_CODE) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setUnlocked(true)
      setCode('')
      return
    }
    setError('Access code did not match.')
  }

  function handleLock() {
    sessionStorage.removeItem(SESSION_KEY)
    setUnlocked(false)
    setPayload(null)
    setLoadState('idle')
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#0d0907] text-[#f0e4d7]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0907] via-[#15120e] to-[#0d0907]" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-[#d4823a]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <a href="/" className="text-xl font-black text-gradient">
            Collectors Canyon
          </a>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-[#9a8575] hover:text-[#c9a67a] transition-colors">
              Back to site
            </a>
            {unlocked && (
              <button
                type="button"
                onClick={handleLock}
                className="text-[#6b5548] hover:text-[#c9a67a] transition-colors"
              >
                Lock
              </button>
            )}
          </div>
        </header>

        <div className="mb-8">
          <span className="section-label">Private tracker</span>
          <h1 className="text-4xl md:text-5xl font-black mt-3 mb-3">
            Grading <span className="text-gradient">Submissions</span>
          </h1>
          <p className="text-[#9a8575] max-w-2xl">
            Shared-password check for current PSA, Beckett, and other company drops.
            Owner-updated JSON — not a live grading-company feed.
          </p>
        </div>

        {!GATE_IS_CONFIGURED && <NotConfiguredCard />}

        {GATE_IS_CONFIGURED && !unlocked && (
          <GateCard
            code={code}
            error={error}
            onChange={setCode}
            onSubmit={handleUnlock}
          />
        )}

        {GATE_IS_CONFIGURED && unlocked && (
          <TrackerBoard
            payload={payload}
            rows={rows}
            loadState={loadState}
            error={error}
          />
        )}
      </div>
    </div>
  )
}

function NotConfiguredCard() {
  return (
    <section className="glass-card p-8 md:p-10 max-w-xl">
      <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#d4823a] mb-3">
        Coming soon / not configured
      </p>
      <h2 className="text-2xl font-black mb-3">This tracker stays closed.</h2>
      <p className="text-[#9a8575] leading-relaxed">
        No access code is set for this build, so submission data is not loaded.
        The owner sets <code className="text-[#c9a67a]">VITE_SUBMISSIONS_ACCESS_CODE</code> at
        build time, then redeploys Pages.
      </p>
    </section>
  )
}

function GateCard({ code, error, onChange, onSubmit }) {
  return (
    <section className="glass-card p-8 md:p-10 max-w-md">
      <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#d4823a] mb-3">
        Access required
      </p>
      <h2 className="text-2xl font-black mb-2">Enter the shared code</h2>
      <p className="text-sm text-[#9a8575] mb-6">
        One code for friends checking current submissions. This is a simple gate,
        not individual logins.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="sr-only">Access code</span>
          <input
            type="password"
            name="access-code"
            autoComplete="current-password"
            value={code}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Access code"
            className="w-full rounded-xl bg-[#0d0907] border border-[#3d2f22] px-4 py-3 text-[#f0e4d7] placeholder:text-[#6b5548] focus:outline-none focus:border-[#d4823a]/60"
          />
        </label>
        {error && <p className="text-sm text-amber-300">{error}</p>}
        <button type="submit" className="canyon-btn canyon-btn-primary w-full justify-center">
          Unlock submissions
        </button>
      </form>
    </section>
  )
}

function TrackerBoard({ payload, rows, loadState, error }) {
  return (
    <section className="space-y-6">
      <div className="glass-card p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm text-[#c9a67a] font-semibold">Manual daily refresh</p>
          <p className="text-sm text-[#9a8575]">
            Last file refresh: {formatDate(payload?.lastRefreshedAt)} ·{' '}
            {payload?.source === 'manual-owner-json' ? 'owner JSON' : 'local file'}
          </p>
        </div>
        <p className="text-xs text-[#6b5548] max-w-md">
          Seed rows are marked EXAMPLE. There is no live PSA/Beckett API sync yet.
          No marketplace writes and no invented nets.
        </p>
      </div>

      {loadState === 'loading' && (
        <p className="text-[#9a8575]">Loading current submissions…</p>
      )}

      {loadState === 'error' && (
        <p className="text-amber-300">{error || 'Could not load submissions.'}</p>
      )}

      {loadState === 'ready' && rows.length === 0 && (
        <p className="text-[#9a8575]">No submissions in the current file.</p>
      )}

      <div className="grid gap-5">
        {rows.map((row) => (
          <article key={row.id || row.submissionId} className="glass-card p-6 md:p-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="canyon-badge bg-[#2a2118] text-[#c9a67a] border border-[#3d2f22]">
                {row.company}
              </span>
              <span className={`canyon-badge border ${statusClass(row.status)}`}>
                {row.status}
              </span>
              {row.example && (
                <span className="canyon-badge bg-[#d4823a] text-[#0d0907]">
                  EXAMPLE
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{row.submissionId}</h2>
                <p className="text-sm text-[#9a8575] mt-1">
                  {row.itemCount} item{row.itemCount === 1 ? '' : 's'} · submitted {formatDate(row.submittedAt)}
                </p>
              </div>
              <div className="text-sm text-[#9a8575] md:text-right">
                <p>
                  {row.etaDays == null ? 'ETA not set' : `Est. ~${row.etaDays} day turn`}
                </p>
                <p>Updated {formatDate(row.lastUpdated)}</p>
              </div>
            </div>

            <p className="text-[#c9a67a]/90 leading-relaxed">{row.notes}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
