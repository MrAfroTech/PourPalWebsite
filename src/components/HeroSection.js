import React, { useEffect, useRef } from 'react';
import '../styles/HeroSection.css';

const HeroSection = ({ onOpenPopup }) => {
  const textRef = useRef(null);
  const statsRef = useRef(null);

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
          Revolutionize your bar experience with AI-powered ordering.
          Skip the lines. Boost your sales. Elevate the experience.
        </p>
        
        <div className="hero-cta fade-in">
          <button className="primary-button">Upgrade Your Bar</button>
          <button className="secondary-button">See Demo</button>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="stats-container" ref={statsRef}>
          <div className="stat-card">
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
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">25<span>%</span></h3>
              <p className="stat-label">Revenue Increase</p>
            </div>
          </div>
          
          <div className="stat-card">
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
          </div>
        </div>
        
        <div className="device-mockup">
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
      

    </section>
  );
};

export default HeroSection;