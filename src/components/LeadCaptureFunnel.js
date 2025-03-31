import React, { useState, useEffect } from 'react';
import '../styles/LeadCaptureFunnel.css';
import CashFinderForm from './CashFinderForm';

const LeadCaptureFunnel = ({ isOpen, onClose, onCashFinderSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState('leadForm'); // leadForm, cashFinder, delivery, success
  const [cashFinderData, setCashFinderData] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add state to track if Cash Finder Plus email has been triggered
  const [cashFinderPlusTriggered, setCashFinderPlusTriggered] = useState(false);

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

  const handleLeadFormSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Store data in localStorage
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
      
      // Move to the CashFinderForm
      setCurrentStep('cashFinder');
    }
  };

  // Handler for when the CashFinderForm is submitted
  const handleCashFinderSubmit = (data) => {
    // Save the Cash Finder data
    setCashFinderData(data);
    
    // Move to delivery method selection
    setCurrentStep('delivery');
  };

  const handleDeliveryMethodChange = (e) => {
    setDeliveryMethod(e.target.value);
  };

  // Function to store Cash Finder Plus data for future email
  const triggerCashFinderPlusEmail = (userData) => {
    // Don't trigger if already triggered
    if (cashFinderPlusTriggered) return;
    
    try {
      // Since we're not using an API, we'll store the data in localStorage
      // that another part of your application can use to trigger emails
      const cashFinderPlusQueue = JSON.parse(localStorage.getItem('cash_finder_plus_queue') || '[]');
      
      // Add this user to the queue with a scheduled time (24 hours from now)
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 24);
      
      localStorage.setItem('cash_finder_plus_queue', JSON.stringify([
        ...cashFinderPlusQueue,
        {
          name: userData.name,
          firstName: userData.name.split(' ')[0],
          email: userData.email,
          phone: userData.phone,
          company: userData.company,
          cashFinderData: userData.cashFinderResults,
          scheduledFor: scheduledTime.toISOString(),
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ]));
      
      // Mark as triggered so we don't queue multiple times
      setCashFinderPlusTriggered(true);
      
      console.log('Cash Finder Plus email queued for future delivery');
    } catch (error) {
      console.error('Error queueing Cash Finder Plus email:', error);
    }
  };

  const handleSendResults = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Combine all data
    const completeData = {
      ...formData,
      cashFinderResults: cashFinderData,
      deliveryMethod
    };
    
    try {
      // Here you would make an API call to your backend service
      // For demonstration purposes, we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Sending results via', deliveryMethod, ':', completeData);
      
      // Store in localStorage for demonstration
      localStorage.setItem('pourpal_submission', JSON.stringify({
        ...completeData,
        deliveredAt: new Date().toISOString()
      }));
      
      // Queue Cash Finder Plus email for future sending
      triggerCashFinderPlusEmail(completeData);
      
      // Move to success screen
      setCurrentStep('success');
      
      // After delay, notify parent component and/or close
      setTimeout(() => {
        if (onCashFinderSubmit) {
          onCashFinderSubmit(completeData);
        }
      }, 3000);
    } catch (error) {
      console.error('Error sending results:', error);
      setIsSubmitting(false);
      // You could add error handling here
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'leadForm':
        return (
          <div className="funnel-step">
            <div className="funnel-header">
              <h2 className="funnel-title">
                <span className="gradient-text">Get Your Free Cash Finder Report</span>
              </h2>
              <p className="funnel-subtitle">
                Discover exactly how much more revenue your bar could generate with the right systems in place.
              </p>
            </div>
            
            <form className="funnel-form" onSubmit={handleLeadFormSubmit}>
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
        );
        
      case 'cashFinder':
        return (
          <div className="cash-finder-wrapper">
            <CashFinderForm 
              onSubmit={handleCashFinderSubmit} 
              initialData={formData}
            />
          </div>
        );
        
      case 'delivery':
        return (
          <div className="delivery-wrapper">
            <div className="funnel-header">
              <h2 className="funnel-title">
                <span className="gradient-text">Your Cash Finder Report is Ready!</span>
              </h2>
              <p className="funnel-subtitle">
                How would you like to receive your personalized report?
              </p>
            </div>
            
            <form onSubmit={handleSendResults} className="delivery-form">
              <div className="delivery-options">
                <div className="option">
                  <input 
                    type="radio" 
                    id="email-option" 
                    name="deliveryMethod" 
                    value="email"
                    checked={deliveryMethod === 'email'}
                    onChange={handleDeliveryMethodChange}
                  />
                  <label htmlFor="email-option">
                    Send to my email ({formData.email})
                  </label>
                </div>
                
                <div className="option">
                  <input 
                    type="radio" 
                    id="sms-option" 
                    name="deliveryMethod" 
                    value="sms"
                    checked={deliveryMethod === 'sms'}
                    onChange={handleDeliveryMethodChange}
                  />
                  <label htmlFor="sms-option">
                    Send to my phone ({formData.phone})
                  </label>
                </div>
              </div>
              
              <div className="funnel-footer">
                <button 
                  type="submit" 
                  className="primary-button submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send My Report →'}
                </button>
                <p className="privacy-note">
                  We respect your privacy. Your information will never be sold or shared.
                </p>
              </div>
            </form>
          </div>
        );
        
      case 'success':
        return (
          <div className="success-wrapper">
            <div className="funnel-header">
              <h2 className="funnel-title">
                <span className="gradient-text">Success!</span>
              </h2>
              <p className="funnel-subtitle">
                Your Cash Finder Report has been sent to your {deliveryMethod === 'email' ? 'email' : 'phone'}.
              </p>
            </div>
            
            <div className="success-message">
              <p>Thank you for using our Cash Finder tool. We've sent your personalized report to:</p>
              <p className="delivery-destination">
                {deliveryMethod === 'email' ? formData.email : formData.phone}
              </p>
              <p>If you don't see it within the next few minutes, please check your spam folder or contact our support team.</p>
              
              {/* Add Cash Finder Plus teaser */}
              <p style={{ marginTop: '20px', fontWeight: '500' }}>
                <span style={{ color: '#d4af37' }}>COMING SOON:</span> Keep an eye on your inbox for our exclusive Cash Finder Plus analysis to unlock even more profits through expense reduction!
              </p>
            </div>
            
            <div className="funnel-footer">
              <button 
                onClick={onClose} 
                className="primary-button"
              >
                Close
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="funnel-overlay">
      <div className="funnel-container">
        <button className="close-button" onClick={onClose}>×</button>
        {renderStep()}
      </div>
    </div>
  );
};

export default LeadCaptureFunnel;