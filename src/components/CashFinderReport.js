import React from 'react';
import './CashFinderReport.css';

const CashFinderReport = ({ reportData }) => {
  // Destructure all the data passed from the form
  const {
    name,
    email,
    phone,
    barName,
    averageRevenue,
    casesPurchased,
    bestNightRevenue,
    peakOpportunity,
    inventoryOpportunity,
    totalOpportunity
  } = reportData;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h1 className="report-title">
          <span className="gradient-text">Ez</span>
          <span className="accent-text">Drink</span> Cash Finder Report
        </h1>
        <p className="report-subtitle">
          Personalized Revenue Opportunities for {barName}
        </p>
      </div>

      <div className="report-section">
        <h2 className="section-title">Your Bar Metrics</h2>
        <p className="section-intro">
          Based on the information you provided, we've analyzed your bar's performance:
        </p>

        <div className="metrics-box">
          <div className="metric">
            <span className="metric-label">Average Night's Revenue:</span>
            <span className="metric-value">{formatCurrency(averageRevenue)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Cases Purchased Per Week:</span>
            <span className="metric-value">{casesPurchased} cases</span>
          </div>
          <div className="metric">
            <span className="metric-label">Best Night Revenue Total:</span>
            <span className="metric-value">{formatCurrency(bestNightRevenue)}</span>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h2 className="section-title">Cash Finder Opportunities</h2>
        <p className="section-intro">
          Our analysis has identified several areas where your bar could be capturing more revenue:
        </p>

        <div className="opportunity">
          <h3 className="opportunity-title">
            <span className="accent-text">30% Less Wait Time</span> - Untapped Peak Sales Potential
          </h3>
          <p>Based on your best night's performance vs. average night, we estimate you're missing:</p>
          <div className="opportunity-value">{formatCurrency(peakOpportunity)}/month</div>
          <p>
            Our systems can help you maximize revenue during busy periods by increasing service speed and reducing friction points.
          </p>
        </div>

        <div className="opportunity">
          <h3 className="opportunity-title">
            <span className="accent-text">25% Revenue Increase</span> - Inventory Optimization
          </h3>
          <p>Based on your weekly case purchases, we estimate potential savings of:</p>
          <div className="opportunity-value">{formatCurrency(inventoryOpportunity)}/month</div>
          <p>
            Our inventory management system reduces waste and over-ordering while ensuring you never run out of high-margin items.
          </p>
        </div>

        <div className="opportunity">
          <h3 className="opportunity-title">
            <span className="accent-text">40% Staff Efficiency</span> - Total Cash Finder Opportunity
          </h3>
          <p>
            By implementing EzDrink's bar management system, your estimated annual revenue increase:
          </p>
          <div className="opportunity-value">{formatCurrency(totalOpportunity)}/year</div>
          <p>
            This represents a significant ROI opportunity that goes straight to your bottom line.
          </p>
        </div>
      </div>

      <div className="report-section">
        <h2 className="section-title">Next Steps: Your 15-Minute Cash Finder Session</h2>
        <p className="section-intro">
          Let us walk you through your personalized action plan in a quick, no-pressure consultation:
        </p>
        <ul className="next-steps-list">
          <li>Review your complete Cash Finder Report with exact numbers</li>
          <li>Get a custom implementation plan for your specific bar</li>
          <li>See how other bars like yours increased revenue by 25%+</li>
        </ul>

        <a href="https://calendly.com/team-ezdrink" className="cta-button">
          Tap In: Book Your 15-Min Cash Finder Call →
        </a>

        <p className="guarantee-text">
          Spots are limited. No obligation. 30-day money-back guarantee on any system you choose to implement.
        </p>
      </div>

      <div className="testimonial">
        <div className="testimonial-content">
          "Technology doesn't replace hospitality—it enhances it. When systems work, people can focus on what matters most: creating memorable experiences."
          <div className="testimonial-author">— Danny Meyer, Union Square Hospitality</div>
        </div>
      </div>

      <div className="report-footer">
        <p className="footer-text">© 2025 EzDrink. All rights reserved.</p>
        <p className="footer-tagline">
          <span className="gradient-text">Ez</span>
          <span className="accent-text">Drink</span> - YOUR FAVORITE BARTENDER'S FAVORITE BARTENDER
        </p>
      </div>
    </div>
  );
};

export default CashFinderReport;