import React from 'react'
import { Button } from "@/components/ui/button"

const Hero = () => {
  return (
    <div className='bg-yellow-200 space-y-1'>
      <h1 className=' flex justify-center text-6xl text-center font-serif  pt-20 pb-6 text-white'>
        Your AI-Powered Mental Health Companion
      </h1>
      <p className=' text-center text-xl pb-8'>
        Experience personalized support, instant insights, and 24/7 care with our Advanced AI technology.
      </p>
      <div className='flex text-center justify-center pb-15 gap-5'>
        <Button size='lg' className="text-xl rounded-2xl">
            Start Free Session
        </Button>
        
        <Button size='lg' className="text-xl rounded-2xl">
            Learn More
        </Button>
      </div>
    </div>
  )
}

export default Hero
