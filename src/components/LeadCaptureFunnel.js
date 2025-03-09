import React, { useState, useEffect } from 'react';
import '../styles/LeadCaptureFunnel.css';

const LeadCaptureFunnel = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Disable body scroll when popup is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Bar/Restaurant name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Store data in localStorage for demonstration purposes
      try {
        const existingLeads = JSON.parse(localStorage.getItem('pourpal_leads') || '[]');
        localStorage.setItem('pourpal_leads', JSON.stringify([
          ...existingLeads,
          {
            ...formData,
            submittedAt: new Date().toISOString()
          }
        ]));
      } catch (error) {
        console.error('Error storing lead data:', error);
      }
      
      // Set submitted to true to show the success screen
      setSubmitted(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="funnel-overlay">
      <div className="funnel-container">
        <button className="close-button" onClick={onClose}>×</button>
        
        {submitted ? (
          <div className="success-step">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01l-3-3" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h3 className="funnel-title">
              <span className="gradient-text">Your Bar Efficiency Scorecard is Ready</span>
            </h3>
            
            <p className="funnel-subtitle">
              We'll email your personalized 5-Point Action Plan for immediate revenue growth.
            </p>
            
            <div className="callout-box">
              <h3>Transform Your Bar's Performance</h3>
              <ul className="benefit-list">
                <li>Cut wait times & recapture lost revenue</li>
                <li>Remove payment barriers costing you sales</li>
                <li>Turn casual customers into high-value regulars</li>
              </ul>
            </div>
            
            <div className="testimonial">
              <div className="quote-mark">"</div>
              <p className="quote-text">
                "Technology doesn't replace hospitality—it enhances it. When systems work, people can focus on what matters most: creating memorable experiences."
              </p>
              <p className="quote-author">— Danny Meyer, Union Square Hospitality</p>
            </div>
            
            <div className="guarantee-box">
              <p className="guarantee-text">
                <strong>🔒 No risk:</strong> 30-day money-back guarantee, cancel anytime.
              </p>
            </div>
            
            <a 
              href="https://calendly.com/pourpal/demo" 
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button calendar-button"
            >
              Book Your 15-Min Demo → Limited Slots
            </a>
            
            <button 
              className="close-text-button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="funnel-step">
            <div className="funnel-header">
              <h2 className="funnel-title">
                <span className="gradient-text">Get Your Free Bar Efficiency Scorecard</span>
              </h2>
              <p className="funnel-subtitle">
                Discover exactly how much more revenue your bar could generate with the right systems in place.
              </p>
            </div>
            
            <form className="funnel-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@yourbar.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="company">Bar/Restaurant Name *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="The Tipsy Tavern"
                  className={errors.company ? 'error' : ''}
                />
                {errors.company && <span className="error-message">{errors.company}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Anything specific you'd like to know?</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your current challenges or what you'd like to improve..."
                  rows="3"
                />
              </div>
              
              <div className="benefits-highlights">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="benefit-text">
                    <h4>Increased Revenue</h4>
                    <p>Average 25% boost</p>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="benefit-text">
                    <h4>Reduced Wait</h4>
                    <p>30% less wait time</p>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="benefit-text">
                    <h4>Staff Efficiency</h4>
                    <p>40% productivity</p>
                  </div>
                </div>
              </div>
              
              <div className="funnel-footer">
                <button type="submit" className="primary-button submit-button">
                  Get Your Free Efficiency Scorecard →
                </button>
                <p className="privacy-note">
                  We respect your privacy. Your information will never be sold or shared.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCaptureFunnel;