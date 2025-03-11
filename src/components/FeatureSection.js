import React, { useEffect, useRef } from 'react';
import '../styles/FeatureSection.css';

const FeatureSection = () => {
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const features = sectionRef.current.querySelectorAll('.feature-card');
          features.forEach((feature, index) => {
            setTimeout(() => {
              feature.classList.add('animate');
            }, 200 * index);
          });
        }
      });
    }, { threshold: 0.2 });
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <section id="features" className="features-section" ref={sectionRef}>
      <div className="section-header">
        <h2 className="section-title">Elevate Your Bar Experience</h2>
        <p className="section-subtitle">EzDrink brings cutting-edge AI to revolutionize ordering</p>
      </div>
      
      <div className="features-container">
        <div className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 15V23" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 19H16" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="feature-title">Skip The Line</h3>
          <p className="feature-description">
            Order directly from your table or anywhere in the venue without waiting in line at the bar.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M1 10H23" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 15H16" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="feature-title">Seamless Payments</h3>
          <p className="feature-description">
            Securely pay through the app with multiple payment options and easy tipping.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 11C20 15.4183 16.4183 19 12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3C16.4183 3 20 6.58172 20 11Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 7V11L15 13" stroke="currentColor" strokeWidth="2"/>
              <path d="M22 22L18 18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="feature-title">Real-Time Updates</h3>
          <p className="feature-description">
            Get instant notifications when your order is being prepared and when it's ready for pickup.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M17.5 7.5V7.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="feature-title">Smart Recommendations</h3>
          <p className="feature-description">
            AI-powered suggestions based on your preferences and popular choices at the venue.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 9V6.5C2 4.01 4.01 2 6.5 2H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 2H17.5C19.99 2 22 4.01 22 6.5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 16V17.5C22 19.99 19.99 22 17.5 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22H6.5C4.01 22 2 19.99 2 17.5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 7V9C10.5 10.1 9.6 11 8.5 11H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.5 11H14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 7H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 9H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 13H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 15H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 17H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 15H11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 17H11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="feature-title">Order History</h3>
          <p className="feature-description">
            Easily reorder your favorites with a complete history of your past orders at any venue.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="feature-title">Contactless Experience</h3>
          <p className="feature-description">
            Minimize physical contact with menus and staff for a safer, more convenient experience.
          </p>
        </div>
      </div>
      
      <div className="features-cta">
        <button className="primary-button">Discover More</button>
      </div>
    </section>
  );
};

export default FeatureSection;