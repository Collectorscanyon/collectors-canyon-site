import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export function useSnapshot() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSnapshot() {
      try {
        // In dev, fetch from localhost preview server
        // In production, fetch from the same origin (static JSON)
        const url = `${API_BASE}/snapshot.json`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (e) {
        setError(e.message)
        console.error('[useSnapshot]', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSnapshot()
  }, [])

  return { data, loading, error }
}
