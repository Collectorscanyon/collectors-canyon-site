import { useState } from 'react'

const OFFER_ENDPOINT = import.meta.env.VITE_OFFER_FORM_ENDPOINT || ''
const COURTYARD_SELLER_URL = import.meta.env.VITE_COURTYARD_SELLER_URL || 'https://courtyard.io'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'USDC', 'ETH', 'Other']

export default function OfferInbox() {
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()

    if (!OFFER_ENDPOINT) {
      setStatus({
        type: 'error',
        message: 'Offer inbox is not configured yet. Please use the Courtyard links for live purchasing.'
      })
      return
    }

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: formData.get('name'),
      contact: formData.get('contact'),
      cardReference: formData.get('cardReference'),
      offerAmount: formData.get('offerAmount'),
      currency: formData.get('currency'),
      notes: formData.get('notes'),
      source: 'collectorscanyon.cards offer inbox',
      intent: 'inbound-interest-only'
    }

    setSubmitting(true)
    setStatus({ type: 'idle', message: '' })

    try {
      const res = await fetch(OFFER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error(`Submission failed (${res.status})`)
      }

      event.currentTarget.reset()
      setStatus({
        type: 'success',
        message: 'Thanks — your interest was submitted. We review manually and will follow up using your contact info.'
      })
    } catch (_error) {
      setStatus({
        type: 'error',
        message: 'Submission did not go through. Please verify the form endpoint or contact hello@collectorscanyon.cards.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="offers" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-canyon-dark" />
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-canyon-accent/5 rounded-full blur-[140px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="section-label">Offer Inbox</span>
          <h2 className="text-4xl md:text-5xl font-black text-canyon-text mt-4 mb-4">
            Submit <span className="text-gradient">Interest</span>
          </h2>
          <p className="text-canyon-muted max-w-2xl mx-auto">
            Use this inbox to share buy-side interest on owned sell-side cards. This is not checkout and it does not
            place or accept marketplace orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card-hover p-7 md:p-8 border border-canyon-border/70">
            <h3 className="text-xl font-bold text-canyon-text mb-4">Before you submit</h3>
            <ul className="space-y-3 text-sm text-canyon-muted leading-relaxed">
              <li>• Live Courtyard listings are the authoritative place to buy available cards.</li>
              <li>• HOLD / museum pieces are display-only and are not for sale from this inbox.</li>
              <li>• We review manually and may decline or ignore non-owned or non-sell-side requests.</li>
              <li>• PriceCharting remains external pricing authority for comps and valuation context.</li>
            </ul>

            <div className="divider-line my-6" />

            <a
              href={COURTYARD_SELLER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 canyon-btn canyon-btn-secondary"
            >
              Browse Live Courtyard Listings
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          <form className="glass-card p-7 md:p-8 space-y-5" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm text-canyon-muted">Name</span>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full rounded-lg bg-canyon-elevated border border-canyon-border px-3 py-2.5 text-sm text-canyon-text focus:outline-none focus:border-canyon-accent"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-canyon-muted">Best contact (email, X, phone)</span>
                <input
                  required
                  name="contact"
                  type="text"
                  className="w-full rounded-lg bg-canyon-elevated border border-canyon-border px-3 py-2.5 text-sm text-canyon-text focus:outline-none focus:border-canyon-accent"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm text-canyon-muted">Card reference (Courtyard link, asset ID, or exact card)</span>
              <input
                required
                name="cardReference"
                type="text"
                placeholder="https://courtyard.io/asset/... or PSA cert + card"
                className="w-full rounded-lg bg-canyon-elevated border border-canyon-border px-3 py-2.5 text-sm text-canyon-text focus:outline-none focus:border-canyon-accent"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm text-canyon-muted">Offer amount</span>
                <input
                  required
                  name="offerAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg bg-canyon-elevated border border-canyon-border px-3 py-2.5 text-sm text-canyon-text focus:outline-none focus:border-canyon-accent"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-canyon-muted">Currency</span>
                <select
                  name="currency"
                  defaultValue="USD"
                  className="w-full rounded-lg bg-canyon-elevated border border-canyon-border px-3 py-2.5 text-sm text-canyon-text focus:outline-none focus:border-canyon-accent"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm text-canyon-muted">Notes (optional)</span>
              <textarea
                name="notes"
                rows={4}
                className="w-full rounded-lg bg-canyon-elevated border border-canyon-border px-3 py-2.5 text-sm text-canyon-text focus:outline-none focus:border-canyon-accent"
              />
            </label>

            <p className="text-xs text-canyon-dim">
              By submitting, you acknowledge this form does not accept or execute marketplace offers and does not
              guarantee availability.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="canyon-btn canyon-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Send Interest'}
            </button>

            {status.message && (
              <p className={`text-sm ${status.type === 'success' ? 'text-emerald-400' : 'text-red-300'}`}>
                {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
