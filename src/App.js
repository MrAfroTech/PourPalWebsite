import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './styles/App.css';
// In your App.js or routing configuration
import AppDownloadSplash from './components/AppDownloadSplash';
import EzDrinkVideoPopup from './components/EzDrinkVideoPopup';

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
import WineWalkMap from './components/WineWalkMap';
import KidsExpoMap from './components/KidsExpoMap';
import EzDrinkSignup from './components/EzDrinkSignup';
import SignupSuccess from './components/SignupSuccess';
import EzFestSignup from './components/EzFestSignup';


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
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const location = useLocation();
  
  // Check if the current path is a standalone page without navbar or footer
  const isDownloadPage = location.pathname === '/download';
  const isCashFinderPage = location.pathname === '/cash-finder';
  // AFTER:
const isWineWalkPage = location.pathname === '/wine-walk';
const isKidsExpoPage = location.pathname === '/kids-expo';
const isSignupPage = location.pathname === '/signup';
const isSignupSuccessPage = location.pathname === '/signup-success';
const isEzFestPage = location.pathname === '/ezfest';
const hideNavbar = isDownloadPage || isCashFinderPage || isWineWalkPage || isKidsExpoPage || isSignupPage || isSignupSuccessPage || isEzFestPage;

  // Auto-display video popup when site loads
  useEffect(() => {
    // Only show popup on homepage (not on other routes)
    if (location.pathname === '/') {
      // Delay showing popup by 3 seconds for better user experience
      const timer = setTimeout(() => {
        setShowVideoPopup(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

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
    setShowVideoPopup(false); // Close video popup as well
  };
  
  // Create a function to open the video popup manually
  const openVideoPopup = () => {
    console.log("Opening video popup");
    setShowVideoPopup(true);
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
        <Route path="/wine-walk" element={<WineWalkMap />} />
        <Route path="/kids-expo" element={<KidsExpoMap />} />
        <Route path="/signup" element={<EzDrinkSignup />} />
        <Route path="/signup-success" element={<SignupSuccess />} />
        <Route path="/ezfest" element={<EzFestSignup />} />


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
      
      {/* Existing popups */}
      {showPopup && <LeadCapturePopup isOpen={showPopup} onClose={() => setShowPopup(false)} />}
      
      {showFunnel && (
        <LeadCaptureFunnel 
          isOpen={showFunnel} 
          onClose={() => {
            console.log("Closing funnel");
            setShowFunnel(false);
          }} 
        />
      )}
      
      {/* Video popup - now configured to appear automatically */}
      {showVideoPopup && (
        <EzDrinkVideoPopup 
          isOpen={showVideoPopup} 
          onClose={() => {
            console.log("Closing video popup");
            setShowVideoPopup(false);
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