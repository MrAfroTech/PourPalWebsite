import React, { useState, useEffect } from 'react';
import '../styles/LeadCaptureFunnel.css';

const LeadCaptureFunnel = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  // Debug rendering
  useEffect(() => {
    console.log("LeadCaptureFunnel rendered, isOpen:", isOpen);
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
      newErrors.company = 'Company name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Here you would typically send the data to your backend or CRM
      console.log('Form submitted:', formData);
      
      // Close the form
      onClose();
      
      // You might want to show a success message
      alert('Thank you for your submission! We will contact you shortly.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="funnel-overlay">
      <div className="funnel-container">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="funnel-header">
          <h2 className="funnel-title">
            <span className="gradient-text">See How Much You'll</span>
            <span className="accent-text"> Earn with PourPal</span>
          </h2>
          <p className="funnel-subtitle">
            Fill out the form below to discover how PourPal can transform your bar's operations and increase your revenue.
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
              rows="4"
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
                <p>Average 25% boost in sales</p>
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
                <h4>Reduced Wait Times</h4>
                <p>30% less customer wait time</p>
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
                <p>40% boost in productivity</p>
              </div>
            </div>
          </div>
          
          <div className="funnel-footer">
            <button type="submit" className="primary-button submit-button">
              Get Your Free Profit Analysis →
            </button>
            <p className="privacy-note">
              We respect your privacy. Your information will never be sold or shared.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadCaptureFunnel;