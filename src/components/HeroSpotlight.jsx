import { useState, useEffect, useRef, useCallback } from 'react'

const TRANSITION_DURATION = 700 // ms
const AUTOAdvance_MS = 6000     // 6 seconds

export default function HeroSpotlight({ items = [] }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const timerRef = useRef(null)
  const videoRef = useRef(null)

  const total = items.length
  const active = items[current] || {}

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const goTo = useCallback((index, immediate = false) => {
    if (isTransitioning && !immediate) return
    setIsTransitioning(!immediate)
    setVideoLoaded(false)
    setCurrent(((index % total) + total) % total)
    if (!immediate) {
      setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION)
    }
  }, [isTransitioning, total])

  const prev = useCallback(() => goTo(current - 1), [current, goTo])
  const next = useCallback(() => goTo(current + 1), [current, goTo])

  // ─── Auto-advance ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPaused || total <= 1) return
    timerRef.current = setInterval(() => next(), AUTOAdvance_MS)
    return () => clearInterval(timerRef.current)
  }, [isPaused, total, next])

  // ─── Pause on hover ────────────────────────────────────────────────────────
  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  // ─── Touch / swipe ─────────────────────────────────────────────────────────
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStart === null) return
    const delta = touchStart - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) delta < 0 ? prev() : next()
    setTouchStart(null)
  }

  // ─── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  if (!items.length) return null

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0907] via-[#15120e] to-[#0d0907]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[#d4823a]/5 rounded-full blur-[150px] mx-auto pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(201,166,122,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,166,122,0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* ── Label ── */}
      <div className="relative z-10 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1812]/60 backdrop-blur-sm border border-[#3d2f22]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-sm text-[#9a8575] font-medium">Featured Spotlight</span>
        </div>
      </div>

      {/* ── Main card stage ── */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        <div
          className="relative"
          style={{ paddingBottom: '140%' }}
        >
          {/* Transition layer */}
          <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            
            {/* Card frame */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden glass-card">
              
              {/* Courtyard link overlay */}
              {active.courtyardUrl && (
                <a
                  href={active.courtyardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-30 cursor-pointer"
                  aria-label={`View ${active.title} on Courtyard`}
                />
              )}

              {/* Video / image */}
              <div className="absolute inset-0 bg-[#0d0907]">
                {active.videoUrl ? (
                  <>
                    {!videoLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-[#d4823a]/30 border-t-[#d4823a] animate-spin" />
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      key={active.id}
                      src={active.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onLoadedData={() => setVideoLoaded(true)}
                      onError={() => setVideoLoaded(true)}
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1e1812] to-[#0d0907]">
                    <div className="text-center">
                      <div className="text-7xl mb-4">{active.emoji || '🃏'}</div>
                      <div className="text-sm text-[#6b5548]">No preview available</div>
                    </div>
                  </div>
                )}

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0907] via-transparent to-[rgba(13,9,7,0.3)] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d0907]/60 via-transparent to-[#0d0907]/60 pointer-events-none" />

                {/* Grade pill */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-[#0d0907]/80 backdrop-blur-sm border border-[#3d2f22] text-[#c9a67a] text-sm font-bold tracking-wide">
                    {active.grade}
                  </div>
                  {active.courtyardUrl && (
                    <div className="relative z-40 px-3 py-1.5 rounded-full bg-[#0d0907]/80 backdrop-blur-sm border border-[#3d2f22] text-[#9a8575] text-xs font-medium flex items-center gap-1.5 hover:text-[#c9a67a] hover:border-[#d4823a]/40 transition-all duration-200">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Courtyard
                    </div>
                  )}
                </div>

                {/* Tier glow line */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d4823a]/40 to-transparent" />
              </div>

              {/* Info panel — overlaid at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
                <div className="space-y-3">
                  {/* Badge */}
                  {active.badge && (
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide
                        ${active.badgeVariant === 'gold' ? 'bg-gradient-to-r from-yellow-600 to-amber-500 text-black' :
                          active.badgeVariant === 'muted' ? 'bg-[#2a2118] text-[#9a8575] border border-[#3d2f22]' :
                          'bg-gradient-to-r from-[#d4823a] to-[#e89a52] text-black'}`}>
                        {active.badge}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-black text-[#f0e4d7] leading-tight">
                    {active.title}
                  </h2>

                  {/* Subtitle */}
                  {active.subtitle && (
                    <p className="text-sm text-[#9a8575]">{active.subtitle}</p>
                  )}

                  {/* Description */}
                  {active.description && (
                    <p className="text-xs text-[#6b5548] leading-relaxed line-clamp-2 max-w-md">
                      {active.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation: prev / next ── */}
        {total > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full glass-card border border-[#3d2f22] flex items-center justify-center text-[#9a8575] hover:text-[#c9a67a] hover:border-[#d4823a]/40 transition-all duration-200 active:scale-95"
              aria-label="Previous"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2.5 bg-gradient-to-r from-[#d4823a] to-[#e89a52]' : 'w-2.5 h-2.5 bg-[#3d2f22] hover:bg-[#6b5548]'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full glass-card border border-[#3d2f22] flex items-center justify-center text-[#9a8575] hover:text-[#c9a67a] hover:border-[#d4823a]/40 transition-all duration-200 active:scale-95"
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        )}

        {/* ── Pause indicator ── */}
        {isPaused && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#6b5548]"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <span className="text-xs text-[#6b5548]">Paused</span>
          </div>
        )}
      </div>

      {/* ── CTA row ── */}
      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4">
        <a href="#collection" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#d4823a] to-[#e89a52] text-[#0d0907] shadow-[0_4px_20px_rgba(212,130,58,0.35)] hover:shadow-[0_8px_30px_rgba(212,130,58,0.5)] hover:-translate-y-0.5 transition-all duration-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Explore the Collection
        </a>
        <a href="#hunting" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-transparent text-[#c9a67a] border border-[rgba(201,166,122,0.3)] hover:bg-[rgba(201,166,122,0.1)] hover:border-[rgba(201,166,122,0.5)] hover:-translate-y-0.5 transition-all duration-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          See What We're Hunting
        </a>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-[float_6s_ease-in-out_infinite]">
        <span className="text-xs text-[#6b5548] tracking-widest uppercase">Scroll</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#6b5548]"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>
    </section>
  )
}
