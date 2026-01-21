import React from 'react'
import {BrowserRouter as Router, Route,Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn,SignInButton, UserButton } from '@clerk/clerk-react'
import Hero from './components/Hero'
import MiddleElements from './components/MiddleElements'
import Footer from './components/Footer'
import DashBoard from './pages/DashBoard'
import About from './pages/About'
import Contact from './pages/Contact'
import Features from './pages/Features'
import Buddy from './pages/Buddy'
import SentimentalAnalysis from './pages/SentimentalAnalysis'
import Goals from './pages/Goals'
import Gratitude from './pages/gratitudeJournal'
import Resources from './pages/Resources'
import Progress from './pages/Progress'
import SignInPage from './pages/SignIn'
import SignUpPage from './pages/SignUp'
import HabitBuilder from './components/HabitBuilder';



const App = () => {

  return (
    <div>
      <Router>
        
      <Routes>
        <Route
          path="/"
          element={
            <>
            <Navbar />
              <Hero />
              <MiddleElements />
              <Footer />
            </>
          }
        />
         {/* Public routes */}
  <Route path="/login" element={<SignInPage />} />
  <Route path="/get-started" element={<SignUpPage />} />

  {/* Protected routes */}
  <Route
    path="/dashboard"
    element={
      <>
        <SignedIn>
          <DashBoard />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
  <Route
    path="/features"
    element={
      <>
        <SignedIn>
          <Features />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
  <Route
    path="/about"
    element={
      <>
        <SignedIn>
          <About />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
  <Route
    path="/contact"
    element={
      <>
        <SignedIn>
          <Contact />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
  <Route
    path="/buddy"
    element={
      <>
        <SignedIn>
          <Buddy />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
  <Route
    path="/sentimentalanalysis"
    element={
      <>
        <SignedIn>
          <SentimentalAnalysis />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
  <Route
    path="/habits"
    element={
      <>
        <SignedIn>
          <HabitBuilder />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
  <Route
    path="/gratitude"
    element={
      <>
        <SignedIn>
          <Gratitude />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
  <Route
    path="/resources"
    element={
      <>
        <SignedIn>
          <Resources />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
  <Route
    path="/progress"
    element={
      <>
        <SignedIn>
          <Progress />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    }
  />
        </Routes>
        </Router>
    </div>
  )
}

export default App
