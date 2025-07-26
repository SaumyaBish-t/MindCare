import React from 'react'
import Card2 from './Card2'

const WellnessJourney = () => {
  return (
    <div className='space-y-1 p-10'>
      <h1 className='justify-center text-center text-4xl font-sans font-semibold pb-12'>
        Your Wellness Journey Starts Here
      </h1>
      <div className='justify-items-center grid md:grid-cols-3 gap-8'>
        <Card2 
        imageSrc="/images.png"
        title="Talk It Out"
        description="Share your thoughts in a safe, judgment-free space with our compassionate digital companion"
        name="Start Chat"
        path="/buddy"
        />
        <Card2 
        imageSrc="/8457859.png"
        title="Mood Insights"
        description="Understand your emotional patterns through gentle analysis of your daily experiences"
        name="Check Your Mood"
        path="/sentimentalanalysis"
        />
        <Card2 
        imageSrc="/flat-sprouting-seedling-sapling-icon-vector-20048104.jpg"
        title="Daily Check-ins"
        description="Track your progress with simple, mindful questions that help you stay connected to yourself"
        name="Check in"
        path="/progress"
        />
        <Card2 
        imageSrc="/direct-hit_1f3af.png"
        title="Wellness Goals"
        description="Set meaningful intentions for your mental health journey with personalized guidance"
        name="Set Goals"
        path="/goals"
        />
        <Card2 
        imageSrc="/4407079.png"
        title="Gentle Reminders"
        description="Receive caring nudges for self-care, mindfulness, and wellness practices"
        name="Set Reminders"
        path="/reminders"
        />
        <Card2 
        imageSrc="/10089758.png"
        title="Wellness Resources"
        description="Access guided exercises, coping strategies, and educational content for your growth"
        name="Resources"
        path="/resources"
        />
        
      </div>
    </div>
  )
}

export default WellnessJourney
