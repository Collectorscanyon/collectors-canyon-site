import { useSnapshot } from './hooks/useSnapshot'
import Hero from './components/Hero'
import FeaturedCourtyard from './components/FeaturedCourtyard'
import WhatWereHunting from './components/WhatWereHunting'
import TopPieces from './components/TopPieces'
import HowItWorks from './components/HowItWorks'
import BrandJourney from './components/BrandJourney'
import Community from './components/Community'
import Footer from './components/Footer'
import { featuredAssets as mockFeatured, currentHunts as mockHunts, topPieces as mockPieces } from './data/mockData'

function App() {
  const { data, loading, error } = useSnapshot()

  // Use live data when available, fall back to mock data for development
  const featuredAssets = data?.featuredAssets || mockFeatured
  const currentHunts = data?.currentHunts || mockHunts
  const topPieces = data?.topPieces || mockPieces
  const stats = data?.stats || null

  return (
    <div className="min-h-screen bg-[#0d0907]">
      <Hero stats={stats} loading={loading} />
      <FeaturedCourtyard assets={featuredAssets} />
      <WhatWereHunting hunts={currentHunts} />
      <TopPieces pieces={topPieces} />
      <HowItWorks />
      <BrandJourney />
      <Community />
      <Footer />
    </div>
  )
}

export default App
