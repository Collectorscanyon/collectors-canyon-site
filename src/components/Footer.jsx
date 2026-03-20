export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative py-16 overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 bg-canyon-deep" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-canyon-border to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-gradient">Collectors Canyon</h3>
            <p className="text-sm text-canyon-dim mt-1">Hunting. Grading. Curating.</p>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: 'Collection', href: '#collection' },
              { label: 'Hunting', href: '#hunting' },
              { label: 'Process', href: '#' },
              { label: 'About', href: '#' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-canyon-dim hover:text-canyon-accent transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="divider-line mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          
          <p className="text-xs text-canyon-dim">
            © {year} Collectors Canyon. All cards are genuine and PSA-certified.
          </p>

          <div className="flex items-center gap-1 text-xs text-canyon-dim">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System operational
          </div>
        </div>
      </div>
    </footer>
  )
}
