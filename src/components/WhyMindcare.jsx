import React from 'react';
import Card from './Card.jsx';

const WhyMindcare = () => {
  return (
    <section className="container mx-auto px-4 md:px-8 lg:px-12 py-10 md:py-16">
      <h1 className="text-center  md:pt-2 text-3xl md:text-4xl text-black">
        Why Choose MindFlow Buddy?
      </h1>

      {/* 1 col (mobile) → 2 cols (sm) → 4 cols (lg) */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 place-items-stretch">
        <Card
          imageSrc="/5x35n5.svg"
          altText="AI support"
          title="AI‑Powered Support"
          description="Advanced machine learning algorithms provide personalized mental health support tailored to your unique needs and patterns."
        />
        <Card
          imageSrc="/icons8-lock-94.png"
          altText="Shield"
          title="Private & Secure"
          description="Your mental health data is protected with enterprise‑grade encryption and complete anonymity guaranteed."
        />
        <Card
          imageSrc="/pngtree-lightning-electric-icon-png-image_6486818.png"
          altText="Bolt"
          title="Instant Analysis"
          description="Get real‑time sentiment analysis and mood tracking to better understand your emotional patterns and triggers."
        />
        <Card
          imageSrc="/360_F_269957288_QuCW1rTni1oaZYQiG2vR7KcQ8mtOfrUw.jpg"
          altText="Headset"
          title="24/7 Availability"
          description="Access support whenever you need it. Our AI companion is always ready to listen and provide guidance."
        />
      </div>
    </section>
  );
};

export default WhyMindcare;
