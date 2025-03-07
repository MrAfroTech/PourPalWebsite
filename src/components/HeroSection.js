import React, { useEffect, useRef } from 'react';
import '../styles/HeroSection.css';

const HeroSection = () => {
  const liquidRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Animate liquid pour effect
    const liquid = liquidRef.current;
    if (liquid) {
      setTimeout(() => {
        liquid.classList.add('animate-pour');
      }, 500);
    }

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
        <h2 className="hero-subtitle fade-in">AI Ordering Assistant</h2>
        <p className="hero-description fade-in">
          Revolutionize your bar experience with AI-powered ordering.
          Skip the lines. Boost your sales. Elevate the experience.
        </p>
        
        <div className="hero-cta fade-in">
          <button className="primary-button">For Bar Owners</button>
          <button className="secondary-button">For Customers</button>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="glass-container">
          <div className="glass">
            <div className="glass-shine"></div>
          </div>
          <div className="liquid" ref={liquidRef}></div>
        </div>
        
        <div className="floating-elements">
          <div className="floating-icon icon-1">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 15V23" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 19H16" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="floating-icon icon-2">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8H6C5.44772 8 5 8.44772 5 9V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V9C19 8.44772 18.5523 8 18 8Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 8V5C8 3.34315 9.34315 2 11 2H13C14.6569 2 16 3.34315 16 5V8" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12V18" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 15H15" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="floating-icon icon-3">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
            </svg>
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