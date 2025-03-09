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
import LeadCaptureFunnel from './components/LeadCaptureFunnel';
import DemoPage from './components/DemoPage';
import IncreaseRevenue from './components/IncreaseRevenue';
import ReduceExpenses from './components/ReduceExpenses';

const App = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showFunnel, setShowFunnel] = useState(false);

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

  // Create a function to open the funnel
  const openFunnel = () => {
    console.log("Opening funnel");
    setShowFunnel(true);
    // Close any other modals
    setShowPopup(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar 
          scrollPosition={scrollPosition} 
          onOpenFunnel={openFunnel}
        />
        
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection onOpenPopup={() => setShowPopup(true)} />
              <FeatureSection />
              <ContactSection />
            </>
          } />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/increase-revenue" element={<IncreaseRevenue />} />
          <Route path="/reduce-expenses" element={<ReduceExpenses />} />
        </Routes>
        
        {showCTA && (
          <div className="floating-cta">
            <button className="cta-button" onClick={openFunnel}>
              See How Much You'll Earn → Book Now
            </button>
          </div>
        )}
        
        <Footer />
        
        {showPopup && <LeadCapturePopup isOpen={showPopup} onClose={() => setShowPopup(false)} />}
        
        {/* Make sure the funnel is rendered when showFunnel is true */}
        {showFunnel && (
          <LeadCaptureFunnel 
            isOpen={showFunnel} 
            onClose={() => {
              console.log("Closing funnel");
              setShowFunnel(false);
            }} 
          />
        )}
      </div>
    </Router>
  );
};

export default App;