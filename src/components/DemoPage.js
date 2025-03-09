import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/DemoPage.css';

const DemoPage = () => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    // Auto-scroll to video section when page loads
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="demo-page">
      <div className="demo-hero">
        <div className="demo-overlay"></div>
        <div className="demo-content">
          <h1 className="demo-title">See How PourPal Works</h1>
          <p className="demo-subtitle">Experience the future of bar ordering in action</p>
        </div>
      </div>
      
      <div className="video-section" ref={videoRef}>
        <div className="video-container">
          <div className="limited-time-banner">
            <span className="pulse-dot"></span>
            <span>Limited Time: 30% Off Launch Pricing Ends Soon!</span>
          </div>
          
          <div className="video-wrapper">
            {/* Replace with your actual video source */}
            <video 
                controls 
                autoPlay 
                poster="/bar-background.svg"
                className="demo-video"
            >
                <source src="/pourPalDemo.mp4" type="video/mp4" />
                <source src="/pourPalDemo.webm" type="video/webm" />
                Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="video-caption">
            <h3>See how PourPal can transform your bar experience in just 2 minutes</h3>
          </div>
        </div>
        
        <div className="post-video-cta">
          <h2>Ready to revolutionize your bar?</h2>
          <p>Join the hundreds of bar owners already seeing amazing results with PourPal</p>
          <Link to="/" className="cta-button">Get Started Now - 30% Off</Link>
          <p className="hurry-text">Hurry! Special pricing ends soon.</p>
        </div>
      </div>
      
      <div className="demo-features">
        <div className="feature-highlight">
          <div className="feature-icon">⚡</div>
          <h3>Speed</h3>
          <p>Cut wait times by 30%</p>
        </div>
        
        <div className="feature-highlight">
          <div className="feature-icon">💰</div>
          <h3>Revenue</h3>
          <p>Increase sales by 25%</p>
        </div>
        
        <div className="feature-highlight">
          <div className="feature-icon">👥</div>
          <h3>Efficiency</h3>
          <p>Boost staff productivity by 40%</p>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;