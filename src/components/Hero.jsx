export default function Hero({ stats = null, loading = false }) {
  const vaultCount = stats?.totalVault ?? '—'
  const psaCount = stats?.totalPSA ?? '—'
  const listedCount = stats?.totalListed ?? '—'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0907] via-[#15120e] to-[#0d0907]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#d4823a]/5 rounded-full blur-[120px] mx-auto" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(201,166,122,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,166,122,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-1/3 left-[10%] w-64 h-64 bg-[#d4823a]/5 rounded-full blur-[80px] animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-[15%] w-48 h-48 bg-[#c9a67a]/5 rounded-full blur-[60px] animate-[float_6s_ease-in-out_infinite]" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-20">
        
        {/* Pre-headline label */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1812]/60 backdrop-blur-sm border border-[#3d2f22] mb-8 animate-[fadeIn_0.8s_ease-out]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-[#9a8575] font-medium">Active & Hunting</span>
        </div>

        {/* Main headline */}
        <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-6 animate-[slideUp_0.6s_ease-out]">
          <span className="bg-gradient-to-r from-[#d4823a] via-[#e89a52] to-[#ffb065] bg-clip-text text-transparent block">Collectors</span>
          <span className="text-[#f0e4d7] block mt-2">Canyon</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-[#9a8575] max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-[slideUp_0.6s_ease-out]" style={{ animationDelay: '0.1s' }}>
          We hunt, grade, and curate the world's finest Pokémon cards. 
          Building a collection worth collector trust.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16 animate-[slideUp_0.6s_ease-out]" style={{ animationDelay: '0.2s' }}>
          <a href="#collection" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#d4823a] to-[#e89a52] text-[#0d0907] shadow-[0_4px_20px_rgba(212,130,58,0.35)] hover:shadow-[0_8px_30px_rgba(212,130,58,0.5)] hover:-translate-y-0.5 transition-all duration-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Explore the Collection
          </a>
          <a href="#hunting" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-transparent text-[#c9a67a] border border-[rgba(201,166,122,0.3)] hover:bg-[rgba(201,166,122,0.1)] hover:border-[rgba(201,166,122,0.5)] hover:-translate-y-0.5 transition-all duration-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            See What We're Hunting
          </a>
        </div>

        {/* Stats bar — live data when available */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 animate-[fadeIn_0.8s_ease-out]" style={{ animationDelay: '0.4s' }}>
          {[
            { label: 'Cards in Vault', value: loading ? '—' : vaultCount },
            { label: 'PSA Graded', value: loading ? '—' : psaCount },
            { label: 'Active Listings', value: loading ? '—' : listedCount },
            { label: 'Years Building', value: '3+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black bg-gradient-to-r from-[#d4823a] to-[#e89a52] bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-xs text-[#6b5548] mt-1 tracking-wide uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-[float_6s_ease-in-out_infinite]">
        <span className="text-xs text-[#6b5548] tracking-widest uppercase">Scroll</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#6b5548]"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>
    </section>
  )
}
