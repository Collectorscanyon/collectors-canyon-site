import { useSnapshot } from './hooks/useSnapshot'
import HeroSpotlight from './components/HeroSpotlight'
import FeaturedCourtyard from './components/FeaturedCourtyard'
import WhatWereHunting from './components/WhatWereHunting'
import TopPieces from './components/TopPieces'
import HowItWorks from './components/HowItWorks'
import BrandJourney from './components/BrandJourney'
import Community from './components/Community'
import Footer from './components/Footer'
import { featuredAssets as mockFeatured, currentHunts as mockHunts, topPieces as mockPieces } from './data/mockData'

function App() {
  const { data, loading } = useSnapshot()

  // Use live spotlight items for the hero rotator, fall back to mock featured for other sections
  const spotlightItems = data?.featuredAssets || mockFeatured
  const currentHunts = data?.currentHunts || mockHunts
  const topPieces = data?.topPieces || mockPieces
  const stats = data?.stats || null

  return (
    <div className="min-h-screen bg-[#0d0907]">
      <HeroSpotlight items={spotlightItems} />
      <FeaturedCourtyard assets={spotlightItems} />
      <WhatWereHunting hunts={currentHunts} />
      <TopPieces pieces={topPieces} />
      <HowItWorks />
      <BrandJourney stats={stats} />
      <Community />
      <Footer />
    </div>
  )
}

export default App
