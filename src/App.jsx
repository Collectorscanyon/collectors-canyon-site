import Hero from './components/Hero'
import FeaturedCourtyard from './components/FeaturedCourtyard'
import WhatWereHunting from './components/WhatWereHunting'
import TopPieces from './components/TopPieces'
import HowItWorks from './components/HowItWorks'
import BrandJourney from './components/BrandJourney'
import Community from './components/Community'
import Footer from './components/Footer'
import { featuredAssets, currentHunts, topPieces } from './data/mockData'

function App() {
  return (
    <div className="min-h-screen bg-canyon-deep">
      <Hero />
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
