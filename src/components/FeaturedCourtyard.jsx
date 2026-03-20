import FeaturedCard from './FeaturedCard'

export default function FeaturedCourtyard({ assets = [] }) {
  return (
    <section id="collection" className="relative py-24 md:py-32 overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-canyon-deep via-canyon-dark to-canyon-deep" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-canyon-accent/3 rounded-full blur-[120px]" />
      
      {/* Top divider */}
      <div className="divider-line mb-24" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="section-label">Courtyard Vault</span>
          <h2 className="text-4xl md:text-5xl font-black text-canyon-text mt-4 mb-4">
            Featured <span className="text-gradient">Pieces</span>
          </h2>
          <p className="text-canyon-muted max-w-xl mx-auto">
            Hand-picked highlights from the vault. Each card is PSA-certified, 
            video-rendered, and showcase-ready.
          </p>
        </div>

        {/* Cards — horizontal scroll on mobile, flex on desktop */}
        <div className="flex items-stretch gap-6 overflow-x-auto pb-6 md:overflow-visible md:flex-wrap md:justify-center">
          {assets.map((asset, i) => (
            <div
              key={asset.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <FeaturedCard {...asset} />
            </div>
          ))}
          
          {/* Empty state */}
          {assets.length === 0 && (
            <div className="w-full text-center py-20 glass-card">
              <p className="text-canyon-muted">No featured assets yet — check back soon.</p>
            </div>
          )}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-12">
          <button className="canyon-btn canyon-btn-secondary">
            View Full Collection
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
