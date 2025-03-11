import React, { useEffect } from 'react';
import '../styles/ContentPage.css';

const ReduceExpenses = () => {
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
      <div className="page-header dark">
        <div className="gradient-overlay"></div>
        <div className="header-content">
          <h1 className="fade-in">Cut Costs, Not Corners</h1>
          <p className="fade-in">How Smart Bars Slash Expenses While Improving Service</p>
        </div>
      </div>
      
      <div className="page-container">
        <section className="content-section fade-in">
          <h2>The Hidden Costs Draining Your Bar&apos;s Profits</h2>
          <p className="intro-text">
            While you&apos;re focused on bringing customers through the door, invisible inefficiencies are silently eating away at your margins. The average bar loses 23% of potential profit to operational waste that could be eliminated overnight.
          </p>
          
          <div className="grid-layout">
            <div className="grid-item">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Over-Staffing Bleeding Your Payroll</h3>
              <p>Bars routinely over-staff &quot;just in case,&quot; adding 15-20% to labor costs. EzDrink&apos;s efficiency means you need fewer staff to serve more customers, cutting labor costs by 22% on average.</p>
            </div>
            
            <div className="grid-item">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 2v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Inventory Shrinkage &amp; Waste</h3>
              <p>The industry average for alcohol waste is 23% between overEzing, spills, and theft. EzDrink&apos;s precise inventory management and digital ordering reduces waste to under 7%, saving thousands monthly.</p>
            </div>
            
            <div className="grid-item">
              <div className="icon-container">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>The Hidden Cost of Errors</h3>
              <p>Incorrect orders waste product and create customer dissatisfaction. Digital ordering through EzDrink eliminates these costly mistakes, saving 8-12% in remake expenses.</p>
            </div>
          </div>
        </section>
        
        <section className="content-section fade-in">
          <h2>Real Savings, Real Results</h2>
          
          <div className="stats-container">
            <div className="stat-box">
              <h3>$2,843</h3>
              <p>Average monthly savings on labor costs</p>
            </div>
            
            <div className="stat-box">
              <h3>$1,976</h3>
              <p>Average monthly reduction in inventory waste</p>
            </div>
            
            <div className="stat-box">
              <h3>34%</h3>
              <p>Lower training costs with intuitive systems</p>
            </div>
          </div>
          
          <blockquote className="testimonial">
            &quot;EzDrink paid for itself in the first month just through reduced waste. We&apos;re saving about $5,000 monthly between labor optimization and inventory control, while actually improving our service quality.&quot;
            <cite>— Sarah K., Operations Manager, Urban Spirits</cite>
          </blockquote>
        </section>
        
        <section className="content-section fade-in">
          <h2>How EzDrink Transforms Expenses Into Profits</h2>
          
          <div className="feature-list">
            <div className="feature-item">
              <h3>Smart Staff Allocation</h3>
              <p>EzDrink&apos;s AI predicts busy periods with 94% accuracy, allowing precise staffing. No more paying 8 people when you only need 5.</p>
            </div>
            
            <div className="feature-item">
              <h3>Real-Time Inventory Tracking</h3>
              <p>Know exactly what&apos;s being used and when. Automatic alerts prevent over-ordering and reduce theft by creating clear accountability.</p>
            </div>
            
            <div className="feature-item">
              <h3>Automated Ordering &amp; Verification</h3>
              <p>Eliminate costly order mistakes with digital order verification. Customers get exactly what they ordered, every time, with zero wastage.</p>
            </div>
            
            <div className="feature-item">
              <h3>Reduced Training Costs</h3>
              <p>EzDrink&apos;s intuitive system reduces training time by 60%. New staff become productive faster with less supervision required.</p>
            </div>
            
            <div className="feature-item">
              <h3>Minimize Comped Drinks</h3>
              <p>Clear digital ordering reduces the &quot;I didn&apos;t order this&quot; scenario by 94%, virtually eliminating costly comped drinks and dissatisfied customers.</p>
            </div>
          </div>
        </section>
        
        <section className="content-section dark-section fade-in">
          <h2>The Hidden Math: Small Savings Compound</h2>
          
          <div className="cost-calculator">
            <div className="calculator-row">
              <div className="calculation">
                <h4>Labor Optimization</h4>
                <p>Reduce staffing needs by just 1 person per shift = $15/hr × 8 hrs × 30 days</p>
              </div>
              <div className="calculation-result">
                <p>$3,600 monthly savings</p>
              </div>
            </div>
            
            <div className="calculator-row">
              <div className="calculation">
                <h4>Inventory Waste Reduction</h4>
                <p>Reduce Ez waste by just 10% on $20,000 monthly alcohol inventory</p>
              </div>
              <div className="calculation-result">
                <p>$2,000 monthly savings</p>
              </div>
            </div>
            
            <div className="calculator-row">
              <div className="calculation">
                <h4>Error Elimination</h4>
                <p>Eliminate just 5 remade drinks per night at $12 average</p>
              </div>
              <div className="calculation-result">
                <p>$1,800 monthly savings</p>
              </div>
            </div>
            
            <div className="calculator-total">
              <h3>Potential Monthly Savings: $7,400</h3>
              <p>That&apos;s $88,800 in additional profit per year</p>
            </div>
          </div>
        </section>
        
        <section className="content-section cta-section fade-in">
          <h2>Stop Leaving Money on the Table</h2>
          <p>Join the bar owners who&apos;ve transformed cost centers into profit centers with EzDrink.</p>
          <div className="cta-buttons">
            <button className="primary-button large">Get Your Free Cost Analysis</button>
            <button className="secondary-button large">Schedule Demo</button>
          </div>
          <p className="guarantee">Typical ROI within 41 days. Full implementation in under a week.</p>
        </section>
      </div>
    </div>
  );
};

export default ReduceExpenses;