import { processSteps } from '../data/mockData'

export default function HowItWorks() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 bg-canyon-deep" />
      <div className="absolute inset-0 bg-gradient-to-r from-canyon-dark via-transparent to-canyon-dark opacity-60" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="section-label">The Process</span>
          <h2 className="text-4xl md:text-5xl font-black text-canyon-text mt-4 mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-canyon-muted max-w-lg mx-auto">
            Every card in the vault follows the same disciplined path — 
            from hunt to hold.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-canyon-border to-transparent" />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {processSteps.map((step, i) => (
              <div key={step.step} className="relative text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                
                {/* Step number + icon */}
                <div className="relative z-10 inline-flex flex-col items-center mb-5">
                  <div className="w-24 h-24 rounded-2xl glass-card flex flex-col items-center justify-center gap-1 border border-canyon-border hover:border-canyon-accent/40 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(212,130,58,0.15)]">
                    <span className="text-3xl">{step.icon}</span>
                    <span className="text-xs font-bold text-canyon-dim tracking-widest">{step.step}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-canyon-text mb-2">{step.title}</h3>
                
                {/* Description */}
                <p className="text-sm text-canyon-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
