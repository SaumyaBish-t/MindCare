import React from 'react'
import WhyMindcare from './WhyMindcare.jsx'
import Quotes from './Quotes.jsx'
import WellnessJourney from './WellnessJourney.jsx'
import StepForward from './StepForward.jsx'

const MiddleElements = () => {
  return (
    <>
    <div className='bg-gradient-to-r from-blue-200 to-purple-300 space-y-1'>
      <WhyMindcare />
      </div>
    <div>
      <Quotes/>
      </div>
      <div>
        <WellnessJourney />
      </div>
      <div>
        <StepForward />
      </div>
      </>
    
      
      

  )
}

export default MiddleElements
