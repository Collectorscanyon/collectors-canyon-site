export default function Community() {
  const socials = [
    {
      name: 'X / Twitter',
      handle: '@CollectorsCanyon',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z"/>
        </svg>
      ),
      href: '#',
    },
    {
      name: 'Instagram',
      handle: '@collectorscanyon',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      href: '#',
    },
  ]

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 bg-canyon-dark" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        
        <span className="section-label">Follow Along</span>
        <h2 className="text-4xl md:text-5xl font-black text-canyon-text mt-4 mb-6">
          Join the <span className="text-gradient">Community</span>
        </h2>
        <p className="text-canyon-muted max-w-lg mx-auto mb-12">
          The vault grows in public. Follow our hunts, watch slabs come in, 
          and track the journey.
        </p>

        {/* Social links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.href}
              className="flex items-center gap-3 px-6 py-4 glass-card-hover border border-canyon-border text-canyon-muted hover:text-canyon-text transition-all duration-300"
            >
              <span className="text-canyon-accent">{social.icon}</span>
              <div className="text-left">
                <div className="text-xs text-canyon-dim">{social.name}</div>
                <div className="text-sm font-semibold">{social.handle}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Coming soon note */}
        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-canyon-elevated/60 border border-canyon-border text-sm text-canyon-dim">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          More community features coming soon
        </div>
      </div>
    </section>
  )
}
