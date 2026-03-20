export default function BrandJourney() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-canyon-deep via-canyon-dark to-canyon-deep" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-canyon-accent/4 rounded-full blur-[140px]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        
        {/* Mission statement */}
        <div className="text-center mb-16">
          <span className="section-label">Our Mission</span>
        </div>

        <div className="glass-card p-10 md:p-14 text-center space-y-6">
          
          <h2 className="text-3xl md:text-4xl font-black text-canyon-text leading-snug">
            Building a collector ecosystem
            <br />
            <span className="text-gradient">worth trusting.</span>
          </h2>

          <p className="text-canyon-muted text-lg leading-relaxed max-w-2xl mx-auto">
            Collectors Canyon isn't a card shop. We're a systematic approach to 
            finding, certifying, and showcasing exceptional Pokémon cards — 
            built for collectors who care about authenticity, condition, and value.
          </p>

          <div className="divider-line my-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: 'Active Hunting',
                body: 'Our pipelines scan thousands of listings daily so you don\'t have to. We find the deals before they disappear.',
                icon: '⚡',
              },
              {
                title: 'Rigorous Grading',
                body: 'Every significant card goes to PSA. No exceptions. The grade is the truth.',
                icon: '🏆',
              },
              {
                title: 'Transparent Portfolio',
                body: 'The vault is the brand. What we show is what we have — nothing staged, nothing hidden.',
                icon: '👁',
              },
            ].map((item) => (
              <div key={item.title} className="space-y-2">
                <div className="text-2xl">{item.icon}</div>
                <h3 className="font-bold text-canyon-text">{item.title}</h3>
                <p className="text-sm text-canyon-muted leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
