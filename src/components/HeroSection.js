import React, { useEffect, useRef, useState } from 'react';
import '../styles/HeroSection.css';
import StatsModal from './StatsModal';

const HeroSection = ({ onOpenPopup }) => {
  const textRef = useRef(null);
  const statsRef = useRef(null);
  const [activeModal, setActiveModal] = useState(null);
  const [showMenuPopup, setShowMenuPopup] = useState(false);

  useEffect(() => {
    // Fade in text elements with staggered timing
    const text = textRef.current;
    if (text) {
      const elements = text.querySelectorAll('.fade-in');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, 1000 + (index * 200));
      });
    }

    // Animate stats counters
    const stats = statsRef.current;
    if (stats) {
      setTimeout(() => {
        stats.classList.add('animate');
      }, 800);
    }
  }, []);
  
  const handleStatClick = (statType) => {
    setActiveModal(statType);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };
  
  const closeModal = () => {
    setActiveModal(null);
    
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
  };

  // Handle phone mockup click
  const handlePhoneClick = (e) => {
    e.stopPropagation();
    setShowMenuPopup(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMenuPopup = () => {
    setShowMenuPopup(false);
    document.body.style.overflow = 'auto';
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (activeModal) {
          closeModal();
        }
        if (showMenuPopup) {
          closeMenuPopup();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [activeModal, showMenuPopup]);

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="gradient-overlay"></div>
        <div className="grid-pattern"></div>
      </div>
      
      <div className="hero-content" ref={textRef}>
        <h1 className="hero-title fade-in">
          <span className="gradient-text">Pour</span>
          <span className="accent-text">pal</span>
        </h1>
        <h2 className="hero-subtitle fade-in">YOUR FAVORITE BARTENDER'S FAVORITE BARTENDER</h2>
        <p className="hero-description fade-in">
          Eliminate bar chaos. Eliminate long lines.
          Happy customers. Efficient staff. More profits. Everybody wins.
        </p>
        
        <div className="hero-cta fade-in">
          <button className="primary-button" onClick={onOpenPopup}>Upgrade Your Bar</button>
          <button className="secondary-button" onClick={() => window.location.href = '/demo'}>Watch It In Action →</button>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="stats-container" ref={statsRef}>
          <div 
            className={`stat-card ${activeModal === 'wait-time' ? 'active' : ''}`}
            onClick={() => handleStatClick('wait-time')}
          >
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">30<span>%</span></h3>
              <p className="stat-label">Less Wait Time</p>
            </div>
            <div className="learn-more-hint">Click to see how</div>
          </div>
          
          <div 
            className={`stat-card ${activeModal === 'revenue' ? 'active' : ''}`}
            onClick={() => handleStatClick('revenue')}
          >
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">25<span>%</span></h3>
              <p className="stat-label">Revenue Increase</p>
            </div>
            <div className="learn-more-hint">Click to see how</div>
          </div>
          
          <div 
            className={`stat-card ${activeModal === 'efficiency' ? 'active' : ''}`}
            onClick={() => handleStatClick('efficiency')}
          >
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">40<span>%</span></h3>
              <p className="stat-label">Increase in Staff Efficiency</p>
            </div>
            <div className="learn-more-hint">Click to see how</div>
          </div>
        </div>
        
        <div className="device-mockup" onClick={handlePhoneClick}>
          <div className="phone-frame">
            <div className="phone-screen">
              <div className="app-screen">
                <div className="app-header">
                  <div className="app-logo">Pourpal</div>
                  <div className="app-icon"></div>
                </div>
                <div className="app-content">
                  <div className="menu-item">
                    <div className="menu-item-info">
                      <div className="menu-item-name">Old Fashioned</div>
                      <div className="menu-item-price">$12</div>
                    </div>
                    <div className="menu-item-action">+</div>
                  </div>
                  <div className="menu-item active">
                    <div className="menu-item-info">
                      <div className="menu-item-name">Margarita</div>
                      <div className="menu-item-price">$10</div>
                    </div>
                    <div className="menu-item-action">+</div>
                  </div>
                  <div className="menu-item">
                    <div className="menu-item-info">
                      <div className="menu-item-name">Mojito</div>
                      <div className="menu-item-price">$11</div>
                    </div>
                    <div className="menu-item-action">+</div>
                  </div>
                  <div className="menu-item">
                    <div className="menu-item-info">
                      <div className="menu-item-name">Espresso Martini</div>
                      <div className="menu-item-price">$14</div>
                    </div>
                    <div className="menu-item-action">+</div>
                  </div>
                </div>
                <div className="app-footer">
                  <div className="order-button">Order Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="scroll-indicator">
        <span>Scroll</span>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19" stroke="currentColor" strokeWidth="2"/>
          <path d="M19 12L12 19L5 12" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      
      {activeModal && (
        <StatsModal 
          statType={activeModal} 
          onClose={closeModal}
        />
      )}
      
      {/* Menu Integration Popup */}
      {showMenuPopup && (
        <div className="menu-popup-overlay" onClick={closeMenuPopup}>
          <div className="menu-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={closeMenuPopup}>×</button>
            <h2>Seamless Menu Integration</h2>
            <p className="subtitle">Your entire bar menu, digitized in minutes</p>
            
            <div className="popup-content">
              <h3>No More Menu Maintenance Headaches</h3>
              <p>PourPal transforms your existing menu into a digital masterpiece with zero effort on your part. Our team handles the entire process, from initial setup to seasonal updates.</p>
              
              <h3>Three Simple Steps to Digital Transformation</h3>
              <ol>
                <li><strong>Share Your Menu</strong> - Send us your current menu in any format</li>
                <li><strong>Magic Happens</strong> - Our team digitizes everything</li>
                <li><strong>Go Live</strong> - Within 48 hours, your menu is available via the app</li>
              </ol>
              
              <h3>Smart Features That Drive Revenue</h3>
              <ul>
                <li><strong>Intelligent Upselling</strong> - Suggests premium spirits and add-ons</li>
                <li><strong>Dynamic Pricing</strong> - Easily implement happy hour specials</li>
                <li><strong>Real-Time Updates</strong> - Update when items sell out</li>
                <li><strong>Customer Insights</strong> - Learn which items drive revenue</li>
              </ul>
              
              <div className="phone-click-action">
                <p>Want to see your unique menu in our app? Click above to learn how we can craft a custom digital menu for your bar.</p>
              </div>
            </div>
            
            <button className="popup-button">Schedule Your Free Menu Integration</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;