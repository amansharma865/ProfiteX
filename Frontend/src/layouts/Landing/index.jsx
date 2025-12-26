import React from 'react'
import HeroPage from './HeroSection/HeroPage'

import LandingFeatures from './features/LandingFeatures'
import Testimonial from './testimonial/Testimonial'
import Price from './priceSection/Price'
import FAQ from './FAQ/fyq'
import Footer from './Footer/footer'
import '../../Scroll.css'

const Landing = () => {
  return (
    <div>
    <HeroPage/>
    <LandingFeatures/>
    <Testimonial/>
    <Price/>
    <FAQ/>
    <Footer/>
    
  </div>
  )
}

export default Landing
