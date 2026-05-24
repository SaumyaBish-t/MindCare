import {
  BrowserRouter as Router, Route, Routes, useLocation, Navigate,
} from "react-router-dom";
import {
  SignedIn, SignedOut, RedirectToSignIn,
} from "@clerk/clerk-react";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/DashBoard.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Features from "./pages/Features.jsx";
import Buddy from "./pages/Buddy.jsx";
import Mood from "./pages/SentimentalAnalysis.jsx";
import Journal from "./pages/gratitudeJournal.jsx";
import Resources from "./pages/Resources.jsx";
import Sleep from "./pages/Progress.jsx";
import SignInPage from "./pages/SignIn.jsx";
import SignUpPage from "./pages/SignUp.jsx";
import HabitBuilder from "./components/HabitBuilder.jsx";

// Routes whose page already manages full-viewport layout — no footer there.
const HIDE_FOOTER = new Set(["/buddy", "/login", "/get-started"]);

function Protected({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

function Layout({ children }) {
  const { pathname } = useLocation();
  const hideFooter = HIDE_FOOTER.has(pathname);
  return (
    <>
      <Navbar />
      <main key={pathname}>{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Auth */}
          <Route path="/login" element={<SignInPage />} />
          <Route path="/get-started" element={<SignUpPage />} />

          {/* Public */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />

          {/* Protected */}
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/buddy"     element={<Protected><Buddy /></Protected>} />
          <Route path="/mood"      element={<Protected><Mood /></Protected>} />
          <Route path="/sentimentalanalysis" element={<Navigate to="/mood" replace />} />
          <Route path="/habits"    element={<Protected><HabitBuilder /></Protected>} />
          <Route path="/journal"   element={<Protected><Journal /></Protected>} />
          <Route path="/gratitude" element={<Navigate to="/journal" replace />} />
          <Route path="/sleep"     element={<Protected><Sleep /></Protected>} />
          <Route path="/progress"  element={<Navigate to="/sleep" replace />} />
          <Route path="/resources" element={<Protected><Resources /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
