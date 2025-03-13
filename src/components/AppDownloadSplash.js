import React from 'react';
import '../styles/AppDownloadSplash.css';

const AppDownloadSplash = () => {
  return (
    <div className="app-splash-container">
      <div className="app-splash-content">
        <div className="app-splash-header">
          <h1 className="app-splash-title">
            <span className="gradient-text">Ez</span>
            <span className="accent-text">Drink</span>
          </h1>
          <p className="app-splash-subtitle">
            The Smart Bar Management App That Increases Revenue by 25%
          </p>
        </div>

        <div className="app-showcase">
          <div className="phone-mockup">
            <div className="phone-frame">
              <div className="phone-screen">
                <img 
                  src="/api/placeholder/280/550" 
                  alt="EzDrink App Interface" 
                  className="app-screenshot"
                />
              </div>
            </div>
          </div>

          <div className="app-features">
            <h2 className="features-title">Revolutionize Your Bar Operations</h2>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="feature-text">
                <h3>30% Less Wait Time</h3>
                <p>Speed up service and increase customer satisfaction</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="feature-text">
                <h3>25% Revenue Boost</h3>
                <p>Optimize operations and maximize your profits</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="feature-text">
                <h3>40% Staff Efficiency</h3>
                <p>Streamline workflows and empower your team</p>
              </div>
            </div>
          </div>
        </div>

        <div className="download-section">
          <h2 className="download-title">Download <span className="gradient-text">Today</span></h2>
          <p className="download-subtitle">Available for iOS and Android devices</p>
          
          <div className="app-store-buttons">
            <a href="#" className="store-button app-store">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="store-icon">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.039-3.903 1.183-4.94 3-.2.039-.43 7.043 3.877 10.98.9 1.351 2.017 2.898 3.523 2.836 1.39-.039 1.945-.895 3.642-.895 1.697 0 2.17.895 3.673.856 1.542-.04 2.523-1.391 3.48-2.742 1.078-1.56 1.5-3.061 1.539-3.143-.04 0-2.971-1.129-3-4.55-.04-2.837 2.327-4.23 2.444-4.268-1.35-1.977-3.442-2.207-4.174-2.246-1.93-.158-3.481 1.04-4.27 1.04l.166-.039z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 3.5c.5-1.396 1.862-2.5 3.5-2.5 1.5 0 2.75 1.104 3.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>App Store</span>
            </a>
            <a href="#" className="store-button play-store">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="store-icon">
                <path d="M6.263 3.309l12.96 7.095a1.537 1.537 0 010 2.693l-12.96 7.095c-1.005.55-2.263-.137-2.263-1.347V4.656c0-1.21 1.258-1.896 2.263-1.347zm0 0L16.05 12l-9.787 8.691" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Google Play</span>
            </a>
          </div>
        </div>

        <div className="testimonial-section">
          <div className="testimonial">
            <div className="testimonial-content">
              "Technology doesn't replace hospitality—it enhances it. When systems work, people can focus on what matters most: creating memorable experiences."
              <div className="testimonial-author">— Danny Meyer, Union Square Hospitality</div>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2 className="cta-title">Ready to Transform Your Bar?</h2>
          <p className="cta-text">Join hundreds of successful bars and restaurants already using EzDrink</p>
          <a href="#" className="cta-button">
            Schedule a Demo →
          </a>
          <p className="guarantee-text">
            30-day money-back guarantee. No long-term contracts.
          </p>
        </div>

        <div className="splash-footer">
          <p className="footer-text">© 2025 EzDrink. All rights reserved.</p>
          <p className="footer-tagline">
            <span className="gradient-text">Ez</span>
            <span className="accent-text">Drink</span> - YOUR FAVORITE BARTENDER'S FAVORITE BARTENDER
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadSplash;