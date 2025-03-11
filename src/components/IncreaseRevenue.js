import React, { useEffect } from 'react';
import '../styles/ContentPage.css';

const IncreaseRevenue = () => {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Fade in animation for elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('visible');
      }, 100 + (index * 150));
    });
  }, []);

  return (
    <div className="content-page">
      <div className="page-header">
        <div className="gradient-overlay"></div>
        <div className="header-content">
          <h1 className="fade-in">Unlock Hidden Revenue in Your Bar</h1>
          <p className="fade-in">Turn Every Guest into Your Most Valuable Customer</p>
        </div>
      </div>
      
      <div className="page-container">
        <section className="content-section fade-in">
          <h2>What&apos;s Holding Your Bar Back From <span className="highlight">30% More Revenue</span>?</h2>
          <p className="intro-text">
            Bar owners nationwide are discovering an uncomfortable truth: traditional service models leave thousands of dollars on the table every night. Long lines, overwhelmed staff, and missed upsell opportunities are silently stealing your profits.
          </p>
          
          <div className="grid-layout">
            <div className="grid-item">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Line Abandonment = Lost Sales</h3>
              <p>15% of potential customers leave without ordering when wait times exceed 7 minutes. EzDrink eliminates the line entirely, capturing revenue that would otherwise walk out the door.</p>
            </div>
            
            <div className="grid-item">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Upsell Every Customer, Every Time</h3>
              <p>Bartenders can&apos;t consistently recommend premium spirits during rush hour. EzDrink&apos;s AI never forgets to suggest that $4 upgrade to top-shelf, generating 22% higher average checks.</p>
            </div>
            
            <div className="grid-item">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Turn One-Drink Customers Into Three-Drink Fans</h3>
              <p>When reordering is effortless, customers order 1.8 more drinks per visit. EzDrink&apos;s frictionless experience means guests keep ordering, not waiting.</p>
            </div>
          </div>
        </section>
        
        <section className="content-section fade-in">
          <h2>The Cold, Hard Revenue Numbers</h2>
          
          <div className="stats-container">
            <div className="stat-box">
              <h3>$47,000+</h3>
              <p>Average annual revenue increase for bars using EzDrink</p>
            </div>
            
            <div className="stat-box">
              <h3>33%</h3>
              <p>Higher tips for staff due to increased volume and check sizes</p>
            </div>
            
            <div className="stat-box">
              <h3>19.6%</h3>
              <p>More repeat customers from improved experience</p>
            </div>
          </div>
          
          <blockquote className="testimonial">
            &quot;We implemented EzDrink six months ago and our revenue is up 32%. The ROI was immediate—our customers love ordering from their phones and our bartenders can focus on making drinks rather than taking orders.&quot;
            <cite>— Mike T., Owner, The Crafty Pint</cite>
          </blockquote>
        </section>
        
        <section className="content-section fade-in">
          <h2>How EzDrink Turns Efficiency Into Revenue</h2>
          
          <div className="feature-list">
            <div className="feature-item">
              <h3>Multi-Location Virtual Ordering</h3>
              <p>Customers can order from anywhere in your venue—no more waiting at the bar. When physical bar space isn&apos;t your bottleneck, sales increase naturally.</p>
            </div>
            
            <div className="feature-item">
              <h3>AI-Powered Recommendation Engine</h3>
              <p>Our system learns what sells and suggests high-margin options customers actually want. It&apos;s like having your best salesperson handle every transaction.</p>
            </div>
            
            <div className="feature-item">
              <h3>Strategic Bundle Offers</h3>
              <p>Create irresistible packages that boost average check size by 30%. EzDrink dynamically suggests bundles based on order history and inventory.</p>
            </div>
            
            <div className="feature-item">
              <h3>Intelligent Rush Hour Management</h3>
              <p>Turn peak hours from chaos into your most profitable time. When lines disappear, every potential sale becomes actual revenue.</p>
            </div>
            
            <div className="feature-item">
              <h3>Customer Loyalty Integration</h3>
              <p>Automatically track visits and purchases to reward regulars. Loyal customers spend 67% more than new customers—EzDrink helps you build that loyalty.</p>
            </div>
          </div>
        </section>
        
        <section className="content-section cta-section fade-in">
          <h2>Ready to Unlock Your Bar&apos;s Revenue Potential?</h2>
          <p>Join hundreds of forward-thinking bar owners who&apos;ve transformed their businesses with EzDrink.</p>
          <div className="cta-buttons">
            <button className="primary-button large">Get Your Free Revenue Analysis</button>
            <button className="secondary-button large">Watch Demo</button>
          </div>
          <p className="guarantee">30-day money-back guarantee. No long-term contracts.</p>
        </section>
      </div>
    </div>
  );
};

export default IncreaseRevenue;