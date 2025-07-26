import React from 'react'
import Card from './Card.jsx'

const WhyMindcare = () => {
  return (
    <div className='space-y-1'>
      <h1 className='text-center pt-10 text-4xl text-black'> 
        Why Choose MindFlow Buddy?
      </h1>
      <div className='flex gap-10 items-center justify-center p-12 text-black'>
        <Card className="text-2xl text-black"
        imageSrc="/5x35n5.svg"
        altText="AI support"
        title="AI-Powered Support"
        description="Advanced machine learning algorithms provide personalized mental health support tailored to your unique needs and patterns."/>
        
        
        <Card imageSrc="/icons8-lock-94.png"
        altText="AI support"
        title="Private & Secure"
        description="Your mental health data is protected with enterprise-grade encryption and complete anonymity guaranteed."/>
        
        
        <Card imageSrc="/pngtree-lightning-electric-icon-png-image_6486818.png"
        altText="AI support"
        title="Instant Analysis"
        description="Get real-time sentiment analysis and mood tracking to better understand your emotional patterns and triggers."/>
        
        
        <Card imageSrc="/360_F_269957288_QuCW1rTni1oaZYQiG2vR7KcQ8mtOfrUw.jpg"
        altText="AI support"
        title="24/7 Availability"
        description="Access support whenever you need it. Our AI companion is always ready to listen and provide guidance."/>
      </div>
    </div>
  )
}

export default WhyMindcare
