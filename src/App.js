import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeatureSection from './components/FeatureSection';
import TestimonialSection from './components/TestimonialSection';
import PricingSection from './components/PricingSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import LeadCapturePopup from './components/LeadCapturePopup';

const App = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      setShowCTA(position > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Navbar scrollPosition={scrollPosition} />
        
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection onOpenPopup={() => setShowPopup(true)} />
              <FeatureSection />
              <TestimonialSection />
              <PricingSection />
              <ContactSection />
            </>
          } />
        </Routes>
        
        {showCTA && (
          <div className="floating-cta">
            <button className="cta-button" onClick={() => setShowPopup(true)}>
              Upgrade Your Bar
            </button>
          </div>
        )}
        
        <Footer />
        
        {showPopup && <LeadCapturePopup isOpen={showPopup} onClose={() => setShowPopup(false)} />}
      </div>
    </Router>
  );
};

export default App;