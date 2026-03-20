const TIER_BORDER = {
  Crown: 'border-yellow-500/40',
  Championship: 'border-canyon-accent/40',
  Vintage: 'border-canyon-sand/30',
  Neo: 'border-purple-500/30',
  Shining: 'border-yellow-400/30',
  'Gold Star': 'border-yellow-300/40',
  Ultra: 'border-canyon-accent/30',
}

export default function TopPieces({ pieces = [] }) {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-canyon-dark to-canyon-deep" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-canyon-sand/3 rounded-full blur-[120px] -translate-y-1/2" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="section-label">Highlight Reel</span>
          <h2 className="text-4xl md:text-5xl font-black text-canyon-text mt-4 mb-4">
            Top <span className="text-gradient">Pieces</span>
          </h2>
          <p className="text-canyon-muted max-w-xl mx-auto">
            The standout slabs in the vault. Graded, video-captured, and 
            ready for their close-up.
          </p>
        </div>

        {/* Pieces grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pieces.map((piece, i) => (
            <div
              key={piece.id}
              className={`
                glass-card-hover p-5 group cursor-pointer
                border ${TIER_BORDER[piece.tier] || 'border-canyon-border'}
                animate-slide-up
              `}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {/* Card art placeholder */}
              <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-canyon-elevated to-canyon-card border border-canyon-border/50 mb-4 overflow-hidden flex items-center justify-center group-hover:border-canyon-accent/30 transition-all duration-300">
                <div className="text-center">
                  <div className="text-5xl mb-2">🃏</div>
                  <div className="text-xs text-canyon-dim">{piece.grade}</div>
                </div>
              </div>

              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="canyon-badge bg-canyon-accent/20 text-canyon-accent border border-canyon-accent/30">
                  {piece.badge}
                </span>
                <span className="text-xs text-canyon-dim uppercase tracking-wide">{piece.tier}</span>
              </div>

              {/* Info */}
              <h3 className="font-bold text-canyon-text group-hover:text-canyon-accent-glow transition-colors duration-300 mb-1">
                {piece.title}
              </h3>
              <p className="text-xs text-canyon-muted mb-2">{piece.set}</p>
              <p className="text-xs text-canyon-dim leading-relaxed line-clamp-2">
                {piece.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
