import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './styles/App.css';
// In your App.js or routing configuration
import AppDownloadSplash from './components/AppDownloadSplash';

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
import CashFinderPage from './components/CashFinderPage';

// QR Tracker component
const QRTracker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Extract tracking parameter from URL
    const params = new URLSearchParams(location.search);
    const trackingId = params.get('t');
    
    if (trackingId) {
      console.log(`QR Code scan detected: ${trackingId}`);
      
      // Record the scan
      recordScan(trackingId, location.pathname);
      
      // Remove tracking parameter from URL (optional)
      // This keeps the URL clean after tracking is recorded
      const cleanParams = new URLSearchParams(location.search);
      cleanParams.delete('t');
      const newSearch = cleanParams.toString();
      const newPath = location.pathname + (newSearch ? `?${newSearch}` : '');
      
      // Only navigate if there were other parameters to preserve
      if (location.search !== `?t=${trackingId}`) {
        navigate(newPath, { replace: true });
      }
    }
  }, [location, navigate]);
  
  const recordScan = (trackingId, path) => {
    try {
      // Create scan data object
      const scanData = {
        trackingId,
        timestamp: new Date().toISOString(),
        path,
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
      };
      
      // Store in localStorage for dashboard access
      const existingScans = JSON.parse(localStorage.getItem('ezdrink-qr-scans') || '[]');
      existingScans.push(scanData);
      localStorage.setItem('ezdrink-qr-scans', JSON.stringify(existingScans));
      
      // In a production environment, you might want to send this to a server
      // This could be implemented as a fetch call to your API endpoint
      // Example:
      /*
      fetch('/api/track-qr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scanData)
      });
      */
      
      console.log('QR scan recorded successfully', scanData);
    } catch (error) {
      console.error('Error recording QR scan:', error);
    }
  };
  
  // This component doesn't render anything visible
  return null;
};

// A wrapper component that conditionally renders the navbar
const AppContent = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showFunnel, setShowFunnel] = useState(false);
  const location = useLocation();
  
  // Check if the current path is a standalone page without navbar or footer
  const isDownloadPage = location.pathname === '/download';
  const isCashFinderPage = location.pathname === '/cash-finder';
  const hideNavbar = isDownloadPage || isCashFinderPage;

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

  // Check for QR code tracking parameter on initial load
  useEffect(() => {
    // This effect runs when the component mounts or the location changes
    // The actual tracking logic is handled by the QRTracker component
  }, [location]);

  // Create a function to open the funnel
  const openFunnel = () => {
    console.log("Opening funnel");
    setShowFunnel(true);
    // Close any other modals
    setShowPopup(false);
  };

  return (
    <div className="app-container">
      {/* Add the QR Tracker component */}
      <QRTracker />
      
      {/* Only show Navbar if not on standalone pages */}
      {!hideNavbar && (
        <Navbar 
          scrollPosition={scrollPosition} 
          onOpenFunnel={openFunnel}
        />
      )}
      
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
        <Route path="/download" element={<AppDownloadSplash />} />
        <Route path="/cash-finder" element={<CashFinderPage />} />
        {/* You could add a QR tracking dashboard route here */}
        {/* <Route path="/qr-tracking" element={<QRTrackingDashboard />} /> */}
      </Routes>
      
      {showCTA && !hideNavbar && (
        <div className="floating-cta">
          <button className="cta-button" onClick={openFunnel}>
            See How Much You'll Earn → Book Now
          </button>
        </div>
      )}
      
      {/* Only show Footer if not on standalone pages */}
      {!hideNavbar && <Footer />}
      
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
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;