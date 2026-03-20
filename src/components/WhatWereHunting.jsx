const PRIORITY_STYLES = {
  high: { border: 'border-red-500/30', badge: 'bg-red-500/15 text-red-300', dot: 'bg-red-400' },
  medium: { border: 'border-amber-500/30', badge: 'bg-amber-500/15 text-amber-300', dot: 'bg-amber-400' },
  low: { border: 'border-blue-500/30', badge: 'bg-blue-500/15 text-blue-300', dot: 'bg-blue-400' },
}

const STATUS_LABELS = {
  active: { label: 'Active Hunt', class: 'text-emerald-400' },
  watching: { label: 'Watching', class: 'text-amber-400' },
  exploring: { label: 'Exploring', class: 'text-canyon-dim' },
}

export default function WhatWereHunting({ hunts = [] }) {
  return (
    <section id="hunting" className="relative py-24 md:py-32 overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 bg-canyon-dark" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(201,166,122,0.4) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="section-label">Live Operations</span>
          <h2 className="text-4xl md:text-5xl font-black text-canyon-text mt-4 mb-4">
            What We're <span className="text-gradient">Hunting</span>
          </h2>
          <p className="text-canyon-muted max-w-xl mx-auto">
            Our automated pipelines run continuously, scanning thousands of listings 
            for the opportunities below.
          </p>
        </div>

        {/* Hunt grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hunts.map((hunt, i) => {
            const pStyle = PRIORITY_STYLES[hunt.priority] || PRIORITY_STYLES.medium
            const sLabel = STATUS_LABELS[hunt.status] || STATUS_LABELS.watching
            
            return (
              <div
                key={hunt.id}
                className={`
                  glass-card-hover p-6 space-y-4
                  border ${pStyle.border}
                  animate-slide-up
                `}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{hunt.icon}</span>
                    <span className={`canyon-badge ${pStyle.badge}`}>
                      {hunt.priority.toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${sLabel.class}`}>
                    {sLabel.label}
                  </span>
                </div>

                {/* Category */}
                <p className="text-xs text-canyon-accent font-semibold tracking-wider uppercase">
                  {hunt.category}
                </p>

                {/* Title */}
                <h3 className="text-lg font-bold text-canyon-text leading-snug">
                  {hunt.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-canyon-muted leading-relaxed">
                  {hunt.description}
                </p>

                {/* Target grade + tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs px-2 py-1 rounded-md bg-canyon-elevated text-canyon-sand border border-canyon-border">
                    Target: {hunt.targetGrade}
                  </span>
                  {hunt.setTags?.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-md bg-canyon-deep text-canyon-dim border border-canyon-border/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Animated pulse indicator for active hunts */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <p className="text-sm text-canyon-muted">
            {hunts.filter(h => h.status === 'active').length} active hunt{hunts.filter(h => h.status === 'active').length !== 1 ? 's' : ''} running continuously
          </p>
        </div>
      </div>
    </section>
  )
}
