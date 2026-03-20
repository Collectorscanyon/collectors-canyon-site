export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-canyon-deep via-canyon-dark to-canyon-deep" />
        
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-canyon-accent/5 rounded-full blur-[120px] mx-auto" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(201,166,122,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(201,166,122,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        
        {/* Floating orbs */}
        <div className="absolute top-1/3 left-[10%] w-64 h-64 bg-canyon-accent/5 rounded-full blur-[80px] animate-float" />
        <div className="absolute bottom-1/4 right-[15%] w-48 h-48 bg-canyon-sand/5 rounded-full blur-[60px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-20">
        
        {/* Pre-headline label */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-canyon-muted font-medium">Active & Hunting</span>
        </div>

        {/* Main headline */}
        <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-6 animate-slide-up">
          <span className="text-gradient block">Collectors</span>
          <span className="text-canyon-text block mt-2">Canyon</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-canyon-muted max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-slide-up" style={{ animationDelay: '0.1s' }}>
          We hunt, grade, and curate the world's finest Pokémon cards. 
          Building a collection worth collector trust.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <a href="#collection" className="canyon-btn canyon-btn-primary text-base">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Explore the Collection
          </a>
          <a href="#hunting" className="canyon-btn canyon-btn-secondary text-base">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            See What We're Hunting
          </a>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {[
            { label: 'Cards in Vault', value: '247' },
            { label: 'PSA Graded', value: '183' },
            { label: 'Active Hunts', value: '6' },
            { label: 'Years Building', value: '3+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-gradient">{stat.value}</div>
              <div className="text-xs text-canyon-dim mt-1 tracking-wide uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <span className="text-xs text-canyon-dim tracking-widest uppercase">Scroll</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-canyon-dim">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  )
}
