import React, { useState } from 'react';
import '../styles/ContactSection.css';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'bar_owner', // Default value
    message: ''
  });
  
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null }
  });
  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setStatus(prevStatus => ({ ...prevStatus, submitting: true }));
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus({
          submitted: true,
          submitting: false,
          info: { error: false, msg: data.message }
        });
        setFormData({
          name: '',
          email: '',
          type: 'bar_owner',
          message: ''
        });
      } else {
        setStatus({
          submitted: false,
          submitting: false,
          info: { error: true, msg: data.message }
        });
      }
    } catch (error) {
      setStatus({
        submitted: false,
        submitting: false,
        info: { error: true, msg: 'An error occurred. Please try again later.' }
      });
    }
  };
  
  return (
    <section id="contact" className="contact-section">
      <div className="section-header">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">Interested in EzDrink? Let's talk about how we can help your business.</p>
      </div>
      
      <div className="contact-container">
        <div className="contact-info">
          <div className="contact-info-item">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="contact-text">
              <h4>Business Hours</h4>
              <p>Monday-Friday: 9am-6pm ET</p>
            </div>
          </div>
          
          <div className="contact-info-item">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L22 12" stroke="currentColor" strokeWidth="2"/>
                <path d="M8.5 21.5V2.5" stroke="currentColor" strokeWidth="2"/>
                <path d="M15.5 21.5V2.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="contact-text">
              <h4>Our Office</h4>
              <p>Orlando, Florida</p>
            </div>
          </div>
          
          <div className="contact-info-item">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 5.5C21 14.0604 14.0604 21 5.5 21C5.5 21 3 21 3 18.5C3 16 5.5 13.5 7.5 13.5C8.36255 13.5 9.5 14.0272 10.0272 14.5544C10.5544 15.0815 13.5 18.5 13.5 18.5" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 5.5C14 8.53757 11.5376 11 8.5 11C5.46243 11 3 8.53757 3 5.5C3 2.46243 5.46243 0 8.5 0C11.5376 0 14 2.46243 14 5.5Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="contact-text">
              <h4>Phone</h4>
              <p>(123) 456-7890</p>
            </div>
          </div>
          
          <div className="contact-info-item">
            <div className="contact-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 8.5V15.5C22 19 20 20.5 17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="contact-text">
              <h4>Email</h4>
              <p>hello@EzDrink.store</p>
            </div>
          </div>
        </div>
        
        <div className="contact-form-container">
          {status.submitted ? (
            <div className="form-success">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Thank you for reaching out!</h3>
              <p>We've received your message and will get back to you shortly.</p>
              <button 
                className="primary-button"
                onClick={() => setStatus(prevStatus => ({ ...prevStatus, submitted: false }))}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-header">
                <h3>Send us a message</h3>
                <p>Fill out the form below and we'll be in touch soon</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">I am a:</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="bar_owner">Bar Owner/Manager</option>
                  <option value="customer">Customer</option>
                  <option value="investor">Investor</option>
                  <option value="partnership">Partnership Opportunity</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              {status.info.error && (
                <div className="form-error">
                  <p>{status.info.msg}</p>
                </div>
              )}
              
              <button 
                type="submit" 
                className="primary-button submit-button"
                disabled={status.submitting}
              >
                {status.submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;